import { getStorage, setStorage } from "@logic/storage"
import { getAlphabetList } from "@logic/alphabet"

export const importSettings = (data: any) => {
    setStorage("settings", data)
}

export const createDefaultSettings = ({ accountName, accountId }: { accountName: string, accountId: string }) => {

    let account = getStorage(accountId)
    const settings = getAccountSettings(accountId)

    if(settings && settings.length > 0) return

    const defaultAlphabet = getAlphabetList(accountId)[0].aid

    const defaultSettings = [
        {
            id: "account-name",
            value: accountName
        },
        {
            id: "default-password-length",
            value: 14
        },
        {
            id: "default-show-passwords",
            value: false
        },
        {
            id: "default-alphabet",
            value: defaultAlphabet
        }
    ]

    account = {
        ...account,
        settings: defaultSettings
    }

    setStorage(accountId, account)

}

export const getSettings = () => {

    const settings = [
        {
            id: "account-name",
            type: "text"
        },
        {
            id: "default-password-length",
            type: "number"
        },
        {
            id: "default-show-passwords",
            type: "toggle"
        },
        {
            id: "default-alphabet",
            type: "select"
        },
        {
            id: "enable-vault-sorting",
            type: "toggle"
        },
        {
            id: "enable-password-sorting",
            type: "toggle"
        }
    ]

    return settings

}

export const getAccountSettings = (accountId: string) => {
    let account = getStorage(accountId)
    const settings = account.settings
    if(!settings || settings.length === 0) return []
    return settings
}

export const getSetting = ({ accountId, settingId }: { accountId: string, settingId: string }) => {
    const settings = getAccountSettings(accountId)
    for (let index = 0; index < settings.length; index++) {
        if(settings[index].id === settingId) return settings[index]
    }
}

export const updateSettings = ({ accountId, settingId, value }: { accountId: string, settingId: string, value: string } ) => {
    
    let account = getStorage(accountId)
    const settings = getAccountSettings(accountId)

    for (let index = 0; index < settings.length; index++) {
        if(settings[index].id === settingId) {
            settings[index].value = value
            break
        }
    }

    account = {
        ...account,
        settings: settings
    }

    setStorage(accountId, account)
    
}