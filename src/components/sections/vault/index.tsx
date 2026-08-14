import { useEffect, useState } from "react"

import { getServiceList } from "@logic/service"
import ServiceCard from "@component/ui/vault/service"

import { type IService, type IVault } from "@interface/index"
import { getVault } from "@logic/vault"

interface VaultProps {
    accountId: string
    vaultId: string
}

const Vault = (props: VaultProps) => {

    const { accountId, vaultId } = props

    const [ servicesList, setServicesList ] = useState<IService[]>([])
    const [ vaultData, setVaultData ] = useState<IVault>()

    useEffect(() => {

        if (!accountId || !vaultId) {
            setServicesList([])
            return
        }

        const services = getServiceList({ accountId, vaultId })
        setServicesList(services)

        const vault = getVault({ accountId, vaultId })
        setVaultData(vault)

    }, [ accountId, vaultId ])

    if(vaultData) return (
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

                        {servicesList.map((service: IService & { icon?: string }, index: number) => (
                            <ServiceCard
                                key={ service.id ?? index }
                                service={ service }
                                onClick={ () => { console.log("service") }}
                                onSettingsClick={ () => { console.log("service-settings") }}
                            />
                        ))}

                    </div>
                </div>
            </div>

        </div>
    )

}

export default Vault