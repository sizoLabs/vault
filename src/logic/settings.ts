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

export const createDefaultSettings = (accountId: string) => {

    let account = getStorage(accountId)
    const alphabets = getAlphabetList(accountId)

    if(!account) account = {}

    const defaultAlphabet = alphabets && alphabets.length > 0 ? alphabets[0].id : "default"

    const defaultSettings = [
        {
            id: "account-name",
            value: "Personal Account"
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
        ...account,
        settings: defaultSettings
    }

    setStorage(accountId, account)

}

export const getSettings = () => {

    const settings = [
        {
            id: "account-name",
            name: "Account Name",
            description: "The name of your account.",
            type: "text"
        },
        {
            id: "default-password-length",
            name: "Default Password Length",
            description: "The default length for generated passwords.",
            type: "number"
        },
        {
            id: "default-alphabet",
            name: "Default Alphabet",
            description: "The default alphabet for generating passwords.",
            type: "select"
        },
        {
            id: "show-passwords",
            name: "Show Passwords",
            description: "Toggle the visibility of passwords.",
            type: "toggle"
        },
        {
            id: "show-animations",
            name: "Show Page Animations",
            description: "Toggle the web animations.",
            type: "toggle"
        },
        {
            id: "theme-color",
            name: "Theme Color",
            description: "The primary color for the application's theme.",
            type: "color"
        },
        {
            id: "disable-gradient-background",
            name: "Disable Gradient Background",
            description: "Toggle the background to gradient or solid color.",
            type: "toggle"
        },
        {
            id: "disable-colored-background",
            name: "Disable Colored Background",
            description: "Toggle the background to colored or monotone.",
            type: "toggle"
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