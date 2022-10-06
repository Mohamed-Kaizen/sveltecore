import { to_readable, to_writable } from "svelteshareds"

import { default_window } from "../_configurable"
import { event_listener } from "../event_listener"

import type { Readable } from "svelte/store"

import type { ConfigurableWindow } from "../_configurable"

/**
 * Reactively track window focus with `window.onfocus` and `window.onblur`.
 *
 * @param options
 */
export function window_focus({
	window = default_window,
}: ConfigurableWindow = {}): Readable<boolean> {
	if (!window) return to_readable(false)

	const focused = to_writable(window.document.hasFocus())

	event_listener(window, "blur", () => {
		focused.set(false)
	})

	event_listener(window, "focus", () => {
		focused.set(true)
	})

	return to_readable(focused)
}

// alias
export { window_focus as windowFocus }
