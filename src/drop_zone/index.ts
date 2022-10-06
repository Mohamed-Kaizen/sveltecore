import { is_client, to_writable } from "svelteshareds"

import { event_listener } from "../event_listener"

import type { Readable } from "svelte/store"

export function drop_zone(
	target: HTMLElement | null | undefined,
	on_drop?: (files: File[] | null) => void
): Readable<boolean> {
	const { subscribe, set } = to_writable(false)

	let counter = 0

	if (is_client) {
		event_listener<DragEvent>(target, "dragenter", (event) => {
			event.preventDefault()

			counter += 1

			set(true)
		})

		event_listener<DragEvent>(target, "dragover", (event) => {
			event.preventDefault()
		})

		event_listener<DragEvent>(target, "dragleave", (event) => {
			event.preventDefault()

			counter -= 1

			if (counter === 0) set(false)
		})

		event_listener<DragEvent>(target, "drop", (event) => {
			event.preventDefault()

			counter = 0

			set(false)

			const files = Array.from(event.dataTransfer?.files ?? [])

			on_drop?.(files.length === 0 ? null : files)
		})
	}

	return {
		subscribe,
	}
}

// alias
export { drop_zone as dropZone }
