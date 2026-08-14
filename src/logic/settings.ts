import { getStorage, setStorage } from "@logic/storage"
import { getAlphabetList } from "@logic/alphabet"
import { normalizeHex, mixWithWhite } from "@logic/utils"
import { applyBackgroundSVG } from "@logic/background"

const DEFAULT_THEME_COLOR = "#a58fff"

export const importSettings = (data: any) => {
    setStorage("settings", data)
}

export const applyThemeColor = (accountId: string) => {

    if (typeof document === "undefined") return

    const color = normalizeHex(DEFAULT_THEME_COLOR, String(getSetting({ accountId, settingId: "theme-color" }) || DEFAULT_THEME_COLOR))

    document.documentElement.style.setProperty("--color-primary", color)
    
    applyBackgroundSVG(color)

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
            id: "default-alphabet",
            value: defaultAlphabet
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
            value: DEFAULT_THEME_COLOR
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
            id: "default-alphabet",
            type: "select"
        },
        {
            id: "show-passwords",
            type: "toggle"
        },
        {
            id: "show-animations",
            type: "toggle"
        },
        {
            id: "theme-color",
            type: "color"
        }
    ]

    return settings

}

export const getAccountSettings = (accountId: string) => {
    const account = getStorage(accountId)
    const settings = account?.settings
    if(!settings || settings.length === 0) return []
    return settings
}

export const getSetting = ({ accountId, settingId }: { accountId: string, settingId: string }) => {
    const settings = getAccountSettings(accountId)
    for (let index = 0; index < settings.length; index++) {
        if(settings[index].id === settingId) return settings[index].value
    }
}

export const updateSettings = ({ accountId, settingId, value }: { accountId: string, settingId: string, value: string | number | boolean }) => {

    let account = getStorage(accountId)

    const settings = Array.isArray(account.settings) ? account.settings : []

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