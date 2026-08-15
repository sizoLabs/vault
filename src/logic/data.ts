import { getStorage, setStorage } from "@logic/storage"
import { createDefaultAlphabet } from "@logic/alphabet"
import { createDefaultVault } from "@logic/vault"
import { createDefaultSettings } from "@logic/settings"

export const resetAllData = (accountId: string) => {
    
    createDefaultAlphabet(accountId)
    createDefaultVault(accountId)
    createDefaultSettings(accountId)

    const account = getStorage(accountId) || {}

    setStorage(accountId, {
        ...account,
        services: [],
        secrets: []
    })

}