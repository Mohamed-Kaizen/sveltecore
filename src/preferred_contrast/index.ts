import { to_writable } from "svelteshareds"
import { media_query } from "../media_query"

export type ContrastType = "more" | "less" | "custom" | "no-preference"

/**
 * Reactive prefers-contrast media query.
 *
 */
export function preferred_contrast() {
	const more = media_query("(prefers-contrast: more)")

	const less = media_query("(prefers-contrast: less)")

	const custom = media_query("(prefers-contrast: custom)")

	const { subscribe, set } = to_writable("no-preference")

	more.subscribe((value) => {
		if (value) set("more")
	})

	less.subscribe((value) => {
		if (value) set("less")
	})

	custom.subscribe((value) => {
		if (value) set("custom")
	})

	return { subscribe }
}

// alias
export { preferred_contrast as preferredContrast }
