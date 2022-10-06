import { try_on_destroy, unstore } from "svelteshareds"

import { supported } from "../supported"

import type { ConfigurableWindow } from "../_configurable"

export interface MutationObserverOptions
	extends MutationObserverInit,
		ConfigurableWindow {}

/**
 * Watch for changes being made to the DOM tree.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver MutationObserver MDN
 * @param target
 * @param callback
 * @param options
 */
export function mutation_observer(
	target: HTMLElement | SVGElement | undefined | null,
	callback: MutationCallback,
	options: MutationObserverOptions = {}
) {
	const { ...mutationOptions } = options

	let observer: MutationObserver | undefined

	const is_supported = supported("MutationObserver", { from: "window" })

	const cleanup = () => {
		if (observer) {
			observer.disconnect()
			observer = undefined
		}
	}

	if (unstore(is_supported)) {
		if (!target) return

		cleanup()

		observer = new MutationObserver(callback)

		observer.observe(target, mutationOptions)
	}

	try_on_destroy(cleanup)

	return {
		is_supported,
		cleanup,
	}
}

// alias
export { mutation_observer as mutationObserver }
