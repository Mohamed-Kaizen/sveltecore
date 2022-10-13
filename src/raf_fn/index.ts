import { onDestroy } from "svelte"
import { to_readable, to_writable, unstore } from "svelteshareds"

import { default_window as window } from "../_configurable"

import type { Fn, Pauseable } from "svelteshareds"

export interface RafFnOptions {
	/**
	 * Start the requestAnimationFrame loop immediately on creation
	 *
	 * @default true
	 */
	immediate?: boolean
}

/**
 * Call function on every `requestAnimationFrame`. With controls of pausing and resuming.
 *
 * @param fn
 * @param options
 */
export function raf_fn(fn: Fn, options: RafFnOptions = {}): Pauseable {
	const { immediate = true } = options

	const active = to_writable(false)

	let raf_id: null | number = null

	function loop() {
		if (!unstore(active) || !window) return

		fn()
		raf_id = window.requestAnimationFrame(loop)
	}

	function resume() {
		if (!unstore(active) && window) {
			active.set(true)
			loop()
		}
	}

	function pause() {
		active.set(false)
		if (raf_id != null && window) {
			window.cancelAnimationFrame(raf_id)
			raf_id = null
		}
	}

	if (immediate) resume()

	onDestroy(pause)

	return {
		isActive: to_readable(active),
		pause,
		resume,
	}
}

// alias
export { raf_fn as rafFn }
