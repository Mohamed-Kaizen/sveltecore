import { to_writable } from "svelteshareds"

import { default_document } from "../_configurable"
import { event_listener } from "../event_listener"

import type { Readable } from "svelte/store"
import type { ConfigurableDocument } from "../_configurable"

/**
 * Reactive `document.activeElement`
 *
 * @param options
 */
export function dom_visible({
	document = default_document,
}: ConfigurableDocument = {}): Readable<DocumentVisibilityState> {
	if (!document) return to_writable("visible")

	const { subscribe, set } = to_writable<DocumentVisibilityState>(
		document.visibilityState
	)

	function handler() {
		if (document) set(document.visibilityState)
	}

	event_listener(document, "visibilitychange", handler, true)

	return { subscribe }
}

// alias
export { dom_visible as domVisible }
