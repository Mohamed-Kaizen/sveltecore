import { readdir } from "fs/promises"
import fs from "fs-extra"
import fg from "fast-glob"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const DIR_ROOT = path.resolve(__dirname, "../")
export const DIR_SRC = path.resolve(DIR_ROOT, "src")

export function group(list, fn) {
	return list.reduce((acc, item) => {
		const id = fn(item)
		const groupList = acc[id] ?? []
		return { ...acc, [id]: [...groupList, item] }
	}, {})
}

async function get_submodules(dir, files) {
	const submodules = []

	for (const file of files) {
		const filepath = path.join(dir, file)

		for await (const d of await readdir(filepath, {
			withFileTypes: true,
		})) {
			if (d.isDirectory()) {
				submodules.push({
					name: d.name,
					path: path.join(filepath, d.name, "index.ts"),
					module: file,
				})
			}
		}
	}
	return submodules
}

export async function list_functions(dir, ignore = []) {
	let files = await fg("*", {
		onlyDirectories: true,
		cwd: dir,
		ignore: ["_*", "dist", "node_modules", ...ignore],
	})

	const submodules = group(await get_submodules(dir, files), (f) => f.module)

	files.sort()

	files = files.filter((r) => {
		return !Object.keys(submodules).includes(r)
	})

	const index = []

	await Promise.all(
		files.map(async (name) => {
			const tsPath = path.join(DIR_SRC, name, "index.ts")

			index.push({
				name: name,
				path: tsPath,
				module: "index",
			})
		})
	)

	const functions = { ...submodules, index: [...index] }

	return functions
}

export async function updatePackageJSON(exports) {
	const packageJSONPath = path.join(DIR_ROOT, "package.json")

	const pkg = await fs.readJSON(packageJSONPath)

	pkg.exports = exports

	await fs.writeJSON(packageJSONPath, pkg, { spaces: 4 })
}

export async function gitignore() {
	let files = await fg("*", {
		onlyDirectories: true,
		cwd: DIR_SRC,
		ignore: ["_*", "dist", "node_modules"],
	})
	files = files.map((f) => `/${f}`)

	const gitignorePath = path.join(DIR_ROOT, ".gitignore")

	const gitignore = await fs.readFile(gitignorePath, "utf-8")

	const lines = gitignore.split("\n")

	const newLines = lines.filter((line) => {
		return !files.includes(line)
	})

	await fs.writeFile(gitignorePath, [...newLines, ...files].join("\n"))
}

export async function clear() {
	let files = await fg("*", {
		onlyDirectories: true,
		cwd: DIR_SRC,
		ignore: ["_*", "dist", "node_modules"],
	})
	files.push("index.d.ts", "index.js", "index.cjs", "_configurable.d.ts")
	for (const file of files) {
		const filepath = path.join(DIR_ROOT, file)
		await fs.remove(filepath)
	}
}
