import { noop, try_on_destroy, unstore } from "svelteshareds"

import { supported } from "../supported"

import type { ConfigurableWindow } from "../_configurable"

export interface IntersectionObserverOptions extends ConfigurableWindow {
	/**
	 * The Element or Document whose bounds are used as the bounding box when testing for intersection.
	 */
	root?: HTMLElement | SVGElement | undefined | null

	/**
	 * A string which specifies a set of offsets to add to the root's bounding_box when calculating intersections.
	 */
	root_margin?: string

	/**
	 * Either a single number or an array of numbers between 0.0 and 1.
	 */
	threshold?: number | number[]
}

/**
 * Detects that a target element's visibility.
 *
 * @param target
 * @param callback
 * @param options
 */
export function intersection_observer(
	target: HTMLElement | SVGElement | undefined | null,
	callback: IntersectionObserverCallback,
	options: IntersectionObserverOptions = {}
) {
	const { root, root_margin = "0px", threshold = 0.1 } = options

	const is_supported = supported("IntersectionObserver", { from: "window" })

	let cleanup = noop

	if (unstore(is_supported)) {
		if (!target) return
		cleanup()

		const observer = new IntersectionObserver(callback, {
			root,
			rootMargin: root_margin,
			threshold,
		})

		observer.observe(target)

		cleanup = () => {
			observer.unobserve(target)
			observer.disconnect()
		}
	}

	try_on_destroy(cleanup)

	return {
		is_supported,
		cleanup,
	}
}

// alias
export { intersection_observer as intersectionObserver }
