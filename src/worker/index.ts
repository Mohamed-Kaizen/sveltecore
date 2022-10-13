import { onDestroy } from "svelte"
import { to_readable, to_writable, unstore } from "svelteshareds"

import { default_window as window } from "../_configurable"

import type { Readable } from "svelte/store"

export interface WebWorkerReturn<Data = any> {
	data: Readable<Data>
	error: Readable<Data>
	post: typeof Worker.prototype["postMessage"]
	terminate: () => void
	wk: Readable<Worker | undefined>
}

/**
 * Simple Web Workers registration and communication.
 *
 * @param url
 * @param workerOptions
 */
export function worker<Data>(
	url: string,
	options?: WorkerOptions
): WebWorkerReturn<Data> {
	const data = to_writable<any>(null)

	const error = to_writable<any>(null)

	const wk = to_writable<Worker | undefined>(undefined)

	const post: typeof Worker.prototype["postMessage"] = function post(
		val: Data
	) {
		const _wk = unstore(wk)
		if (!_wk) return

		_wk.postMessage(val)
	}

	const terminate: typeof Worker.prototype["terminate"] =
		function terminate() {
			const _wk = unstore(wk)
			if (!_wk) return

			_wk.terminate()
		}

	if (window) {
		wk.set(new Worker(url, options))

		const _wk = unstore(wk)

		const unsubscribe = wk.subscribe((val) => {
			if (!val) return

			val.onmessage = (e: MessageEvent) => {
				data.set(e.data)
			}

			val.onerror = (e: ErrorEvent) => {
				error.set(e.error)
			}
		})
		onDestroy(() => {
			_wk?.terminate()
			unsubscribe()
		})
	}

	return {
		data: to_readable(data),
		error: to_readable(error),
		post,
		terminate,
		wk: to_readable(wk),
	}
}
