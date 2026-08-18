import { getStorage, setStorage } from "@logic/storage"
import { createDefaultAlphabet } from "@logic/alphabet"
import { createDefaultVault } from "@logic/vault"
import { createDefaultSettings } from "@logic/settings"
import { deleteChromeExtensionAccount } from "@logic/service"

export const resetAllData = async (accountId: string) => {
    createDefaultAlphabet(accountId)
    createDefaultVault(accountId)
    createDefaultSettings(accountId)

    const account = getStorage(accountId) || {}
    const { drive: _drive, ...rest } = account && typeof account === "object" ? account : {}

    setStorage(accountId, {
        ...rest,
        services: [],
        secrets: []
    })

    await deleteChromeExtensionAccount({ accountId })
}