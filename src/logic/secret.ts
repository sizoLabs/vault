import { getStorage, setStorage } from "@logic/storage"
import { showAlert } from "@logic/alert"
import { generateId, encodeData, decodeData, copyToClipboard } from "@logic/utils"
import { type ISecret } from "@interface/index"

export const importSecrets = ({ accountId, secrets }: { accountId: string, secrets: ISecret[] }) => {

    let account = getStorage(accountId)

    account = {
        ...account,
        secrets: secrets
    }

    setStorage(accountId, account)

}

export const getSecretCount = (accountId: string) => {
    let account = getStorage(accountId)
    const secrets = account.secrets
    if(!secrets || secrets.length === 0) return 0
    return secrets.length
}

export const getSecretCountInVault = (accountId: string, vaultId: string) => {
    let account = getStorage(accountId)
    const secrets = account.secrets
    if(!secrets || secrets.length === 0) return 0
    return secrets.filter((secret: ISecret) => secret.vault === vaultId).length
}

export const getAllSecretList = (accountId: string) => {
    let account = getStorage(accountId)
    const secrets = account.secrets
    if(!secrets) return []
    return secrets
}

export const getSecretList = ({ accountId, vaultId, masterPassword }: { accountId: string, vaultId: string, masterPassword?: string }): any => {

    let account = getStorage(accountId)
    const secrets = account.secrets

    if(!secrets) return []

    const vaultSecrets = [] as ISecret[]

    for (let index = 0; index < secrets.length; index++) {
        if(secrets[index].vault === vaultId) {
            vaultSecrets.push(secrets[index])
        }
    }

    return vaultSecrets

}

export const getSecret = ({ accountId, secretId }: { accountId: string, secretId: string }) => {

    let account = getStorage(accountId)
    const secrets = account.secrets

    if(!secrets) return undefined

    for (let index = 0; index < secrets.length; index++) {
        if(secrets[index].id === secretId) {
            const secret = { ...secrets[index] }
            return secret
        }
    }

}

export const createSecret = async ({
    accountId,
    name,
    content,
    description,
    icon,
    vault,
    masterPassword
}: {
    accountId: string,
    name: string,
    content: string,
    description: string,
    icon: string,
    vault: string,
    masterPassword: string
}) => {

    let account = getStorage(accountId)
    let secrets = account.secrets

    if(!secrets) secrets = [] as ISecret[]

    const encryptedContent = await encodeData(masterPassword, content)
    const encryptedDescription = await encodeData(masterPassword, description)

    const newSecret: ISecret = {
        id: generateId(),
        name: name,
        content: encryptedContent,
        description: encryptedDescription,
        icon: icon,
        vault: vault
    }

    secrets.push(newSecret)

    account = {
        ...account,
        secrets: secrets
    }

    setStorage(accountId, account)
    
}

export const updateSecret = async ({
    accountId,
    secretId,
    name,
    content,
    description,
    icon,
    vault,
    masterPassword
}: {
    accountId: string,
    secretId: string,
    name: string,
    content: string,
    icon: string,
    description: string,
    vault: string,
    masterPassword: string
}) => {

    let account = getStorage(accountId)
    let secrets = account.secrets

    const encryptedContent = await encodeData(masterPassword, content)
    const encryptedDescription = await encodeData(masterPassword, description)

    for (let index = 0; index < secrets.length; index++) {
        if(secrets[index].id === secretId) {
            secrets[index].name = name === "" ? "" : name
            secrets[index].content = encryptedContent
            secrets[index].description = encryptedDescription
            secrets[index].icon = icon
            secrets[index].vault = vault
            break
        }
    }

    account = {
        ...account,
        secrets: secrets
    }

    setStorage(accountId, account)
    
}

export const deleteSecret = ({ accountId, secretId }: { accountId: string, secretId: string }) => {


    let account = getStorage(accountId)
    let secrets = account.secrets

    for (let index = 0; index < secrets.length; index++) {
        if(secrets[index].id === secretId) {
            secrets.splice(index, 1)
            break
        }
    }
    
    account = {
        ...account,
        secrets: secrets
    }

    setStorage(accountId, account)

}

export const copySecretToClipboard = async ({
    accountId,
    masterPassword,
    secretId
}: {
    accountId: string,
    masterPassword: string,
    secretId: string,
}) => {

    try {

        const secret = getSecret({ accountId, secretId })

        if(!secret) {
            showAlert('Secret not found', 'error', 'alert-circle', 3000)
            return
        }

        const secretContent = await decodeData(masterPassword, secret.content)

        copyToClipboard(secretContent)
        
        showAlert(
            `<b>${ secret.name === "" ? "Secret" : secret.name }</b> copied to clipboard!`,
            'success',
            'check', 
            3000
        )

    } catch (error) {
        showAlert('Error copying secret', 'error', 'alert-circle', 3000)
    }

}

export const getSecretContent = async (data: string, masterPassword: string) => {
    return await decodeData(masterPassword, data)
}