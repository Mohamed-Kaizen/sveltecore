import { sleep, to_writable, unstore } from "svelteshareds"

import { supported } from "../supported"

interface PushOptions {
	/**
	 * Either to convert the push object into a base64 string
	 * @default true
	 */
	base64?: boolean

	/**
	 * Either to start subscribing, when the user is visible
	 * @default true
	 */
	user_visible_only?: boolean
}

type base64 = string

function url_base64_to_uint8_array(base64: string) {
	const padding = "=".repeat((4 - (base64.length % 4)) % 4)

	const _base64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")

	const data = window.atob(_base64)

	const output = new Uint8Array(data.length)

	for (const [i, char] of data.split("").entries())
		output[i] = char.charCodeAt(0)

	return output
}

export function push(sw_url: string, vapid: base64, options: PushOptions = {}) {
	const { base64 = true, user_visible_only = true } = options

	const is_supported = supported("serviceWorker")

	const result = to_writable<PushSubscription | string>("")

	async function init() {
		const register =
			(await navigator.serviceWorker.getRegistration(sw_url)) ??
			(await navigator.serviceWorker.register(sw_url))

		await sleep(100)

		const subscription =
			(await register.pushManager.getSubscription()) ??
			(await register.pushManager.subscribe({
				userVisibleOnly: user_visible_only,
				applicationServerKey: url_base64_to_uint8_array(vapid),
			}))

		if (base64) result.set(btoa(JSON.stringify(subscription)))
		else result.set(subscription)
	}

	if (unstore(is_supported)) init()

	return { result, is_supported }
}
