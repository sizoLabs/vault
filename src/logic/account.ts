import { getStorage, setStorage } from "@logic/storage"

import { generateAccountId } from "@logic/utils"
import { setMasterVerifier, verifyMasterPassword } from "@logic/master"

import { createDefaultAlphabet } from "@logic/alphabet"
import { createDefaultVault } from "@logic/vault"
import { createDefaultSettings } from "@logic/settings"
import { encodeData, decodeData, downloadFile } from "@logic/utils"
import { showAlert } from "@logic/alert"

export const importAccount = (data: any) => {
    setStorage('account', data)
}

export const createAccount = (accountName: string) => {

    const accounts = getStorage('accounts')
    const accountId = generateAccountId()

    if(!accounts) {
        setStorage('accounts', [ accountId ])
    } else {
        accounts.push(accountId)
        setStorage('accounts', accounts)
    }
    
    setStorage('current-account', accountId)

    createAccountData({ accountName, accountId })

}

const createAccountData = ({ accountName, accountId }: { accountName: string, accountId: string })  => {
    createDefaultAlphabet(accountId)
    createDefaultVault(accountId)
    createDefaultSettings({ accountName, accountId })
}

export const getAccountsLength = () => {
    const accounts = getStorage('accounts')
    if(!accounts || accounts.length === 0) return 0
    return accounts.length
}

export const getAccounts = () => {
    const accounts = getStorage('accounts')
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
        const nameSetting = account.settings.find((setting: any) => setting.id === 'account-name')
        if (nameSetting) return nameSetting.value
    }
    return accountId
}

export const updateAccount = (id: string) => {

    const accounts = getAccounts()

    for (let index = 0; index < accounts.length; index++) {
        if(accounts[index] === id) {
            console.log("updateAccount")
            break
        }
    }

    setStorage('accounts', accounts)
    
}

export const deleteAccount = (id: string) => {

    const accounts = getAccounts()

    for (let index = 0; index < accounts.length; index++) {
        if(accounts[index] === id) {
            accounts.splice(index, 1)
            break
        }
    }

    setStorage('accounts', accounts)
    
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

export const exportAccountData = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {

    const account = getStorage(accountId)
    const encodedData = await encodeData(masterPassword, JSON.stringify(account))
    const timestamp = Date.now()

    downloadFile(encodedData, 'data_' + timestamp + '.vault', 'application/octet-stream')

    showAlert("aaaa", 'success', 'database-export', 5000)
    
}

const normalizeFields = (data: any): any => {

    if (Array.isArray(data)) {
        return data.map(item => normalizeFields(item))
    }

    if (data !== null && typeof data === 'object') {

        const normalized: any = {}

        for (const key in data) {

            if (data.hasOwnProperty(key)) {

                const value = data[key]
                let newKey = key
                
                if (key === "folder") {
                    newKey = "vault"
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
                description: ""
            }))
        }

        return normalized

    }

    return data

}

const detectImportFileFormat = (file: File): 'vault' | 'ovni' | null => {
    const fileName = file?.name?.toLowerCase() || ''
    if (fileName.endsWith('.vault')) return 'vault'
    if (fileName.endsWith('.ovni')) return 'ovni'
    return null
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
        showAlert("No file was selected", 'error', 'exclamation-circle', 6000)
        return
    }

    const fileFormat = detectImportFileFormat(file)

    if (!fileFormat) {
        showAlert("Unsupported file format. Use .vault or .ovni.", 'error', 'exclamation-circle', 8000)
        return
    }

    const reader = new FileReader()

    reader.readAsText(file)
    reader.onload = async () => {

        try {

            const data = reader.result as string
            const decodedData = await decodeData(masterPassword, data)
            const parsedData = JSON.parse(decodedData)

            console.log('Imported file format:', fileFormat)
            console.log(parsedData)

            let account = getStorage(accountId)

            if(fileFormat === "ovni") {

                const normalData = normalizeFields(parsedData)

                console.log(normalData)

                const defaultSettings = [
                    {
                        id: "account-name",
                        value: account.settings[0].value
                    },
                    {
                        id: "default-password-length",
                        value: 14
                    },
                    {
                        id: "default-alphabet",
                        value: normalData.alphabet[0].id
                    },
                    {
                        id: "show-passwords",
                        value: false
                    },
                    {
                        id: "show-animations",
                        value: true
                    }
                ]

                account = {
                    settings: defaultSettings,
                    alphabets: normalData.alphabet,
                    vaults: normalData.vaults,
                    services: normalData.services
                }

                setStorage(accountId, account)

                setAccountMasterPassword({
                    accountId,
                    masterPassword
                })

            }

            /*let account = getStorage(accountId)

            account = {
                settings: settings,
                alphabet: alphabet,
                vaults: folders,
                services: passwords
            }

            setStorage(accountId, account)*/

            onImportComplete()

            showAlert("Data imported to your account!", 'success', 'database-import', 6000)

        } catch(e) {

            showAlert("Master Password does not match", 'error', 'exclamation-circle', 8000)

        }

    }
    
}