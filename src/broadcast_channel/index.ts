import {
	is_client,
	to_readable,
	to_writable,
	try_on_destroy,
	unstore,
} from "svelteshareds"

import { event_listener } from "../event_listener"
import { supported } from "../supported"

import type { Readable } from "svelte/store"

export interface BroadcastChannelOptions {
	/**
	 * The name of the channel.
	 * @default ""
	 */
	name?: string
}

export interface BroadcastChannelReturn<D, P> {
	is_supported: Readable<boolean>

	channel: Readable<BroadcastChannel | undefined>

	data: Readable<D | undefined>

	post: (data: P) => void

	close: () => void
	error: Readable<Event | null>

	is_closed: Readable<boolean>
}

/**
 * Reactive BroadcastChannel
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel
 * @param options
 *
 */
export const broadcast_channel = <D, P>(
	options: BroadcastChannelOptions = {}
): BroadcastChannelReturn<D, P> => {
	const { name = "" } = options

	const is_supported = supported("BroadcastChannel", { from: "window" })
	const is_closed = to_writable(false)

	const channel = to_writable<BroadcastChannel | undefined>(undefined)
	const data = to_writable(undefined)
	const error = to_writable<Event | null>(null)

	const post = (data: unknown) => {
		unstore(channel)?.postMessage(data)
	}

	const close = () => {
		unstore(channel)?.close()
		is_closed.set(true)
	}

	if (unstore(is_supported)) {
		if (is_client) {
			error.set(null)
			channel.set(new BroadcastChannel(name))
			event_listener(
				unstore(channel),
				"message",
				(event: MessageEvent) => {
					data.set(event.data)
				},
				{ passive: true }
			)

			event_listener(
				unstore(channel),
				"messageerror",
				(event: Event) => {
					error.set(event)
				},
				{ passive: true }
			)

			event_listener(
				unstore(channel),
				"close",
				() => {
					is_closed.set(true)
				},
				{ passive: true }
			)
		}
	}

	try_on_destroy(close)

	return {
		is_supported,
		channel: to_readable(channel),
		data: to_readable(data),
		post,
		close,
		error: to_readable(error),
		is_closed: to_readable(is_closed),
	}
}

// alias
export { broadcast_channel as broadcastChannel }
