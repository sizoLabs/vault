import { getStorage, setStorage, removeStorage } from "@logic/storage"

import { generateAccountId } from "@logic/utils"
import { setMasterVerifier, verifyMasterPassword } from "@logic/master"

import { createDefaultAlphabet } from "@logic/alphabet"
import { createDefaultVault } from "@logic/vault"
import { createDefaultSettings } from "@logic/settings"
import { encodeData, decodeData, downloadFile } from "@logic/utils"
import { showAlert } from "@logic/alert"

export const importAccount = (data: any) => {
    setStorage("account", data)
}

export const createAccount = (accountName: string, accountIcon = "user") => {

    const accounts = getStorage("accounts")
    const accountId = generateAccountId()

    if(!accounts) {
        setStorage("accounts", [ accountId ])
    } else {
        accounts.push(accountId)
        setStorage("accounts", accounts)
    }
    
    setStorage("current-account", accountId)

    createAccountData(accountId, accountName, accountIcon)

}

const createAccountData = (accountId: string, accountName = "Personal Account", accountIcon = "user")  => {
    createDefaultAlphabet(accountId)
    createDefaultVault(accountId)
    createDefaultSettings(accountId, accountName, accountIcon)
}

export const getAccountsLength = () => {
    const accounts = getStorage("accounts")
    if(!accounts || accounts.length === 0) return 0
    return accounts.length
}

export const getAccounts = () => {
    const accounts = getStorage("accounts")
    if(!accounts || accounts.length === 0) return []
    return accounts
}

export const getAccount = (id: string) => {
    const accounts = getAccounts()
    for (let index = 0; index < accounts.length; index++) {
        if(accounts[index] == id) return accounts[index]
    }
}

export const getAccountName = (accountId: string) => {
    const account = getStorage(accountId)
    if (account && account.settings) {
        const nameSetting = account.settings.find((setting: any) => setting.id === "account-name")
        if (nameSetting) return nameSetting.value
    }
    return accountId
}

export const getAccountIcon = (accountId: string) => {
    const account = getStorage(accountId)
    if (account && account.settings) {
        const iconSetting = account.settings.find((setting: any) => setting.id === "account-icon")
        if (iconSetting) return iconSetting.value
    }
    return "user"
}

export const updateAccount = (id: string) => {

    const accounts = getAccounts()

    for (let index = 0; index < accounts.length; index++) {
        if(accounts[index] === id) {
            break
        }
    }

    setStorage("accounts", accounts)
    
}

export const deleteAccount = (id: string) => {

    const accounts = getAccounts()

    for (let index = 0; index < accounts.length; index++) {
        if(accounts[index] === id) {
            accounts.splice(index, 1)
            break
        }
    }

    if (getStorage("current-account") === id) {
        setStorage("current-account", "")
    }

    removeStorage(id)
    
    setStorage("accounts", accounts)
    
}

export const exportAccountData = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {
    const account = getStorage(accountId)
    const exportPayload = account && typeof account === "object" ? { ...account } : {}
    delete exportPayload.drive

    const encodedData = await encodeData(masterPassword, JSON.stringify(exportPayload))
    downloadFile(encodedData, getExportFileName(accountId), "application/octet-stream")
    showAlert("Data exported successfully!", "success", "database-export", 5000)
}

export const importAccountData = ({
    accountId,
    masterPassword,
    event,
    onImportComplete
}: {
    accountId: string,
    masterPassword: string,
    event: any,
    onImportComplete: () => void
}) => {

    const file = event?.target?.files?.[0]

    if (!file) {
        showAlert("No file was selected", "error", "exclamation-circle", 5000)
        return
    }

    const fileFormat = detectImportFileFormat(file)

    if (!fileFormat) {
        showAlert("Unsupported file format. Use .vault", "error", "exclamation-circle", 5000)
        return
    }

    const reader = new FileReader()

    reader.readAsText(file)
    reader.onload = async () => {

        try {

            const data = reader.result as string
            const decodedData = await decodeData(masterPassword, data)
            const parsedData = JSON.parse(decodedData)

            let account = getStorage(accountId)

            if(fileFormat === "ovni") {

                const normalData = normalizeFields(parsedData)
                const importedAlphabets = Array.isArray(normalData.alphabets) ? normalData.alphabets : []

                const defaultSettings = [
                    {
                        id: "account-name",
                        value: account.settings[0].value
                    },
                    {
                        id: "account-icon",
                        value: "user"
                    },
                    {
                        id: "default-password-length",
                        value: 14
                    },
                    {
                        id: "default-alphabet",
                        value: importedAlphabets[0].id
                    },
                    {
                        id: "show-passwords",
                        value: false
                    },
                    {
                        id: "show-animations",
                        value: true
                    },
                    {
                        id: "theme-color",
                        value: "#a58fff"
                    },
                    {
                        id: "disable-gradient-background",
                        value: false
                    },
                    {
                        id: "disable-colored-background",
                        value: false
                    }
                ]

                account = {
                    settings: defaultSettings,
                    alphabets: importedAlphabets,
                    vaults: normalData.vaults,
                    services: normalData.services
                }

                setStorage(accountId, account)

                setAccountMasterPassword({
                    accountId,
                    masterPassword
                })

            } else {
                setStorage(accountId, parsedData)
            }

            onImportComplete()

            showAlert("Data imported to your account!", "success", "database-import", 5000)

        } catch(e) {
            showAlert("Master Password does not match", "error", "exclamation-circle", 5000)
            console.error("Error importing account data:", e)
        }

    }
    
}

export const setAccountMasterPassword = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {
        await setMasterVerifier({ accountId, masterPassword })
}

export const checkAccountMasterPassword = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {
        return await verifyMasterPassword({ accountId, masterPassword })
}

export const changeMasterPassword = async ({
    accountId,
    newMasterPassword
}: {
    accountId: string,
    newMasterPassword: string
}) => {
    if (!newMasterPassword || newMasterPassword.trim() === "") {
        showAlert("Master password cannot be empty", "error", "exclamation-circle", 5000)
        return false
    }
    try {
        await setMasterVerifier({ accountId, masterPassword: newMasterPassword })
        showAlert("Master password changed successfully!", "success", "key", 5000)
        return true
    } catch (error) {
        showAlert("Failed to change master password", "error", "exclamation-circle", 5000)
        return false
    }
}

const getExportFileName = (accountId: string) => {

    const rawAccountName = getAccountName(accountId)
    const safeAccountName = rawAccountName
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "account"

    const now = new Date()
    const day = String(now.getDate()).padStart(2, "0")
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const year = now.getFullYear()
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")

    return `${safeAccountName}_${day}-${month}-${year}_${hours}${minutes}${seconds}.vault`

}

const normalizeFields = (data: any): any => {

    if (Array.isArray(data)) {
        return data.map(item => normalizeFields(item))
    }

    if (data !== null && typeof data === "object") {

        const normalized: any = {}

        for (const key in data) {

            if (data.hasOwnProperty(key)) {

                const value = data[key]
                let newKey = key
                
                if (key === "folder") {
                    newKey = "vault"
                } else if (key === "alphabet" && Array.isArray(value)) {
                    newKey = "alphabets"
                } else if (key === "passwords") {
                    newKey = "services"
                } else if (key === "folders") {
                    newKey = "vaults"
                } else if (key.endsWith("id") && key !== "id") {
                    newKey = "id"
                }
                
                normalized[newKey] = normalizeFields(value)
            }
        }

        if (Array.isArray(normalized.services)) {
            normalized.services = normalized.services.map((service: any) => ({
                ...service,
                icon: "password-user",
                description: "",
                url: ""
            }))
        }

        if (Array.isArray(normalized.alphabets)) {
            normalized.alphabets = normalized.alphabets.map((alphabet: any) => ({
                ...alphabet,
                icon: "abc"
            }))
        }

        return normalized

    }

    return data

}

const detectImportFileFormat = (file: File): "vault" | "ovni" | null => {
    const fileName = file?.name?.toLowerCase() || ""
    if (fileName.endsWith(".vault")) return "vault"
    if (fileName.endsWith(".ovni")) return "ovni" // For old .ovni files compatibility
    return null
}