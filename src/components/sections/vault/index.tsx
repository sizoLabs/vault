import { useEffect, useState } from "react"

import { getServiceList } from "@logic/service"

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

                    <div className="absolute -top-37.5 -left-37.5 opacity-4 z-0 mask-to-bottom">
                        <i className={ "ti ti-" + vaultData.icon + " text-[900px]" } />
                    </div>
                    
                    <h2 className="text-3xl font-inter-black mb-5">
                        <i className={ "ti ti-" + vaultData.icon + " mr-3 align-middle inline-block -mt-1.25" } />
                        { vaultData.name}
                    </h2>

                    <div className="flex flex-row flex-wrap w-full gap-3">

                        {servicesList.map((service: any, index: number) => (
                            <div
                                className="z-40 relative group bg-white/2 px-5 py-5 squircle squircle-md border w-full border-white/10 hover:bg-primary/15 hover:border-primary hover:shadow-xl hover:-translate-y-0.5 duration-300 min-w-40 sm:max-w-50 flex flex-col justify-center items-center cursor-pointer backdrop-blur-2xl"
                                key={ index }
                                onClick={ () => { console.log("service") }}
                            >
                                <div className="font-inter-bold text-center mb-3">
                                    { service.name }
                                </div>
                                <div className="text-center">
                                    <i className={ "text-8xl ti ti-" + service.icon } />
                                </div>
                                <div
                                    onClick={ (e) => {
                                        e.stopPropagation();
                                        console.log("service-settings")
                                    }}
                                    className="z-50 absolute sm:opacity-0 duration-300 sm:group-hover:opacity-100 bottom-2 right-2 px-1.5 pt-1.5 pb-0 bg-white/5 squircle squircle-md cursor-pointer border border-white/20 sm:border-white/50 hover:bg-white/15 hover:border-white"
                                >
                                    <i className="ti ti-settings text-xl"/>
                                </div>
                            </div>
                        ))}

                    </div>
                </div>
            </div>

        </div>
    )

}

export default Vault