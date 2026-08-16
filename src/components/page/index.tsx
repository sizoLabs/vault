import { useEffect, useState } from "react"

import Content from "@component/global/content"
import CreateVaultModal from "@component/sections/vault/create-vault"
import { SidebarWithResizer } from "@component/global/resize"

import { getStorage } from "@logic/storage"
import { applyThemeColor } from "@logic/settings"

const Page = () => {

    const [ activeSection, setActiveSection ] = useState("home")
    const [ activeVaultId, setActiveVaultId ] = useState<string | null>(null)

    const [ account, setAccount ] = useState<any>()
    const [ accountId, setAccountId ] = useState("")
    const [ masterPassword, setMasterPassword ] = useState("")

    const [ vaultId, setVaultId ] = useState("")
    const [ createVaultModalOpen, setCreateVaultModalOpen ] = useState(false)

    const syncAccount = (selectedAccountId = accountId) => {
        const nextAccount = selectedAccountId ? getStorage(selectedAccountId) : null
        setAccount(nextAccount)
    }

    const onSubmitForm = (accountId: string, masterPassword: string) => {
        setMasterPassword(masterPassword)
        setAccountId(accountId)
        syncAccount(accountId)
    }

    const handleSectionChange = (section: string, vaultId?: string) => {
        setActiveSection(section)
        if (section === "vault" && vaultId) {
            setActiveVaultId(vaultId)
            setVaultId(vaultId)
        } else if (section !== "vault") {
            setActiveVaultId(null)
            setVaultId("")
        }
    }

    useEffect(() => {
        if (activeSection !== "vault") return

        const vaults = Array.isArray(account?.vaults) ? account.vaults : []
        const selectedVaultId = activeVaultId ?? vaultId

        if (!selectedVaultId || !vaults.some((vault: any) => vault.id === selectedVaultId)) {
            setActiveSection("main-vault")
            setActiveVaultId(null)
            setVaultId("")
        }
    }, [account, activeSection, activeVaultId, vaultId])

    useEffect(() => {
        if (accountId) {
            applyThemeColor(accountId)
        }
    }, [accountId])

    useEffect(() => {
        if (!accountId || typeof window === "undefined") return

        const handleStorageUpdate = () => {
            syncAccount(accountId)
        }

        window.addEventListener("vault-storage-updated", handleStorageUpdate)

        return () => {
            window.removeEventListener("vault-storage-updated", handleStorageUpdate)
        }
    }, [accountId])

    return (
        <div className="z-0 h-screen">

            <CreateVaultModal
                open={createVaultModalOpen}
                accountId={accountId}
                onCreate={() => {
                    syncAccount(accountId)
                }}
                onClose={() => setCreateVaultModalOpen(false)}
            />

            <div className="p-2 h-full flex flex-col md:flex-row items-center justify-left">

                <SidebarWithResizer
                    activePanel={activeSection}
                    accountId={accountId}
                    masterPassword={masterPassword}
                    account={account}
                    activeVaultId={activeVaultId}
                    onPanelChange={handleSectionChange}
                    onOpenCreateVaultModal={() => setCreateVaultModalOpen(true)}
                />

                <Content
                    activeSection={activeSection}
                    accountId={accountId}
                    masterPassword={masterPassword}
                    vaultId={vaultId}
                    account={account}
                    onSubmitForm={onSubmitForm}
                    onSectionChange={handleSectionChange}
                    onAccountUpdated={() => syncAccount(accountId)}
                />

            </div>
            
        </div>
    )

}

export default Page