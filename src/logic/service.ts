import { getStorage, setStorage } from "@logic/storage"
import { generateId, genServicePassword, copyToClipboard } from "@logic/utils"
import { showAlert } from "@logic/alert"
import { type IService } from "@interface/index"
import { getAlphabetList } from "@logic/alphabet"

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

export const createService = ({
    accountId,
    name,
    description,
    url,
    identifier,
    alphabet,
    length,
    vault
}: {
    accountId: string,
    name: string,
    description: string,
    url: string,
    identifier: string,
    alphabet: string,
    length: number,
    vault: string
}) => {

    let account = getStorage(accountId)
    let services = account.services

    if(!services) services = [] as IService[]

    const newService: IService = {
        id: generateId(),
        name: name,
        icon: "user-password",
        description: description,
        url: url,
        identifier: identifier,
        alphabet: alphabet,
        length: length,
        vault: vault,
        version: 1
    }

    services.push(newService)

    account = {
        ...account,
        services: services
    }

    setStorage(accountId, account)
    
}

export const updateService = ({
    accountId,
    serviceId,
    vaultId,
    name,
    description,
    url,
    identifier,
    alphabet,
    length,
    version
}: {
    accountId: string,
    serviceId: string,
    vaultId: string,
    name: string,
    description: string,
    url: string,
    identifier: string,
    alphabet: string,
    length: number,
    version: number
}) => {

    let account = getStorage(accountId)
    let services = account.services

    for (let index = 0; index < services.length; index++) {
        if(services[index].id === serviceId) {
            services[index].name = name
            services[index].description = description
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