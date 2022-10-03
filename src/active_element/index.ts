import { to_writable } from "svelteshareds"

import { default_window } from "../_configurable"

import { event_listener } from "../event_listener"
import type { ConfigurableWindow } from "../_configurable"

/**
 * Reactive `document.activeElement`
 *
 * @param options
 */
export function active_element<T extends HTMLElement>(
	options: ConfigurableWindow = {}
) {
	const { window = default_window } = options

	const { subscribe, set } = to_writable<T | null>(
		window?.document.activeElement as T | null
	)

	function handler() {
		set(window?.document.activeElement as T | null)
	}

	if (window) {
		event_listener(window, "blur", handler, true)
		event_listener(window, "focus", handler, true)
	}

	return { subscribe }
}

// alias
export { active_element as activeElement }
