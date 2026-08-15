import { useEffect, useMemo, useState } from "react"

import { copySecretToClipboard } from "@logic/secret"
import { copyServicePasswordToClipboard } from "@logic/service"

type SearchResult = {
    id: string
    itemId: string
    name: string
    type: "service" | "secret"
    icon: string
    vaultId: string
    vaultName: string
}

interface SearchProps {
    account: any
    accountId: string
    masterPassword: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSelect: (vaultId: string) => void
}

export default function Search({ account, accountId, masterPassword, isOpen, onOpenChange, onSelect }: SearchProps) {

    const [searchQuery, setSearchQuery] = useState("")
    const [copiedResultId, setCopiedResultId] = useState<string | null>(null)

    const searchResults = useMemo<SearchResult[]>(() => {

        const query = searchQuery.trim().toLowerCase()

        if (!query || !account) return []

        const vaultMap = new Map((account.vaults || []).map((vault: any) => [vault.id, vault.name]))

        const services = (account.services || [])
            .filter((service: any) => service?.name && service.name.toLowerCase().includes(query))
            .map((service: any) => ({
                id: service.id,
                itemId: service.id,
                name: service.name,
                type: "service" as const,
                icon: service.icon || "ti-shield-lock",
                vaultId: service.vault,
                vaultName: vaultMap.get(service.vault) || "Vault"
            }))

        const secrets = (account.secrets || [])
            .filter((secret: any) => secret?.name && secret.name.toLowerCase().includes(query))
            .map((secret: any) => ({
                id: secret.id,
                itemId: secret.id,
                name: secret.name,
                type: "secret" as const,
                icon: secret.icon || "ti-key",
                vaultId: secret.vault,
                vaultName: vaultMap.get(secret.vault) || "Vault"
            }))

        return [...services, ...secrets].sort((a, b) => a.name.localeCompare(b.name))

    }, [account, searchQuery])

    const closeSearch = () => {
        onOpenChange(false)
        setSearchQuery("")
    }

    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault()
                closeSearch()
            }
        }

        window.addEventListener("keydown", handleKeyDown)

        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isOpen])

    const handleSelect = (result: SearchResult) => {
        if (!result.vaultId) return
        closeSearch()
        onSelect(result.vaultId)
    }

    const handleCopy = async (result: SearchResult) => {
        if (!accountId || !masterPassword) return

        const resultKey = `${result.type}-${result.id}`

        if (result.type === "service") {
            await copyServicePasswordToClipboard({
                accountId,
                masterPassword,
                serviceId: result.itemId
            })
        } else {
            await copySecretToClipboard({
                accountId,
                masterPassword,
                secretId: result.itemId
            })
        }

        setCopiedResultId(resultKey)

        setTimeout(() => {
            setCopiedResultId((current) => current === resultKey ? null : current)
        }, 2000)
    }

    return (
        <>
            {isOpen && (
                <div className="z-60 fixed inset-0 bg-white/2 backdrop-blur-[80px]">

                    <div className="absolute -top-60 -left-35 opacity-5 -z-1 mask-to-bottom">
                        <i className="ti ti-search text-[900px]" />
                    </div>
                    
                    <div
                        className="flex min-h-screen items-center justify-center p-4"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) {
                                closeSearch()
                            }
                        }}
                    >
                        <div
                            className="relative w-full max-w-3xl squircle-md border border-white/10 bg-white/5 text-white shadow-2xl"
                            onMouseDown={(event) => event.stopPropagation()}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between gap-3 px-5 pt-5 border-b border-white/10 pb-4">
                                <div className="flex items-center gap-2 text-lg md:text-2xl font-inter-black">
                                    <i className="ti ti-search" />
                                    <span>Search</span>
                                </div>

                                <button
                                    type="button"
                                    aria-label="Close search"
                                    className="flex h-9 w-9 items-center justify-center squircle-md border border-white/10 bg-white/5 text-white/60 duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white cursor-pointer"
                                    onClick={closeSearch}
                                >
                                    <i className="ti ti-x text-xl" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-3 px-5 pb-4">
                                
                                <div className="flex items-center gap-3 squircle-md border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 duration-300 px-4 py-3">
                                    <i className="ti ti-search text-white/60 text-xl" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Search for services or secrets..."
                                        className="w-full bg-transparent text-base text-white placeholder:text-white/40 outline-none"
                                    />
                                </div>

                                {!searchResults.length ? (
                                    <div className="squircle-md border border-white/10 bg-white/2 px-4 py-6 text-center text-sm text-white/50">
                                        {searchQuery ? "No results found" : "Type to search for services or secrets"}
                                    </div>
                                ) : (
                                    <div className="flex max-h-[60vh] flex-col gap-2 overflow-auto no-scrollbar-but-scroll pr-1">
                                        {searchResults.map((result) => {
                                            const resultKey = `${result.type}-${result.id}`
                                            const isCopied = copiedResultId === resultKey

                                            return (
                                            <div
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    void handleCopy(result)
                                                }}
                                                key={resultKey}
                                                className={`flex w-full items-center justify-between gap-3 squircle-md border border-white/10 bg-white/5 px-4 py-3 text-left hover:border-primary/60 hover:bg-primary/15 group duration-300 cursor-pointer ${isCopied ? "border-emerald-500! hover:border-emerald-500! bg-emerald-500/20!" : ""}`}
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center squircle-md bg-primary/10 border border-primary/50 group-hover:border-primary group-hover:bg-primary/20 text-primary duration-300">
                                                        <i className={`ti ti-${result.icon} text-lg text-white`} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="truncate font-inter-bold text-white">
                                                            {result.name}
                                                        </div>
                                                        <div className="text-xs text-white/55">
                                                            {result.type === "service" ? "Service" : "Secret"} · {result.vaultName}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        aria-label={`Open ${result.name}`}
                                                        className="flex h-9 w-9 items-center justify-center squircle-md border border-white/10 bg-white/5 text-white/60 duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white cursor-pointer"
                                                        onClick={(event) => {
                                                            event.stopPropagation()
                                                            handleSelect(result)
                                                        }}
                                                    >
                                                        <i className="ti ti-arrow-right text-base" />
                                                    </button>
                                                </div>
                                            </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
