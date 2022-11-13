import { try_on_destroy } from "svelteshareds"

/**
 * URL representing an object.
 *
 * @param object
 */
export function object_url(object: Blob | MediaSource | undefined) {
	let url: string | undefined = ""

	const release = () => {
		if (url) URL.revokeObjectURL(url)

		url = undefined
	}

	release()

	if (object) url = URL.createObjectURL(object)

	try_on_destroy(release)

	return url
}

// alias
export { object_url as objectURL }
