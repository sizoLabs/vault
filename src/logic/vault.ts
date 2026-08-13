import { getStorage, setStorage } from "@logic/storage"
import { generateId } from "@logic/utils"

export const importVaults = (data: any) => {
    setStorage('vaults', data)
}

export const createDefaultVault = (accountId: string) => {

    let account = getStorage(accountId)

    if(account && account.vaults && (account.vaults.length > 0 || account.vaults.length === 0)) return

    const defaultVault = [
        {
            id: generateId(),
            name: 'My Vault',
            icon: 'vault'
        }
    ]

    account = {
        ...account,
        vaults: defaultVault
    }

    setStorage(accountId, account)

}

export const getVaultCount = (accountId: string) => {
    let account = getStorage(accountId)
    const vaults = account.vaults
    if(!vaults || vaults.length === 0) return 0
    return vaults.length
}

export const getVaultList = (accountId: string) => {
    let account = getStorage(accountId)
    const vaults = account.vaults
    if(!vaults || vaults.length === 0) return []
    return vaults
}

export const getVault = ({ accountId, vaultId }: { accountId: string, vaultId: string }) => {

    const vaults = getVaultList(accountId)

    for (let index = 0; index < vaults.length; index++) {
        if(vaults[index].id === vaultId) return vaults[index]
    }

}

export const createVault = ({ accountId, vaultName, vaultIcon }: { accountId: string, vaultName: string, vaultIcon: string }) => {
    
    let account = getStorage(accountId)
    const vaults = getVaultList(accountId)

    const newVault = {
        id: generateId(),
        name: vaultName,
        icon: vaultIcon
    }

    vaults.push(newVault)

    account = {
        ...account,
        vaults: vaults
    }

    setStorage(accountId, account)
    
}

export const updateVault = ({
    accountId,
    vaultId,
    vaultName,
    vaultIcon
}: {
    accountId: string,
    vaultId: string,
    vaultName: string,
    vaultIcon: string
}) => {

    let account = getStorage(accountId)
    const vaults = getVaultList(accountId)

    for (let index = 0; index < vaults.length; index++) {
        if(vaults[index].id === vaultId) {
            vaults[index].name = vaultName
            vaults[index].icon = vaultIcon
            break
        }
    }

    account = {
        ...account,
        vaults: vaults
    }

    setStorage(accountId, account)
    
}

export const deleteVault = ({ accountId, vaultId }: { accountId: string, vaultId: string }) => {

    let account = getStorage(accountId)
    const vaults = getVaultList(accountId)

    for (let i = 0; i < vaults.length; i++) {
        if(vaults[i].id === vaultId) {
            vaults.splice(i, 1)
            break
        }
    }

    account = {
        ...account,
        vaults: vaults
    }

    setStorage(accountId, account)
    
}