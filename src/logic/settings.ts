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

export const createDefaultSettings = (accountId: string, customAccountName = "Personal Account", customAccountIcon = "user") => {

    let account = getStorage(accountId)
    const alphabets = getAlphabetList(accountId)

    if(!account) account = {}

    const defaultAlphabet = alphabets && alphabets.length > 0 ? alphabets[0].id : "default"

    const defaultSettings = [
        {
            id: "account-name",
            value: customAccountName
        },
        {
            id: "account-icon",
            value: customAccountIcon
        },
        {
            id: "store-master-verifier",
            value: true
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
        },
        {
            id: "google-drive-enabled",
            value: false
        },
        {
            id: "google-drive-file-id",
            value: ""
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
            placeholder: "E.g. Personal Account",
            type: "text"
        },
        {
            id: "account-icon",
            name: "Account Icon",
            description: "The icon for your account.",
            type: "icon"
        },
        {
            id: "store-master-verifier",
            name: "Master Password Verification",
            description: "Keep a verifier in local storage so the app can validate the master password on access. Disable it to skip this check entirely.",
            type: "toggle"
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
        },
        {
            id: "google-drive-enabled",
            name: "Google Drive Sync",
            description: "Enable synchronization of this account with a Google Drive appdata folder.",
            type: "toggle"
        },
        {
            id: "google-drive-file-id",
            name: "Google Drive File ID",
            description: "Use a unique ID to name this vault file in Google Drive.",
            placeholder: "E.g. personal-vault",
            type: "text"
        }
    ]

    return settings

}

export const getAccountSettings = (accountId: string) => {
    const account = getStorage(accountId)
    const settings = Array.isArray(account?.settings) ? [ ...account.settings ] : []

    if (!settings.some((setting: { id?: string }) => setting?.id === "store-master-verifier")) {
        settings.push({ id: "store-master-verifier", value: true })
    }

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

    const settingIndex = settings.findIndex((setting: { id: string }) => setting.id === settingId)
    
    if (settingIndex !== -1) {
        settings[settingIndex].value = value
    } else {
        settings.push({ id: settingId, value })
    }

    account = {
        ...account,
        settings: settings
    }

    setStorage(accountId, account)
    
}