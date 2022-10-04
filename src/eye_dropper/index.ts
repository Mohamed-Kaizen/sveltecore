import { to_readable, to_writable, unstore } from "svelteshareds"

import { supported } from "../supported"

export interface EyeDropperOpenOptions {
	/**
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal
	 */
	signal?: AbortSignal
}

export interface EyeDropper {
	// eslint-disable-next-line @typescript-eslint/no-misused-new
	new (): EyeDropper

	open: (options?: EyeDropperOpenOptions) => Promise<{ sRGBHex: string }>
	[Symbol.toStringTag]: "EyeDropper"
}

export interface EyeDropperOptions {
	/**
	 * Initial sRGBHex.
	 *
	 * @default ''
	 */
	initial?: string
}

/**
 * Reactive [EyeDropper API](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API)
 *
 * @param initial string
 */
export function eye_dropper(options: EyeDropperOptions = {}) {
	const { initial = "" } = options
	const is_supported = supported("EyeDropper", { from: "window" })
	const sRGBHex = to_writable(initial)

	async function open(openOptions?: EyeDropperOpenOptions) {
		if (!unstore(is_supported)) return

		const eyeDropper: EyeDropper = new (window as any).EyeDropper()

		const result = await eyeDropper.open(openOptions)

		sRGBHex.set(result.sRGBHex)

		return result
	}

	return { is_supported, sRGBHex: to_readable(sRGBHex), open }
}

// alias
export { eye_dropper as eyeDropper }
