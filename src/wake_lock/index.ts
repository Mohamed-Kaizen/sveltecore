import { to_readable, to_writable, unstore } from "svelteshareds"

import {
	default_document as document,
	default_navigator as navigator,
} from "../_configurable"
import { event_listener } from "../event_listener"
import { supported } from "../supported"

import type {
	ConfigurableDocument,
	ConfigurableNavigator,
} from "../_configurable"

type WakeLockType = "screen"

export interface WakeLockSentinel extends EventTarget {
	type: WakeLockType
	released: boolean
	release: () => Promise<void>
}

type NavigatorWithWakeLock = Navigator & {
	wakeLock: { request: (type: WakeLockType) => Promise<WakeLockSentinel> }
}

export type WakeLockOptions = ConfigurableNavigator & ConfigurableDocument

/**
 * Reactive Screen Wake Lock API.
 *
 */
export const wake_lock = () => {
	let _wake_lock: WakeLockSentinel | null

	const is_supported = supported("wakeLock")

	const active = to_writable(false)

	async function on_visibility_change() {
		if (!unstore(is_supported) || !_wake_lock) return

		if (document && document.visibilityState === "visible")
			_wake_lock = await (
				navigator as NavigatorWithWakeLock
			).wakeLock.request("screen")

		active.set(!_wake_lock.released)
	}

	if (document)
		event_listener(document, "visibilitychange", on_visibility_change, {
			passive: true,
		})

	async function request(type: WakeLockType) {
		if (!unstore(is_supported)) return
		_wake_lock = await (
			navigator as NavigatorWithWakeLock
		).wakeLock.request(type)
		active.set(!_wake_lock.released)
	}

	async function release() {
		if (!unstore(is_supported) || !_wake_lock) return
		await _wake_lock.release()
		active.set(!_wake_lock.released)
		_wake_lock = null
	}

	return {
		is_supported,
		active: to_readable(active),
		request,
		release,
	}
}

// alias
export { wake_lock as wakeLock }
