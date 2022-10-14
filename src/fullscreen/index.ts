import { onDestroy } from "svelte"
import { to_readable, to_writable, unstore } from "svelteshareds"

import { default_document as document } from "../_configurable"
import { event_listener } from "../event_listener"

type FunctionMap = [
	"requestFullscreen",
	"exitFullscreen",
	"fullscreenElement",
	"fullscreenEnabled",
	"fullscreenchange",
	"fullscreenerror"
]

// from: https://github.com/sindresorhus/screenfull.js/blob/master/src/screenfull.js
const functions_map: FunctionMap[] = [
	[
		"requestFullscreen",
		"exitFullscreen",
		"fullscreenElement",
		"fullscreenEnabled",
		"fullscreenchange",
		"fullscreenerror",
	],
	// New WebKit
	[
		"webkitRequestFullscreen",
		"webkitExitFullscreen",
		"webkitFullscreenElement",
		"webkitFullscreenEnabled",
		"webkitfullscreenchange",
		"webkitfullscreenerror",
	],
	// Old WebKit
	[
		"webkitRequestFullScreen",
		"webkitCancelFullScreen",
		"webkitCurrentFullScreenElement",
		"webkitCancelFullScreen",
		"webkitfullscreenchange",
		"webkitfullscreenerror",
	],
	[
		"mozRequestFullScreen",
		"mozCancelFullScreen",
		"mozFullScreenElement",
		"mozFullScreenEnabled",
		"mozfullscreenchange",
		"mozfullscreenerror",
	],
	[
		"msRequestFullscreen",
		"msExitFullscreen",
		"msFullscreenElement",
		"msFullscreenEnabled",
		"MSFullscreenChange",
		"MSFullscreenError",
	],
] as any

export interface FullscreenOptions {
	/**
	 * Automatically exit fullscreen when component is unmounted
	 *
	 * @default false
	 */
	auto_exit?: boolean
}

/**
 * Reactive Fullscreen API.
 *
 * @param target
 * @param options
 */
export function fullscreen(
	target?: HTMLElement | SVGElement | undefined | null,
	options: FullscreenOptions = {}
) {
	const { auto_exit = false } = options

	const _target = target || document?.querySelector("html")

	const is_fullscreen = to_writable(false)

	let map: FunctionMap = functions_map[0]

	function does_support() {
		if (!document) {
			return false
		}

		for (const m of functions_map) {
			if (m[1] in document) {
				map = m
				return true
			}
		}

		return false
	}

	const is_supported = to_readable(does_support())

	const [REQUEST, EXIT, ELEMENT, , EVENT] = map

	async function exit() {
		if (!unstore(is_supported)) return

		if (document?.[ELEMENT]) await document[EXIT]()

		is_fullscreen.set(false)
	}

	async function enter() {
		if (!is_supported) return

		if (unstore(is_fullscreen)) return

		if (_target) {
			await _target[REQUEST]()

			is_fullscreen.set(true)
		}
	}

	async function toggle() {
		if (unstore(is_fullscreen)) await exit()
		else await enter()
	}

	if (document) {
		event_listener(
			document,
			EVENT,
			() => is_fullscreen.set(Boolean(document?.[ELEMENT])),
			false
		)
	}

	if (auto_exit) onDestroy(exit)

	return {
		is_supported,
		is_fullscreen: to_readable(is_fullscreen),
		enter,
		exit,
		toggle,
	}
}
