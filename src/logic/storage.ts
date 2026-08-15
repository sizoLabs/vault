const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined"

const getStorageInstance = () => isBrowser ? window.localStorage : null

export const setStorage = (key: string, value: any): void => {
    if (!isBrowser) return
    if (typeof value === "object") value = JSON.stringify(value)
    getStorageInstance()?.setItem(key, value)

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vault-storage-updated", { detail: { key } }))
    }
}

export const getStorage = (key: string) => {
    const storage = getStorageInstance()
    if (!storage) return null

    const data: any = storage.getItem(key)
    if (!data) return data
    if (/^\s*{\s*"/.test(data) || /^\s*\[/.test(data)) return JSON.parse(data)
    return data
}

export const removeStorage = (key: string): void => {
    getStorageInstance()?.removeItem(key)
}