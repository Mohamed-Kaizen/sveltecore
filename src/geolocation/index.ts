import { onDestroy } from "svelte"
import { to_readable, to_writable, unstore } from "svelteshareds"

import { default_navigator } from "../_configurable"
import { supported } from "../supported"

import type { ConfigurableNavigator } from "../_configurable"

export interface GeolocationOptions
	extends Partial<PositionOptions>,
		ConfigurableNavigator {}

/**
 * Reactive Geolocation API.
 *
 * @param options
 */
export function geolocation(options: GeolocationOptions = {}) {
	const {
		enableHighAccuracy = true,
		maximumAge = 30000,
		timeout = 27000,
		navigator = default_navigator,
	} = options

	const is_supported = supported("geolocation")

	const located_at = to_writable<number | null>(null)

	const error = to_writable<GeolocationPositionError | null>(null)

	const coords = to_writable<GeolocationPosition["coords"]>({
		accuracy: 0,
		latitude: Infinity,
		longitude: Infinity,
		altitude: null,
		altitudeAccuracy: null,
		heading: null,
		speed: null,
	})

	function success(position: GeolocationPosition) {
		located_at.set(position.timestamp)
		coords.set({
			accuracy: position.coords.accuracy,
			altitude: position.coords.altitude,
			altitudeAccuracy: position.coords.altitudeAccuracy,
			heading: position.coords.heading,
			latitude: position.coords.latitude,
			longitude: position.coords.longitude,
			speed: position.coords.speed,
		})
		error.set(null)
	}

	let watcher: number | undefined

	if (unstore(is_supported)) {
		watcher = navigator?.geolocation.watchPosition(
			success,
			(err) => error.set(err),
			{
				enableHighAccuracy,
				maximumAge,
				timeout,
			}
		)
	}

	onDestroy(() => {
		if (watcher && navigator) navigator.geolocation.clearWatch(watcher)
	})

	return {
		is_supported,
		coords: to_readable(coords),
		located_at: to_readable(located_at),
		error: to_readable(error),
	}
}
