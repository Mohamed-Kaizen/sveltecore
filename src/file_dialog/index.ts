import { to_readable, to_writable } from "svelteshareds"
import { contains } from "svelteshareds/dicts"

import { default_document } from "../_configurable"

import type { Readable } from "svelte/store"

import type { ConfigurableDocument } from "../_configurable"

export interface FileDialogOptions extends ConfigurableDocument {
	/**
	 * @default true
	 */
	multiple?: boolean
	/**
	 * @default '*'
	 */
	accept?: string
	/**
	 * Select the input source for the capture file.
	 * @see [HTMLInputElement Capture](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
	 */
	capture?: string
}

const DEFAULT_OPTIONS: FileDialogOptions = {
	multiple: true,
	accept: "*",
}

export interface FileDialogReturn {
	files: Readable<FileList | null>
	open: (localOptions?: Partial<FileDialogOptions>) => void
	reset: () => void
}

/**
 * Open file dialog with ease.
 *
 * @param options
 */
export function file_dialog(options: FileDialogOptions = {}): FileDialogReturn {
	const { document = default_document } = options

	const files = to_writable<FileList | null>(null)

	let input: HTMLInputElement | undefined
	if (document) {
		input = document.createElement("input")
		input.type = "file"

		input.onchange = (event: Event) => {
			const result = event.target as HTMLInputElement
			files.set(result.files)
		}
	}

	const open = (local_options?: Partial<FileDialogOptions>) => {
		if (!input) return
		const _options = {
			...DEFAULT_OPTIONS,
			...options,
			...local_options,
		}
		input.multiple = _options.multiple ?? true

		input.accept = _options.accept ?? "*"

		if (contains(_options, "capture"))
			input.capture = _options.capture ?? ""

		input.click()
	}

	const reset = () => {
		files.set(null)
		if (input) input.value = ""
	}

	return {
		files: to_readable(files),
		open,
		reset,
	}
}

// alias
export { file_dialog as fileDialog }
