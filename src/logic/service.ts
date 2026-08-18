import { getStorage, setStorage } from "@logic/storage"
import { generateId, genServicePassword, copyToClipboard, encodeData, decodeData } from "@logic/utils"
import { showAlert } from "@logic/alert"
import { type IService } from "@interface/index"
import { getAlphabetList } from "@logic/alphabet"
import { getAccountName, getAccountIcon } from "@logic/account"

export const getServiceDescription = async (data: string, masterPassword: string) => {
    if (!data || typeof data !== 'string' || data.trim() === '') return ""
    try {
        return await decodeData(masterPassword, data)
    } catch (error) {
        console.error('Error decoding service description:', error)
        return ""
    }
}

export const syncServicesWithChromeExtension = ({ accountId }: { accountId?: string } = {}) => {

    const resolvedAccountId = accountId || getStorage("current-account")
    const currentAccount = resolvedAccountId ? getStorage(resolvedAccountId) : null

    if (!currentAccount || typeof window === "undefined") {
        return showAlert("Failed to sync services with Chrome extension", "error", "x", 2500)
    }

    const services = Array.isArray(currentAccount.services) ? currentAccount.services : []
    const alphabets = Array.isArray(currentAccount.alphabets) ? currentAccount.alphabets : []
    const info = {
        id: resolvedAccountId,
        name: getAccountName(resolvedAccountId),
        icon: getAccountIcon(resolvedAccountId),
    }
    const master = currentAccount.master || null

    const detail = {
        source: "vault-extension-sync",
        payload: {
            info,
            services,
            alphabets,
            master
        }
    }

    window.postMessage(detail, "*")
    showAlert("Vault synchronized with extension!", "success", "check", 2500)
    return true

}

export const importServices = ({ accountId, services }: { accountId: string, services: IService[] }) => {

    let account = getStorage(accountId)

    account = {
        ...account,
        services: services
    }

    setStorage(accountId, account)

}

export const getServiceCount = (accountId: string) => {
    let account = getStorage(accountId)
    const services = account.services
    if(!services || services.length === 0) return 0
    return services.length
}

export const getServiceCountInVault = (accountId: string, vaultId: string) => {
    let account = getStorage(accountId)
    const services = account.services
    if(!services || services.length === 0) return 0
    return services.filter((service: IService) => service.vault === vaultId).length
}

export const getAllServiceList = (accountId: string) => {
    let account = getStorage(accountId)
    const services = account.services
    if(!services) return []
    return services
}

export const getServiceList = ({ accountId, vaultId }: { accountId: string, vaultId: string }): any => {

    let account = getStorage(accountId)
    const services = account.services

    if(!services) return []

    const vaultServices = [] as IService[]

    for (let index = 0; index < services.length; index++) {
        if(services[index].vault === vaultId) {
            vaultServices.push(services[index])
        }
    }

    return vaultServices

}

export const getService = ({ accountId, serviceId }: { accountId: string, serviceId: string }) => {

    let account = getStorage(accountId)
    const services = account.services

    if(!services) return []

    for (let index = 0; index < services.length; index++) {
        if(services[index].id === serviceId) return services[index]
    }

}

export const createService = async ({
    accountId,
    name,
    vaultId,
    description,
    url,
    icon,
    identifier,
    alphabet,
    length,
    masterPassword
}: {
    accountId: string,
    vaultId: string,
    name: string,
    description: string,
    url: string,
    icon: string,
    identifier: string,
    alphabet: string,
    length: number,
    masterPassword: string
}) => {

    let account = getStorage(accountId)
    let services = account.services

    if(!services) services = [] as IService[]

    const encryptedDescription = description ? await encodeData(masterPassword, description) : ""

    const newService: IService = {
        id: generateId(),
        name: name,
        icon: icon,
        description: encryptedDescription,
        url: url,
        identifier: identifier,
        alphabet: alphabet,
        length: length,
        vault: vaultId,
        version: 1
    }

    services.push(newService)

    account = {
        ...account,
        services: services
    }

    setStorage(accountId, account)
    
}

export const updateService = async ({
    accountId,
    serviceId,
    vaultId,
    name,
    description,
    icon,
    url,
    identifier,
    alphabet,
    length,
    version,
    masterPassword
}: {
    accountId: string,
    serviceId: string,
    vaultId: string,
    name: string,
    description: string,
    icon: string,
    url: string,
    identifier: string,
    alphabet: string,
    length: number,
    version: number,
    masterPassword: string
}) => {

    let account = getStorage(accountId)
    let services = account.services

    const encryptedDescription = description ? await encodeData(masterPassword, description) : ""

    for (let index = 0; index < services.length; index++) {
        if(services[index].id === serviceId) {
            services[index].name = name
            services[index].description = encryptedDescription
            services[index].icon = icon
            services[index].url = url
            services[index].identifier = identifier
            services[index].alphabet = alphabet
            services[index].length = length
            services[index].vault = vaultId
            services[index].version = version
            break
        }
    }

    account = {
        ...account,
        services: services
    }

    setStorage(accountId, account)
    
}

export const deleteService = ({ accountId, serviceId }: { accountId: string, serviceId: string }) => {


    let account = getStorage(accountId)
    let services = account.services

    for (let index = 0; index < services.length; index++) {
        if(services[index].id === serviceId) {
            services.splice(index, 1)
            break
        }
    }
    
    account = {
        ...account,
        services: services
    }

    setStorage(accountId, account)

}

export const copyServicePasswordToClipboard = async ({
    accountId,
    masterPassword,
    serviceId
}: {
    accountId: string,
    masterPassword: string,
    serviceId: string,
}) => {

    try {
        
        const service = getService({ accountId, serviceId })
        const alphabets = getAlphabetList(accountId)
        const alphabetData = alphabets.find((a: any) => a.id === service.alphabet)
        const password = await genServicePassword(masterPassword, service.identifier, service.length, alphabetData, service.version)

        copyToClipboard(password)
        
        showAlert(
            `<b>${ service.name === "" ? "Service" : service.name }</b> password copied to clipboard!`,
            'success',
            'check', 
            3000
        )

    } catch (error) {
        showAlert('Error copying password', 'error', 'alert-circle', 3000)
        
    }

}