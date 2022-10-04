import { is_string, watchable } from "svelteshareds"

import { default_document } from "../_configurable"

import type { ConfigurableDocument } from "../_configurable"

export interface FaviconOptions extends ConfigurableDocument {
	base_url?: string

	rel?: string
}

/**
 * Reactive favicon.
 *
 * @param new_icon
 * @param options
 */
export function favicon(
	new_icon?: string | null | undefined,
	options: FaviconOptions = {}
) {
	const {
		base_url = "/",
		rel = "icon",
		document = default_document,
	} = options

	const apply_icon = (icon: string) => {
		document?.head
			.querySelectorAll<HTMLLinkElement>(`link[rel*="${rel}"]`)
			.forEach((el) => (el.href = `${base_url}${icon}`))
	}

	const favicon = watchable(new_icon, (o, n) => {
		if (!!n && is_string(n) && o !== n) apply_icon(n)
	})

	return favicon
}
