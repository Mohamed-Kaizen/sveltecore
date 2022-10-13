import { to_readable, to_writable, unstore } from "svelteshareds"

import { default_window as window } from "../_configurable"
import { event_listener } from "../event_listener"
import { supported } from "../supported"

import type { Readable } from "svelte/store"

export type NetworkType =
	| "bluetooth"
	| "cellular"
	| "ethernet"
	| "none"
	| "wifi"
	| "wimax"
	| "other"
	| "unknown"

export type NetworkEffectiveType = "slow-2g" | "2g" | "3g" | "4g" | undefined

export interface NetworkState {
	is_supported: Readable<boolean>
	/**
	 * If the user is currently connected.
	 */
	online: Readable<boolean>
	/**
	 * The time since the user was last connected.
	 */
	offline_at: Readable<number | undefined>
	/**
	 * At this time, if the user is offline and reconnects
	 */
	online_at: Readable<number | undefined>
	/**
	 * The download speed in Mbps.
	 */
	downlink: Readable<number | undefined>
	/**
	 * The max reachable download speed in Mbps.
	 */
	downlink_max: Readable<number | undefined>
	/**
	 * The detected effective speed type.
	 */
	effective_type: Readable<NetworkEffectiveType | undefined>
	/**
	 * The estimated effective round-trip time of the current connection.
	 */
	rtt: Readable<number | undefined>
	/**
	 * If the user activated data saver mode.
	 */
	save_data: Readable<boolean | undefined>
	/**
	 * The detected connection/network type.
	 */
	type: Readable<NetworkType>
}

/**
 * Reactive Network status.
 *
 * @param options
 */
export function network(): NetworkState {
	const navigator = window?.navigator

	const is_supported = supported("connection")

	const online = to_writable(true)

	const save_data = to_writable(false)

	const offline_at = to_writable<number | undefined>(undefined)

	const online_at = to_writable<number | undefined>(undefined)

	const downlink = to_writable<number | undefined>(undefined)

	const downlink_max = to_writable<number | undefined>(undefined)

	const rtt = to_writable<number | undefined>(undefined)

	const effective_type = to_writable<NetworkEffectiveType>(undefined)

	const type = to_writable<NetworkType>("unknown")

	const connection = unstore(is_supported) && (navigator as any).connection

	function update_network_information() {
		if (!navigator) return

		online.set(navigator.onLine)

		offline_at.set(navigator.onLine ? undefined : Date.now())

		online_at.set(navigator.onLine ? Date.now() : undefined)

		if (connection) {
			downlink.set(connection.downlink)

			downlink_max.set(connection.downlinkMax)

			effective_type.set(connection.effectiveType)

			rtt.set(connection.rtt)

			save_data.set(connection.saveData)

			type.set(connection.type)
		}
	}

	if (window) {
		event_listener(window, "offline", () => {
			online.set(false)

			offline_at.set(Date.now())
		})

		event_listener(window, "online", () => {
			online.set(true)

			online_at.set(Date.now())
		})
	}

	if (connection)
		event_listener(connection, "change", update_network_information, false)

	update_network_information()

	return {
		is_supported,
		online: to_readable(online),
		save_data: to_readable(save_data),
		offline_at: to_readable(offline_at),
		online_at: to_readable(online_at),
		downlink: to_readable(downlink),
		downlink_max: to_readable(downlink_max),
		effective_type: to_readable(effective_type),
		rtt: to_readable(rtt),
		type: to_readable(type),
	}
}
