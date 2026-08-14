import { useEffect, useState } from "react"

import { getServiceList } from "@logic/service"
import { getSecretList } from "@logic/secret"
import { getVault } from "@logic/vault"

import type { IService, IVault, ISecret } from "@interface/index"

import ServiceCard from "@component/ui/vault/service"
import SecretCard from "@component/ui/vault/secret"

import ServiceModal from "@component/sections/vault/service"
import SecretModal from "@component/sections/vault/secret"
import CreateModal from "@component/sections/vault/create"

interface VaultProps {
    accountId: string
    vaultId: string
    masterPassword: string
}

const Vault = (props: VaultProps) => {

    const { accountId, vaultId, masterPassword } = props

    const [ vaultData, setVaultData ] = useState<IVault>()
    const [ servicesList, setServicesList ] = useState<IService[]>([])
    const [ secretList, setSecretList ] = useState<ISecret[]>([])

    const [ selectedService, setSelectedService ] = useState<string>("")
    const [ selectedSecret, setSelectedSecret ] = useState<string>("")
    
    const [ isCreateModalOpen, setIsCreateModalOpen ] = useState(false)
    const [ isServiceModalOpen, setIsServiceModalOpen ] = useState(false)
    const [ isSecretModalOpen, setIsSecretModalOpen ] = useState(false)

    useEffect(() => {

        if (!accountId || !vaultId) {
            setServicesList([])
            setSelectedService("")
            return
        }

        const services = getServiceList({ accountId, vaultId })
        setServicesList(services)

        const secrets = getSecretList({ accountId, vaultId, masterPassword })
        setSecretList(secrets)

        const vault = getVault({ accountId, vaultId })
        setVaultData(vault)

    }, [ accountId, vaultId ])

    const handleCreateService = () => {
        setIsCreateModalOpen(true)
    }

    const handleServiceSettings = (serviceId: string) => {
        setSelectedService(serviceId)
        setIsServiceModalOpen(true)
    }

    const handleSecretSettings = (secretId: string) => {
        setSelectedSecret(secretId)
        setIsSecretModalOpen(true)
    }

    const handleRefreshVault = () => {

        const services = getServiceList({ accountId, vaultId })
        setServicesList(services)

        const secrets = getSecretList({ accountId, vaultId, masterPassword })
        setSecretList(secrets)

        const vault = getVault({ accountId, vaultId })
        setVaultData(vault)

    }

    if(vaultData) return (
        <>
            <div className="relative bg-white/2 border-white/10 w-full h-full squircle squircle-md border overflow-hidden">

                <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                    <div className="z-50 relative flex min-h-full flex-col px-5 py-5 md:p-10 overflow-hidden">

                        <div className="absolute -top-37.5 -left-37.5 opacity-5 -z-1 mask-to-bottom">
                            <i className={ "ti ti-" + vaultData.icon + " text-[900px]" } />
                        </div>
                        
                        <h2 className="text-3xl font-inter-black mb-5">
                            <i className={ "ti ti-" + vaultData.icon + " mr-3 align-middle inline-block -mt-1.25" } />
                            { vaultData.name}
                        </h2>

                        <div className="flex flex-row flex-wrap w-full gap-3">

                            {servicesList.map((service: IService, index: number) => (
                                <ServiceCard
                                    key={ service.id ?? index }
                                    service={ service }
                                    masterPassword={ masterPassword }
                                    accountId={ accountId }
                                    onSettingsClick={ () => { handleServiceSettings(service.id) } }
                                />
                            ))}

                            {secretList.map((secret: ISecret, index: number) => (
                                <SecretCard
                                    key={ secret.id ?? index }
                                    secret={ secret }
                                    masterPassword={ masterPassword }
                                    accountId={ accountId }
                                    onSettingsClick={ () => { handleSecretSettings(secret.id) } }
                                />
                            ))}

                            <div className="w-full sm:w-fit">
                                <button
                                    className="flex flex-col items-center justify-center px-10 py-5 sm:min-w-50 w-full h-full squircle squircle-md border border-white/10 hover:border-white/50 hover:bg-white/10 duration-300 backdrop-blur-2xl cursor-pointer text-white/50 hover:text-white"
                                    onClick={ () => handleCreateService() }
                                >
                                    <i className="ti ti-plus text-8xl mb-2" />
                                    <span className="text-sm">Create New</span>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <CreateModal
                open={ isCreateModalOpen }
                vaultId={ vaultId }
                accountId={ accountId }
                masterPassword={ masterPassword }
                onCreate={ handleRefreshVault }
                onClose={ () => setIsCreateModalOpen(false) }
            />

            <ServiceModal
                open={ isServiceModalOpen }
                vaultId={ vaultId }
                accountId={ accountId }
                serviceId={ selectedService }
                masterPassword={ masterPassword }
                onUpdate={ handleRefreshVault }
                onClose={ () => setIsServiceModalOpen(false) }
            />

            <SecretModal
                open={ isSecretModalOpen }
                vaultId={ vaultId }
                accountId={ accountId }
                secretId={ selectedSecret }
                masterPassword={ masterPassword }
                onUpdate={ handleRefreshVault }
                onClose={ () => setIsSecretModalOpen(false) }
            />

        </>
    )

}

export default Vault