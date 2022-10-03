import { is_client, to_writable } from "svelteshareds"

import type { Readable } from "svelte/store"

export interface SupportedOptions {
	from?: "navigator" | "window" | "document"
}

export function supported(
	target: string,
	options: SupportedOptions = {}
): Readable<boolean> {
	const { from = "navigator" } = options

	const { subscribe, set } = to_writable(false)

	if (is_client) {
		const _from =
			from === "navigator"
				? navigator
				: from === "window"
				? window
				: document

		set(_from && target in _from)
	}

	return { subscribe }
}
