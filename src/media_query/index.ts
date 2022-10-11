import { to_readable, to_writable, unstore } from "svelteshareds"

import { default_window as window } from "../_configurable"
import { event_listener } from "../event_listener"
import { supported } from "../supported"

/**
 * Reactive Media Query.
 *
 * @param query
 */
export function media_query(query: string) {
	if (!window) return to_readable(false)

	const is_supported = supported("matchMedia", { from: "window" })

	if (!unstore(is_supported)) return to_readable(false)

	const { subscribe, set } = to_writable(false)

	const media_query: MediaQueryList | undefined = window.matchMedia(query)

	function handler(event: MediaQueryListEvent) {
		set(event.matches)
	}

	set(media_query.matches)

	event_listener(media_query, "change", handler)

	return { subscribe }
}

// alias
export { media_query as MediaQuery }
