import { to_readable, to_writable } from "svelteshareds"

import { default_window as window } from "../_configurable"
import { event_listener } from "../event_listener"

import type { ConfigurableEventFilter } from "svelteshareds"

export interface Position {
	x: number
	y: number
}

export interface MouseOptions extends ConfigurableEventFilter {
	/**
	 * Mouse position based by page or client
	 *
	 * @default 'page'
	 */
	type?: "page" | "client"
	/**
	 * Listen to `touchmove` events
	 *
	 * @default true
	 */
	touch?: boolean

	/**
	 * Reset to initial value when `touchend` event fired
	 *
	 * @default false
	 */
	reset_on_touch_ends?: boolean

	/**
	 * Initial values
	 */
	initial_value?: Position
}

export type MouseSourceType = "mouse" | "touch" | null

/**
 * Reactive mouse position.
 *
 * @param options
 */
export function mouse(options: MouseOptions = {}) {
	const {
		type = "page",
		touch = true,
		reset_on_touch_ends = false,
		initial_value = { x: 0, y: 0 },
		eventFilter,
	} = options

	const x = to_writable(initial_value.x)
	const y = to_writable(initial_value.y)
	const source_type = to_writable<MouseSourceType>(null)

	const mouse_handler = (event: MouseEvent) => {
		if (type === "page") {
			x.set(event.pageX)
			y.set(event.pageY)
		} else if (type === "client") {
			x.set(event.clientX)
			y.set(event.clientY)
		}
		source_type.set("mouse")
	}
	const reset = () => {
		x.set(initial_value.x)
		y.set(initial_value.y)
	}
	const touch_handler = (event: TouchEvent) => {
		if (event.touches.length > 0) {
			const touch = event.touches[0]
			if (type === "page") {
				x.set(touch.pageX)
				y.set(touch.pageY)
			} else if (type === "client") {
				x.set(touch.clientX)
				y.set(touch.clientY)
			}
			source_type.set("touch")
		}
	}

	const mouse_handler_wrapper = (event: MouseEvent) => {
		return eventFilter === undefined
			? mouse_handler(event)
			: eventFilter(() => mouse_handler(event), {} as any)
	}

	const touch_handler_wrapper = (event: TouchEvent) => {
		return eventFilter === undefined
			? touch_handler(event)
			: eventFilter(() => touch_handler(event), {} as any)
	}

	if (window) {
		event_listener(window, "mousemove", mouse_handler_wrapper, {
			passive: true,
		})
		event_listener(window, "dragover", mouse_handler_wrapper, {
			passive: true,
		})
		if (touch) {
			event_listener(window, "touchstart", touch_handler_wrapper, {
				passive: true,
			})
			event_listener(window, "touchmove", touch_handler_wrapper, {
				passive: true,
			})
			if (reset_on_touch_ends)
				event_listener(window, "touchend", reset, { passive: true })
		}
	}

	return {
		x: to_readable(x),
		y: to_readable(y),
		source_type: to_readable(source_type),
	}
}
