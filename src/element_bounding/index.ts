import { to_writable } from "svelteshareds"

import { default_window as window } from "../_configurable"
import { event_listener } from "../event_listener"
import { resize_observer } from "../resize_observer"

export interface ElementBoundingOptions {
	/**
	 * Reset values to 0 on component unmounted
	 *
	 * @default true
	 */
	reset?: boolean

	/**
	 * Listen to window resize event
	 *
	 * @default true
	 */
	window_resize?: boolean
	/**
	 * Listen to window scroll event
	 *
	 * @default true
	 */
	window_scroll?: boolean

	/**
	 * Immediately call update on component mounted
	 *
	 * @default true
	 */
	immediate?: boolean
}

/**
 * Reactive bounding box of an HTML element.
 *
 * @param target
 */
export function element_bounding(
	target: HTMLElement | SVGElement | undefined | null,
	options: ElementBoundingOptions = {}
) {
	const {
		reset = true,
		window_resize = true,
		window_scroll = true,
		immediate = true,
	} = options

	const height = to_writable(0)

	const bottom = to_writable(0)

	const left = to_writable(0)

	const right = to_writable(0)

	const top = to_writable(0)

	const width = to_writable(0)

	const x = to_writable(0)

	const y = to_writable(0)

	function update() {
		if (!target) {
			if (reset) {
				height.set(0)

				bottom.set(0)

				left.set(0)

				right.set(0)

				top.set(0)

				width.set(0)

				x.set(0)

				y.set(0)
			}
			return
		}

		const rect = target.getBoundingClientRect()

		height.set(rect.height)

		bottom.set(rect.bottom)

		left.set(rect.left)

		right.set(rect.right)

		top.set(rect.top)

		width.set(rect.width)

		x.set(rect.x)

		y.set(rect.y)
	}

	resize_observer(target, update)

	if (window_scroll) event_listener("scroll", update, { passive: true })

	if (window_resize) event_listener("resize", update, { passive: true })

	if (window && immediate) update()

	return {
		height,
		bottom,
		left,
		right,
		top,
		width,
		x,
		y,
		update,
	}
}

// alias
export { element_bounding as elementBounding }
