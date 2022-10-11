import { to_writable } from "svelteshareds"

import { media_query } from "../media_query"

/**
 * Reactive prefers-contrast media query.
 *
 */
export function preferred_reduced_motion() {
	const reduced = media_query("(prefers-reduced-motion: reduce)")

	const { subscribe, set } = to_writable("no-preference")

	reduced.subscribe((value) => {
		if (value) set("reduce")

		if (!value) set("no-preference")
	})

	return { subscribe }
}

// alias
export { preferred_reduced_motion as preferredReducedMotion }
