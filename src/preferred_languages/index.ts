import { to_readable, to_writable } from "svelteshareds"

import { default_window as window } from "../_configurable"
import { event_listener } from "../event_listener"

import type { Readable } from "svelte/store"

/**
 * Reactive Navigator Languages.
 *
 */
export function preferred_languages(): Readable<readonly string[]> {
	if (!window) return to_readable(["en"])

	const navigator = window.navigator

	const { subscribe, set } = to_writable<readonly string[]>(
		navigator.languages
	)

	event_listener(window, "languagechange", () => {
		set(navigator.languages)
	})

	return { subscribe }
}

// alias
export { preferred_languages as preferredLanguages }
