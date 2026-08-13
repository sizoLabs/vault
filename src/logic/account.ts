import { getStorage, setStorage } from "@logic/storage"

import { generateAccountId } from "@logic/utils"
import { setMasterVerifier, verifyMasterPassword } from "@logic/master"

import { createDefaultAlphabet } from "@logic/alphabet"
import { createDefaultVault } from "@logic/vault"
import { createDefaultSettings } from "@logic/settings"

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

export const setAccountMasterPassword = async (accountId: string, masterPassword: string) => {
        await setMasterVerifier(accountId, masterPassword)
}

export const checkAccountMasterPassword = async (accountId: string, masterPassword: string) => {
        return await verifyMasterPassword(accountId, masterPassword)
}