import { onDestroy } from "svelte"
import {
	create_event_hook,
	to_readable,
	to_writable,
	unstore,
} from "svelteshareds"

import { default_window as window } from "../_configurable"
import { event_listener } from "../event_listener"
import { supported } from "../supported"

import type { EventHook } from "svelteshareds"

export interface WebNotificationOptions {
	/**
	 * The title read-only property of the Notification interface indicates
	 * the title of the notification
	 *
	 * @default ''
	 */
	title?: string
	/**
	 * The body string of the notification as specified in the constructor's
	 * options parameter.
	 *
	 * @default ''
	 */
	body?: string
	/**
	 * The text direction of the notification as specified in the constructor's
	 * options parameter.
	 *
	 * @default ''
	 */
	dir?: "auto" | "ltr" | "rtl"
	/**
	 * The language code of the notification as specified in the constructor's
	 * options parameter.
	 *
	 * @default DOMString
	 */
	lang?: string
	/**
	 * The ID of the notification(if any) as specified in the constructor's options
	 * parameter.
	 *
	 * @default ''
	 */
	tag?: string
	/**
	 * The URL of the image used as an icon of the notification as specified
	 * in the constructor's options parameter.
	 *
	 * @default ''
	 */
	icon?: string
	/**
	 * Specifies whether the user should be notified after a new notification
	 * replaces an old one.
	 *
	 * @default false
	 */
	renotify?: boolean
	/**
	 * A boolean value indicating that a notification should remain active until the
	 * user clicks or dismisses it, rather than closing automatically.
	 *
	 * @default false
	 */
	requireInteraction?: boolean
	/**
	 * The silent read-only property of the Notification interface specifies
	 * whether the notification should be silent, i.e., no sounds or vibrations
	 * should be issued, regardless of the device settings.
	 *
	 * @default false
	 */
	silent?: boolean
	/**
	 * Specifies a vibration pattern for devices with vibration hardware to emit.
	 * A vibration pattern, as specified in the Vibration API spec
	 *
	 * @see https://w3c.github.io/vibration/
	 */
	vibrate?: number[]
}

/**
 * Reactive notification
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/notification
 * @param title
 * @param options of type WebNotificationOptions
 * @param methods of type WebNotificationMethods
 */
export const notification = (defaultOptions: WebNotificationOptions = {}) => {
	const is_supported = supported("Notification", { from: "window" })

	const notification = to_writable<Notification | null>(null)

	// Request permission to use web notifications:
	const request_permission = async () => {
		if (!unstore(is_supported)) return

		if (
			"permission" in Notification &&
			Notification.permission !== "denied"
		)
			await Notification.requestPermission()
	}

	const on_click: EventHook = create_event_hook<Event>()

	const on_show: EventHook = create_event_hook<Event>()

	const on_error: EventHook = create_event_hook<Event>()

	const on_close: EventHook = create_event_hook<Event>()

	// Show notification method:
	const show = async (overrides?: WebNotificationOptions) => {
		if (!unstore(is_supported)) return

		await request_permission()

		const options = Object.assign({}, defaultOptions, overrides)

		notification.set(new Notification(options.title || "", options))

		const n = unstore(notification)

		if (n !== null) {
			n.onclick = (event: Event) => on_click.trigger(event)

			n.onshow = (event: Event) => on_show.trigger(event)

			n.onerror = (event: Event) => on_error.trigger(event)

			n.onclose = (event: Event) => on_close.trigger(event)

			return n
		}
	}

	// Close notification method:
	const close = (): void => {
		const n = unstore(notification)

		if (n) n.close()

		notification.set(null)
	}

	// Attempt to request permission:
	if (window) if (unstore(is_supported)) request_permission()

	// Attempt cleanup of the notification:
	onDestroy(close)

	// Use close() to remove a notification that is no longer relevant to to
	// the user (e.g.the user already read the notification on the webpage).
	// Most modern browsers dismiss notifications automatically after a few
	// moments(around four seconds).
	if (unstore(is_supported) && window) {
		const document = window.document
		event_listener(document, "visibilitychange", (e: Event) => {
			e.preventDefault()
			if (document.visibilityState === "visible") {
				// The tab has become visible so clear the now-stale Notification:
				close()
			}
		})
	}

	return {
		is_supported,
		notify: to_readable(notification),
		show,
		close,
		on_click,
		on_show,
		on_error,
		on_close,
	}
}
