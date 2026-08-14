import { useEffect, useState } from "react"

import { getVaultCount } from "@logic/vault"
import { getServiceCount } from "@logic/service"
import { getSecretCount } from "@logic/secret"
import { getAlphabetCount } from "@logic/alphabet"
import { applyThemeColor } from "@logic/settings"

import Logo from "./logo"
import Block from "@component/ui/main/block"
import CraftedBy from "@component/sections/main/crafted"

interface VaultProps {
    accountId: string
}

const Vault = (props: VaultProps) => {

    const { accountId } = props
    const [ totalVaults, setTotalVaults ] = useState(0)
    const [ totalServices, setTotalServices ] = useState(0)
    const [ totalSecrets, setTotalSecrets ] = useState(0)
    const [ totalAlphabets, setTotalAlphabets ] = useState(0)

    const getTotalVaults = () => {
        const totalVaults = getVaultCount(accountId)
        setTotalVaults(totalVaults)
    }

    const getTotalServices = () => {
        const totalServices = getServiceCount(accountId)
        setTotalServices(totalServices)
    }

    const getTotalSecrets = () => {
        const totalSecrets = getSecretCount(accountId)
        setTotalSecrets(totalSecrets)
    }

    const getTotalAlphabets = () => {
        const totalAlphabets = getAlphabetCount(accountId)
        setTotalAlphabets(totalAlphabets)
    }

    useEffect(() => {
        getTotalVaults()
        getTotalServices()
        getTotalSecrets()
        getTotalAlphabets()
    })

    useEffect(() => {
        if (accountId) {
            applyThemeColor(accountId)
        }
    }, [accountId])

    return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle squircle-md border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                <div className="z-50 relative mx-auto flex min-h-full w-full max-w-full flex-col items-center justify-center p-5 md:max-w-300">
                    
                    <Logo />

                    <div className="text-2xl md:text-4xl text-center mb-3">
                        The world's <b className="font-inter-black">most secure</b> Password Manager
                    </div>

                    <div className="text-xl md:text-3xl text-center text-white/60 mb-15">
                        Serverless, open source and <b className="text-primary">free forever</b>.
                    </div>

                    <div className="flex flex-row flex-wrap justify-center intems-center gap-2 md:gap-5 w-full mb-15">

                        <Block value={ totalVaults } label={ (totalVaults > 1) ? "Vaults" : (totalVaults === 0) ? "Vaults" : "Vault" } />
                        <Block value={ totalServices } label="Services" />
                        <Block value={ totalSecrets } label="Secrets" />
                        <Block value={ totalAlphabets } label="Alphabets" />

                    </div>

                    <CraftedBy />

                </div>

            </div>

        </div>
    )

}

export default Vault