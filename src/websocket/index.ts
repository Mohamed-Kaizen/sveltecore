import { onDestroy } from "svelte"
import {
	interval_fn,
	is_client,
	to_readable,
	to_writable,
	unstore,
} from "svelteshareds"

import { event_listener } from "../event_listener"

import type { Readable } from "svelte/store"
import type { Fn } from "svelteshareds"

export type WebSocketStatus = "OPEN" | "CONNECTING" | "CLOSED"

const DEFAULT_PING_MESSAGE = "ping"

export interface WebSocketOptions {
	on_connected?: (ws: WebSocket) => void

	on_disconnected?: (ws: WebSocket, event: CloseEvent) => void

	on_error?: (ws: WebSocket, event: Event) => void

	on_message?: (ws: WebSocket, event: MessageEvent) => void

	/**
	 * Send heartbeat for every x milliseconds passed
	 *
	 * @default false
	 */
	heartbeat?:
		| boolean
		| {
				/**
				 * Message for the heartbeat
				 *
				 * @default 'ping'
				 */
				message?: string | ArrayBuffer | Blob

				/**
				 * Interval, in milliseconds
				 *
				 * @default 1000
				 */
				interval?: number

				/**
				 * Heartbeat response timeout, in milliseconds
				 *
				 * @default 1000
				 */
				pong_timeout?: number
		  }

	/**
	 * Enabled auto reconnect
	 *
	 * @default false
	 */
	auto_reconnect?:
		| boolean
		| {
				/**
				 * Maximum retry times.
				 *
				 * Or you can pass a predicate function (which returns true if you want to retry).
				 *
				 * @default -1
				 */
				retries?: number | (() => boolean)

				/**
				 * Delay for reconnect, in milliseconds
				 *
				 * @default 1000
				 */
				delay?: number

				/**
				 * On maximum retry times reached.
				 */
				on_failed?: Fn
		  }

	/**
	 * Automatically open a connection
	 *
	 * @default true
	 */
	immediate?: boolean

	/**
	 * Automatically close a connection
	 *
	 * @default true
	 */
	auto_close?: boolean

	/**
	 * List of one or more sub-protocol strings
	 *
	 * @default []
	 */
	protocols?: string[]
}

export interface WebSocketReturn<T> {
	/**
	 * Reference to the latest data received via the websocket,
	 * can be watched to respond to incoming messages
	 */
	data: Readable<T | null>

	/**
	 * The current websocket status, can be only one of:
	 * 'OPEN', 'CONNECTING', 'CLOSED'
	 */
	status: Readable<WebSocketStatus>

	/**
	 * Closes the websocket connection gracefully.
	 */
	close: WebSocket["close"]

	/**
	 * Reopen the websocket connection.
	 * If there the current one is active, will close it before opening a new one.
	 */
	open: Fn

	/**
	 * Sends data through the websocket connection.
	 *
	 * @param data
	 * @param buffer when the socket is not yet open, store the data into the buffer and sent them one connected. Default to true.
	 */
	send: (data: string | ArrayBuffer | Blob, buffer?: boolean) => boolean

	/**
	 * Reference to the WebSocket instance.
	 */
	ws: Readable<WebSocket | undefined>
}

function resolve_nested_options<T>(options: T | true): T {
	if (options === true) return {} as T
	return options
}
/**
 * Reactive WebSocket client.
 *
 * @param url
 */
export function websocket<Data = any>(
	url: string,
	options: WebSocketOptions = {}
): WebSocketReturn<Data> {
	const {
		on_connected,
		on_disconnected,
		on_error,
		on_message,
		immediate = true,
		auto_close = true,
		protocols = [],
	} = options
	const data = to_writable<Data | null>(null)

	const status = to_writable<WebSocketStatus>("CLOSED")

	const ws_store = to_writable<WebSocket | undefined>(undefined)

	let heartbeat_pause: Fn | undefined

	let heartbeat_resume: Fn | undefined

	let explicitly_closed = false

	let retried = 0

	let buffered_data: (string | ArrayBuffer | Blob)[] = []

	let pong_timeout_wait: ReturnType<typeof setTimeout>

	// Status code 1000 -> Normal Closure https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
	function close(code = 1000, reason?: string | undefined) {
		if (!unstore(ws_store)) return

		explicitly_closed = true

		heartbeat_pause?.()

		unstore(ws_store)?.close(code, reason)
	}

	function _send_buffer() {
		if (
			buffered_data.length &&
			unstore(ws_store) &&
			unstore(status) === "OPEN"
		) {
			for (const buffer of buffered_data) unstore(ws_store)?.send(buffer)

			buffered_data = []
		}
	}

	function reset_hearbeat() {
		clearTimeout(pong_timeout_wait)
	}

	function send(data: string | ArrayBuffer | Blob, buffer = true) {
		if (!unstore(ws_store) || unstore(status) !== "OPEN") {
			if (buffer) buffered_data = [...buffered_data, data]
			return false
		}

		_send_buffer()

		unstore(ws_store)?.send(data)

		return true
	}

	function _init() {
		const ws = new WebSocket(url, protocols)

		ws_store.set(ws)

		status.set("CONNECTING")

		explicitly_closed = false

		ws.onopen = () => {
			status.set("OPEN")

			on_connected?.(ws)

			heartbeat_resume?.()

			_send_buffer()
		}

		ws.onclose = (event) => {
			status.set("CLOSED")

			ws_store.set(undefined)

			on_disconnected?.(ws, event)

			if (!explicitly_closed && options.auto_reconnect) {
				const {
					retries = -1,
					delay = 1000,
					on_failed,
				} = resolve_nested_options(options.auto_reconnect)
				retried += 1
				if (
					typeof retries === "number" &&
					(retries < 0 || retried < retries)
				)
					setTimeout(_init, delay)
				else if (typeof retries === "function" && retries())
					setTimeout(_init, delay)
				else on_failed?.()
			}
		}

		ws.onerror = (event) => {
			on_error?.(ws, event)
		}

		ws.onmessage = (event) => {
			reset_hearbeat()

			// Heartbeat response will be skipped
			if (options.heartbeat) {
				const { message = DEFAULT_PING_MESSAGE } =
					resolve_nested_options(options.heartbeat)
				if (event.data === message) return
			}

			data.set(event.data)

			on_message?.(ws, event)
		}
	}

	if (options.heartbeat) {
		const {
			message = DEFAULT_PING_MESSAGE,
			interval = 1000,
			pong_timeout = 1000,
		} = resolve_nested_options(options.heartbeat)

		const { pause, resume } = interval_fn(
			() => {
				send(message, false)
				pong_timeout_wait = setTimeout(() => {
					// auto-reconnect will be trigger with ws.onclose()
					close()
				}, pong_timeout)
			},
			interval,
			{ immediate: false }
		)

		heartbeat_pause = pause

		heartbeat_resume = resume
	}

	if (immediate && typeof WebSocket !== "undefined") _init()

	if (auto_close) {
		if (is_client) event_listener(window, "beforeunload", () => close())

		onDestroy(close)
	}

	function open() {
		if (unstore(status) !== "CLOSED") close()
		retried = 0
		_init()
	}

	return {
		data: to_readable(data),
		status: to_readable(status),
		close,
		send,
		open,
		ws: to_readable(ws_store),
	}
}
