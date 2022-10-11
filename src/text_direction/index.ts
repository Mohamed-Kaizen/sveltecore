import { to_writable } from "svelteshareds"

import { default_document as document } from "../_configurable"
import { mutation_observer } from "../mutation_observer"

import type { ConfigurableDocument } from "../_configurable"

export type TextDirectionValue = "ltr" | "rtl" | "auto"

export interface TextDirectionOptions extends ConfigurableDocument {
	/**
	 * CSS Selector for the target element applying to
	 *
	 * @default 'html'
	 */
	selector?: string
	/**
	 * Observe `document.querySelector(selector)` changes using MutationObserve
	 *
	 * @default false
	 */
	observe?: boolean
	/**
	 * Initial value
	 *
	 * @default 'ltr'
	 */
	initial_value?: TextDirectionValue
}

/**
 * Reactive dir of the element's text.
 *
 */
export function text_direction(options: TextDirectionOptions = {}) {
	const {
		selector = "html",
		observe = false,
		initial_value = "ltr",
	} = options
	const { subscribe, set, update } = to_writable<TextDirectionValue>("ltr")

	if (!document) return { subscribe, set }

	function get_value() {
		return (
			(document
				?.querySelector(selector)
				?.getAttribute("dir") as TextDirectionValue) ?? initial_value
		)
	}

	set(get_value())

	if (observe && document) {
		mutation_observer(
			document.querySelector(selector) as
				| HTMLElement
				| SVGElement
				| undefined
				| null,
			() => set(get_value()),
			{ attributes: true }
		)
	}

	return {
		subscribe,
		set: (value: TextDirectionValue) => {
			update((old_value) => {
				if (!document) return old_value

				if (old_value)
					document
						?.querySelector(selector)
						?.setAttribute("dir", value)
				else document?.querySelector(selector)?.removeAttribute("dir")

				return value
			})
		},
	}
}
