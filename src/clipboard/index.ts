import { timeout_fn, to_readable, to_writable, unstore } from "svelteshareds"

import { default_navigator } from "../_configurable"
import { event_listener } from "../event_listener"
import { supported } from "../supported"

import type { Readable } from "svelte/store"

import type { ConfigurableNavigator } from "../_configurable"
import type { WindowEventName } from "../event_listener"

export interface ClipboardOptions<Source> extends ConfigurableNavigator {
	/**
	 * Enabled reading for clipboard
	 *
	 * @default false
	 */
	read?: boolean

	/**
	 * Copy source
	 */
	source?: Source

	/**
	 * Milliseconds to reset state of `copied` ref
	 *
	 * @default 1500
	 */
	copied_during?: number

	/**
	 * Whether fallback to document.execCommand('copy') if clipboard is undefined.
	 *
	 * @default false
	 */
	legacy?: boolean
}

export interface ClipboardReturn<Optional> {
	is_supported: Readable<boolean>
	text: Readable<string>
	copied: Readable<boolean>
	copy: Optional extends true
		? (text?: string) => Promise<void>
		: (text: string) => Promise<void>
}

/**
 * Reactive Clipboard API.
 *
 * @param options
 */
export function clipboard(
	options?: ClipboardOptions<undefined>
): ClipboardReturn<false>
export function clipboard(
	options: ClipboardOptions<string>
): ClipboardReturn<true>
export function clipboard(
	options: ClipboardOptions<string | undefined> = {}
): ClipboardReturn<boolean> {
	const {
		navigator = default_navigator,
		read = false,
		source,
		copied_during = 1500,
		legacy = false,
	} = options

	const events = ["copy", "cut"]

	const clipboard_supported = supported("clipboard")

	const is_supported = to_readable(clipboard_supported || legacy)

	const text = to_writable("")

	const copied = to_writable(false)

	const timeout = timeout_fn(() => copied.set(false), copied_during)

	async function update_text() {
		if (unstore(clipboard_supported)) {
			const value = (await navigator?.clipboard.readText()) ?? ""
			text.set(value)
		} else text.set(legacy_read())
	}

	if (unstore(is_supported) && read) {
		for (const event of events)
			event_listener(event as WindowEventName, update_text)
	}

	async function copy(value = source) {
		if (unstore(is_supported) && value != null) {
			if (unstore(clipboard_supported))
				await navigator?.clipboard.writeText(value)
			else legacy_copy(value)

			text.set(value)

			copied.set(true)

			timeout.start()
		}
	}

	function legacy_copy(value: string) {
		const ta = document.createElement("textarea")
		ta.value = value ?? ""
		ta.style.position = "absolute"
		ta.style.opacity = "0"
		document.body.appendChild(ta)
		ta.select()
		document.execCommand("copy")
		ta.remove()
	}

	function legacy_read() {
		return document?.getSelection?.()?.toString() ?? ""
	}

	return {
		is_supported,
		text: to_readable(text),
		copied: to_readable(copied),
		copy,
	}
}
