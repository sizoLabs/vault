import { getStorage, setStorage } from "@logic/storage"
import { generateId } from "@logic/utils"
import { type IService } from "@interface/index"

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
    info,
    identifier,
    alphabet,
    length,
    vault
}: {
    accountId: string,
    name: string,
    info: string,
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
        info: info,
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
    name,
    info,
    identifier,
    alphabet,
    length,
    vault,
    version
}: {
    accountId: string,
    serviceId: string,
    name: string,
    info: string,
    identifier: string,
    alphabet: string,
    length: number,
    vault: string,
    version: number
}) => {

    let account = getStorage(accountId)
    let services = account.services

    for (let index = 0; index < services.length; index++) {
        if(services[index].id === serviceId) {
            services[index].name = name
            services[index].info = info
            services[index].identifier = identifier
            services[index].alphabet = alphabet
            services[index].length = length
            services[index].vault = vault
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