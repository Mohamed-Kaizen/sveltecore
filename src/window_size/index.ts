import { to_readable, to_writable } from "svelteshareds"

import { default_window } from "../_configurable"
import { event_listener } from "../event_listener"

import type { ConfigurableWindow } from "../_configurable"

export interface WindowSizeOptions extends ConfigurableWindow {
	initial_width?: number

	initial_height?: number

	/**
	 * Listen to window `orientationchange` event
	 *
	 * @default true
	 */
	listen_orientation?: boolean

	/**
	 * Whether the scrollbar should be included in the width and height
	 * @default true
	 */
	include_scrollbar?: boolean
}

/**
 * Reactive window size.
 *
 * @param options
 */
export function window_size(options: WindowSizeOptions = {}) {
	const {
		window = default_window,
		initial_width = Infinity,
		initial_height = Infinity,
		listen_orientation = true,
		include_scrollbar = true,
	} = options

	if (!window) return { width: to_readable(0), height: to_readable(0) }

	const width = to_writable(initial_width)

	const height = to_writable(initial_height)

	const update = () => {
		if (window) {
			if (include_scrollbar) {
				width.set(window.innerWidth)
				height.set(window.innerHeight)
			} else {
				width.set(window.document.documentElement.clientWidth)
				height.set(window.document.documentElement.clientHeight)
			}
		}
	}

	update()

	event_listener("resize", update, { passive: true })

	if (listen_orientation)
		event_listener("orientationchange", update, { passive: true })

	return { width, height }
}

// alias
export { window_size as windowSize }
