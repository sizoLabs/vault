import { getStorage, setStorage } from "@logic/storage"

import packageJson from "../../package.json"

export const APP_VERSION = packageJson.version
export const GITHUB_REPOSITORY = "sizoLabs/vault"

const VERSION_CHECK_STORAGE_KEY = "version-check"
const VERSION_CHECK_INTERVAL = 24 * 60 * 60 * 1000

let versionCheckPromise: Promise<VersionCheckCache> | null = null

interface VersionCheckCache {
	checkedAt: number
	latestVersion: string | null
}

const normalizeVersion = (version: string) => version.trim().replace(/^v/i, "")

const compareVersions = (left: string, right: string) => {

	const leftParts = normalizeVersion(left).split(".").map((part) => Number.parseInt(part, 10) || 0)
	const rightParts = normalizeVersion(right).split(".").map((part) => Number.parseInt(part, 10) || 0)

	for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
		const difference = (leftParts[index] || 0) - (rightParts[index] || 0)
		if (difference !== 0) return difference
	}

	return 0

}

export const getVersionCheck = (): VersionCheckCache | null => {

	const cache = getStorage(VERSION_CHECK_STORAGE_KEY)
	if (!cache || typeof cache !== "object") return null
	if (typeof cache.checkedAt !== "number") return null

	return {
		checkedAt: cache.checkedAt,
		latestVersion: typeof cache.latestVersion === "string" ? cache.latestVersion : null
	}

}

export const getAvailableUpdate = (latestVersion: string | null) => {
	if (!latestVersion || compareVersions(latestVersion, APP_VERSION) <= 0) return null
	return latestVersion
}

export const checkForUpdate = async (): Promise<VersionCheckCache> => {

	const cached = getVersionCheck()
	if (cached && Date.now() - cached.checkedAt < VERSION_CHECK_INTERVAL) return cached

	if (versionCheckPromise) return versionCheckPromise

	versionCheckPromise = (async () => {
		let latestVersion: string | null = cached?.latestVersion || null

		try {

			const response = await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}/releases/latest`, {
				headers: { Accept: "application/vnd.github+json" }
			})

			if (!response.ok) throw new Error(`GitHub responded with ${response.status}`)

			const release = await response.json() as { tag_name?: string }
			latestVersion = release.tag_name ? normalizeVersion(release.tag_name) : null

		} catch {
		}

		const nextCache = { checkedAt: Date.now(), latestVersion }
		setStorage(VERSION_CHECK_STORAGE_KEY, nextCache)
		return nextCache

	})()

	try {
		return await versionCheckPromise
	} finally {
		versionCheckPromise = null
	}

}