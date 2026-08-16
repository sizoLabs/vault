import { getStorage, setStorage } from "./storage.ts"
import { showAlert } from "./alert.ts"
import { decodeData, encodeData } from "./utils.ts"

declare global {
    interface Window {
        google?: any
    }
}

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file"
const DRIVE_API = "https://www.googleapis.com/drive/v3"
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3"

export const getGoogleClientId = () => {
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.PUBLIC_GOOGLE_CLIENT_ID) {
        return String(import.meta.env.PUBLIC_GOOGLE_CLIENT_ID).trim()
    }
    return "REPLACE_WITH_GOOGLE_CLIENT_ID"
}

export const isGoogleDriveConfigured = () => {
    const clientId = getGoogleClientId()
    return Boolean(clientId) && !clientId.startsWith("REPLACE_") && !clientId.includes("example")
}

export const getDriveFileIdentifier = (accountId: string) => {
    const account = getStorage(accountId)
    const settings = Array.isArray(account?.settings) ? account.settings : []
    const setting = settings.find((setting: any) => setting.id === "google-drive-file-id")
    return String(setting?.value || "").trim()
}

export const buildDriveFileName = (accountId: string, driveFileId?: string) => {

    const rawName = String((driveFileId ?? getDriveFileIdentifier(accountId)) || accountId || "account").trim()
    
    const normalized = rawName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "account"

    return `vault-${normalized}.vault`

}

export const getGoogleDriveState = (accountId: string) => {

    const account = getStorage(accountId)
    const savedState = account && typeof account === "object" ? account.drive : null
    const settings = Array.isArray(account?.settings) ? account.settings : []
    const enabledSetting = settings.find((setting: any) => setting.id === "google-drive-enabled")

    if (!savedState || typeof savedState !== "object") {
        return {
            enabled: Boolean(enabledSetting?.value),
            connected: false,
            accessToken: "",
            email: ""
        }
    }

    return {
        enabled: Boolean(enabledSetting?.value),
        connected: Boolean(savedState.connected),
        accessToken: String(savedState.accessToken || ""),
        email: String(savedState.email || "")
    }

}

export const setGoogleDriveState = (accountId: string, state: Record<string, any>) => {

    const account = getStorage(accountId)
    const nextAccount = account && typeof account === "object" ? account : {}

    nextAccount.drive = {
        connected: Boolean(state.connected),
        accessToken: String(state.accessToken || ""),
        email: String(state.email || "")
    }

    setStorage(accountId, nextAccount)

}

export const disconnectGoogleDrive = (accountId: string) => {
    setGoogleDriveState(accountId, {
        connected: false,
        accessToken: "",
        email: ""
    })
    showAlert("Google Drive has been disconnected", "success", "brand-google-drive", 5000)
}

const ensureGoogleDriveSdk = () => new Promise<void>((resolve, reject) => {

    if (!isGoogleDriveConfigured()) {
        reject(new Error("Google Drive is not configured. Add PUBLIC_GOOGLE_CLIENT_ID to your .env file."))
        return
    }

    if (typeof window === "undefined") {
        reject(new Error("Google Drive sync is only available in the browser."))
        return
    }

    if (window.google && window.google.accounts && window.google.accounts.oauth2) {
        resolve()
        return
    }

    const existingScript = document.querySelector("script[data-google-gsi]") as HTMLScriptElement | null

    if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true })
        existingScript.addEventListener("error", () => reject(new Error("Could not load Google Identity Services.")), { once: true })
        return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.setAttribute("data-google-gsi", "true")
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Could not load Google Identity Services."))
    document.head.appendChild(script)

})

export const formatGoogleDriveUserLabel = (value: string) => {
    const normalized = String(value || "").trim()
    if (!normalized) {
        return "Google user"
    }

    const localPart = normalized.split("@")[0]
    return localPart || normalized
}

const getGoogleUserProfile = async (accessToken: string) => {

    const response = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!response.ok) {
        return "Google Drive user"
    }

    const data = await response.json()
    const userLabel = data?.user?.emailAddress || data?.user?.displayName || "Google Drive user"

    return formatGoogleDriveUserLabel(userLabel)

}

export const connectGoogleDrive = async ({ accountId }: { accountId: string }) => {

    if (!isGoogleDriveConfigured()) {
        showAlert("Google Drive is not configured. Add PUBLIC_GOOGLE_CLIENT_ID in .env.", "error", "exclamation-circle", 5000)
        return null
    }

    try {
        await ensureGoogleDriveSdk()

        return await new Promise<any>((resolve) => {
            const client = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: getGoogleClientId(),
                scope: DRIVE_SCOPE,
                prompt: "consent",
                callback: async (response: any) => {
                    if (response?.error) {
                        showAlert("Google Drive connection was denied", "error", "exclamation-circle", 5000)
                        resolve(null)
                        return
                    }

                    const token = String(response.access_token || "")
                    if (!token) {
                        showAlert("Google Drive connection failed: no access token returned", "error", "exclamation-circle", 5000)
                        resolve(null)
                        return
                    }

                    const email = await getGoogleUserProfile(token)
                    const nextState = {
                        connected: true,
                        accessToken: token,
                        email
                    }

                    setGoogleDriveState(accountId, nextState)
                    showAlert("Connected to Google Drive", "success", "brand-google-drive", 5000)
                    resolve(nextState)
                }
            })

            client.requestAccessToken()
        })
    } catch (error: any) {
        showAlert(error?.message || "Google Drive connection failed", "error", "exclamation-circle", 5000)
        return null
    }
}

const getDriveAppDataFiles = async (accountId: string) => {

    const state = getGoogleDriveState(accountId)
    const token = state.accessToken

    if (!token) {
        throw new Error("You are not connected to Google Drive")
    }

    const response = await fetch(`${DRIVE_API}/files?spaces=appDataFolder&fields=files(id,name)&supportsAllDrives=true`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error("Google Drive request failed")
    }

    const data = await response.json()
    const files = Array.isArray(data.files) ? data.files : []
    const expectedFileName = buildDriveFileName(accountId, getDriveFileIdentifier(accountId) || accountId).toLowerCase()

    return files.filter((file: any) => {
        if (typeof file?.name !== "string") {
            return false
        }

        const fileName = file.name.toLowerCase()
        return fileName.endsWith(".vault") && fileName === expectedFileName
    })
}

const getDriveAppDataFile = async (accountId: string) => {
    const files = await getDriveAppDataFiles(accountId)
    return files.length > 0 ? files[0] : null
}

const saveDriveFile = async ({ accountId, fileData }: { accountId: string, fileData: string }) => {

    const state = getGoogleDriveState(accountId)
    const token = state.accessToken

    if (!token) {
        throw new Error("You are not connected to Google Drive")
    }

    const driveFileId = getDriveFileIdentifier(accountId)
    if (!driveFileId) {
        throw new Error("Add a Google Drive File ID in Settings before syncing this account.")
    }

    const fileName = buildDriveFileName(accountId, driveFileId)
    const existingFile = await getDriveAppDataFile(accountId)

    const metadata = existingFile
        ? { name: fileName, mimeType: "application/octet-stream" }
        : { name: fileName, mimeType: "application/octet-stream", parents: ["appDataFolder"] }

    const boundary = "-------314159265358979323846"
    const body =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: application/octet-stream\r\n\r\n` +
        `${fileData}\r\n` +
        `--${boundary}--`

    const url = existingFile
        ? `${DRIVE_UPLOAD_API}/files/${existingFile.id}?uploadType=multipart&supportsAllDrives=true`
        : `${DRIVE_UPLOAD_API}/files?uploadType=multipart&supportsAllDrives=true`

    const response = await fetch(url, {
        method: existingFile ? "PATCH" : "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary="${boundary}"`
        },
        body
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Could not update the Google Drive file")
    }

    return true
}

export const pushLocalAccountToGoogleDrive = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {

    const state = getGoogleDriveState(accountId)

    if (!state.connected || !state.accessToken) {
        showAlert("Connect to Google Drive before pushing your data", "error", "exclamation-circle", 5000)
        return false
    }

    if (!getDriveFileIdentifier(accountId)) {
        showAlert("Add a Google Drive File ID in Settings before pushing data", "error", "exclamation-circle", 5000)
        return false
    }

    const account = getStorage(accountId)
    if (!account) {
        showAlert("No account data found to sync", "error", "exclamation-circle", 5000)
        return false
    }

    try {

        const encryptedData = await encodeData(masterPassword, JSON.stringify(account))
        await saveDriveFile({ accountId, fileData: encryptedData })
        showAlert("Local account data was uploaded to Google Drive", "success", "database-import", 5000)
        return true

    } catch (error: any) {

        showAlert(error?.message || "Could not upload the account to Google Drive", "error", "exclamation-circle", 5000)

        return false

    }

}

export const pullGoogleDriveToAccount = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {

    const state = getGoogleDriveState(accountId)

    if (!state.connected || !state.accessToken) {
        showAlert("Connect to Google Drive before syncing data", "error", "exclamation-circle", 5000)
        return false
    }

    const driveFileId = getDriveFileIdentifier(accountId)
    if (!driveFileId) {
        showAlert("Add a Google Drive File ID in Settings before pulling data", "error", "exclamation-circle", 5000)
        return false
    }

    try {

        const files = await getDriveAppDataFiles(accountId)
        if (!files.length) {
            showAlert("No matching file was found in Google Drive for ID: <b>" + driveFileId + "</b>", "error", "exclamation-circle", 5000)
            return false
        }

        let lastError: any = null

        for (const file of files) {
            try {
                const response = await fetch(`${DRIVE_API}/files/${file.id}?alt=media`, {
                    headers: {
                        Authorization: `Bearer ${state.accessToken}`
                    }
                })

                if (!response.ok) {
                    throw new Error("Could not download the Google Drive file")
                }

                const encryptedData = await response.text()
                const decodedData = await decodeData(masterPassword, encryptedData)
                const parsedData = JSON.parse(decodedData)

                setStorage(accountId, parsedData)
                showAlert("Google Drive data was applied to this account", "success", "database-export", 5000)
                return true
            } catch (error: any) {
                lastError = error
            }
        }

        if (lastError) {
            throw lastError
        }

        showAlert("No valid Google Drive vault could be decrypted with this master password", "error", "exclamation-circle", 5000)

        return false

    } catch (error: any) {
        showAlert(error?.message || "Could not import the account from Google Drive", "error", "exclamation-circle", 5000)
        return false
    }

}
