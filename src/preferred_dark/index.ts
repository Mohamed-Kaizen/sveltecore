import { media_query } from "../media_query"

/**
 * Reactive dark theme preference.
 *
 */
export function preferred_dark() {
	return media_query("(prefers-color-scheme: dark)")
}

// alias
export { preferred_dark as preferredDark }
