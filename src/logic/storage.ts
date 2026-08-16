const isBrowser = typeof window !== "undefined"

const getStorageInstance = (type: "local" | "session" = "local") => {
    if (!isBrowser) return null

    const storage = type === "session" ? window.sessionStorage : window.localStorage
    if (!storage) return null

    return storage
}

export const setStorage = (key: string, value: any): void => {
    if (!isBrowser) return
    if (typeof value === "object") value = JSON.stringify(value)
    getStorageInstance("local")?.setItem(key, value)

    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vault-storage-updated", { detail: { key } }))
    }
}

export const getStorage = (key: string) => {
    const storage = getStorageInstance("local")
    if (!storage) return null

    const data: any = storage.getItem(key)
    if (!data) return data
    if (/^\s*{\s*"/.test(data) || /^\s*\[/.test(data)) return JSON.parse(data)
    return data
}

export const removeStorage = (key: string): void => {
    getStorageInstance("local")?.removeItem(key)
}

export const setSessionStorage = (key: string, value: any): void => {
    if (!isBrowser) return
    if (typeof value === "object") value = JSON.stringify(value)
    getStorageInstance("session")?.setItem(key, value)
}

export const getSessionStorage = (key: string) => {
    const storage = getStorageInstance("session")
    if (!storage) return null

    const data: any = storage.getItem(key)
    if (!data) return data
    if (/^\s*{\s*"/.test(data) || /^\s*\[/.test(data)) return JSON.parse(data)
    return data
}

export const removeSessionStorage = (key: string): void => {
    getStorageInstance("session")?.removeItem(key)
}