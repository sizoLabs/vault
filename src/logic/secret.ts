import { getStorage, setStorage } from "@logic/storage"
import { generateId } from "@logic/utils"
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

export const getAllSecretList = (accountId: string) => {
    let account = getStorage(accountId)
    const secrets = account.secrets
    if(!secrets) return []
    return secrets
}

export const getSecretList = ({ accountId, vaultId }: { accountId: string, vaultId: string }): any => {

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

    if(!secrets) return []

    for (let index = 0; index < secrets.length; index++) {
        if(secrets[index].id === secretId) return secrets[index]
    }

}

export const createSecret = ({
    accountId,
    name,
    content,
    description,
    vault
}: {
    accountId: string,
    name: string,
    content: string,
    description: string,
    vault: string
}) => {

    let account = getStorage(accountId)
    let secrets = account.secrets

    if(!secrets) secrets = [] as ISecret[]

    const newSecret: ISecret = {
        id: generateId(),
        name: name,
        content: content,
        description: description,
        vault: vault
    }

    secrets.push(newSecret)

    account = {
        ...account,
        secrets: secrets
    }

    setStorage(accountId, account)
    
}

export const updateSecret = ({
    accountId,
    secretId,
    name,
    content,
    description,
    vault
}: {
    accountId: string,
    secretId: string,
    name: string,
    content: string,
    description: string,
    vault: string
}) => {

    let account = getStorage(accountId)
    let secrets = account.secrets

    for (let index = 0; index < secrets.length; index++) {
        if(secrets[index].id === secretId) {
            secrets[index].name = name
            secrets[index].content = content
            secrets[index].description = description
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