import { to_readable, to_writable } from "svelteshareds"

import { default_window } from "../_configurable"
import { event_listener } from "../event_listener"

import type { ConfigurableWindow } from "../_configurable"

/**
 * Reactive window scroll.
 *
 * @param options
 */
export function window_scroll({
	window = default_window,
}: ConfigurableWindow = {}) {
	if (!window) return { x: to_readable(0), y: to_readable(0) }

	const x = to_writable(window.scrollX)
	const y = to_writable(window.scrollY)

	event_listener(
		window,
		"scroll",
		() => {
			x.set(window.scrollX)
			y.set(window.scrollY)
		},
		{
			capture: false,
			passive: true,
		}
	)

	return { x: to_readable(x), y: to_readable(y) }
}

// alias
export { window_scroll as windowScroll }
