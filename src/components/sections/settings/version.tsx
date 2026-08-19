import { useEffect, useState } from "react"

import { APP_VERSION, checkForUpdate, getAvailableUpdate } from "@logic/version"

interface VersionProps {
    detailed?: boolean
}

const Version = ({ detailed = false }: VersionProps) => {

    const [ availableUpdate, setAvailableUpdate ] = useState<string | null>(null)
    const [ isChecking, setIsChecking ] = useState(true)

    useEffect(() => {

        let isMounted = true

        checkForUpdate().then((result) => {
            if (isMounted) {
                setAvailableUpdate(getAvailableUpdate(result.latestVersion))
                setIsChecking(false)
            }
        })

        return () => {
            isMounted = false
        }

    }, [])

    if (detailed) return (
        <div className="container">
            <div>
                <div className="description">
                    Current version: <span className="font-inter-bold text-white">v{ APP_VERSION }</span>
                </div>
            </div>
            <div className="option text-left md:text-right">
                { isChecking ? (
                    <span className="text-white/50">Checking for updates...</span>
                ) : availableUpdate ? (
                    <a
                        href="https://github.com/sizoLabs/vault/releases/latest"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-white duration-300 font-inter-bold"
                    >
                        Update available: v{ availableUpdate }
                    </a>
                ) : (
                    <span className="text-white/50">
                        Vault is up to date.
                    </span>
                ) }
            </div>
        </div>
    )

    return (
        <>
            <div className="absolute z-80 top-0 right-0 w-fit px-3 pt-3 flex flex-row items-center justify-center gap-1 md:gap-2">
                <a
                    href="https://github.com/sizoLabs/vault"
                    target="_blank"
                    className="inline-block text-white/20 hover:text-white duration-300 text-2xl align-middle"
                >
                    <i className="ti ti-brand-github" />
                </a>
                <div className="inline-block align-middle text-white/30 text-xs bg-black/5 border border-white/10 hover:bg-primary/10 hover:border-primary hover:text-primary duration-300 squircle-md px-2 py-1 -mt-0.5">
                    v{ APP_VERSION }
                </div>
            </div>
        </>
    )
}

export default Version