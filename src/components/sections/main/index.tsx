import { useEffect, useState } from "react"

import MainSidebar from "@component/sections/main/sidebar"
import MainContent from "@component/sections/main/content"
import CreateVaultModal from "@component/sections/main/create-vault"

import { getStorage, setStorage } from "@logic/storage"
import { applyThemeColor } from "@logic/settings"

const PANEL_WIDTH_STORAGE_KEY = "panel-width"
const MIN_PANEL_WIDTH = 250
const MAX_PANEL_WIDTH = 420

const getStoredPanelWidth = () => {
    if (typeof window === "undefined") return MIN_PANEL_WIDTH
    const storedWidth = getStorage(PANEL_WIDTH_STORAGE_KEY)
    if (storedWidth === null || storedWidth === undefined || storedWidth === "") return MIN_PANEL_WIDTH
    const width = Number(storedWidth)
    if (Number.isNaN(width)) return MIN_PANEL_WIDTH
    return Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width))
}

export default function Home() {

    const [ activePanel, setActivePanel ] = useState("main-vault")
    const [ activeVaultId, setActiveVaultId ] = useState<string | null>(null)
    const [ panelWidth, setPanelWidth ] = useState<number>(MIN_PANEL_WIDTH)
    const [ isResizing, setIsResizing ] = useState(false)
    const [ hasLoadedStoredPanelWidth, setHasLoadedStoredPanelWidth ] = useState(false)

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

    const handlePanelChange = (panel: string, vaultId?: string) => {
        setActivePanel(panel)
        if (panel === "vault" && vaultId) {
            setActiveVaultId(vaultId)
            setVaultId(vaultId)
        } else if (panel !== "vault") {
            setActiveVaultId(null)
            setVaultId("")
        }
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsResizing(true)
    }

    const handleResizeEnd = () => {
        setIsResizing(false)
    }

    useEffect(() => {
        if (activePanel !== "vault") return

        const vaults = Array.isArray(account?.vaults) ? account.vaults : []
        const selectedVaultId = activeVaultId ?? vaultId

        if (!selectedVaultId || !vaults.some((vault: any) => vault.id === selectedVaultId)) {
            setActivePanel("main-vault")
            setActiveVaultId(null)
            setVaultId("")
        }
    }, [account, activePanel, activeVaultId, vaultId])

    useEffect(() => {
        const storedPanelWidth = getStoredPanelWidth()
        setPanelWidth(storedPanelWidth)
        setHasLoadedStoredPanelWidth(true)
    }, [])

    useEffect(() => {
        if (!hasLoadedStoredPanelWidth) return
        setStorage(PANEL_WIDTH_STORAGE_KEY, String(panelWidth))
    }, [hasLoadedStoredPanelWidth, panelWidth])

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

                <MainSidebar
                    panelWidth={panelWidth}
                    isResizing={isResizing}
                    activePanel={activePanel}
                    accountId={accountId}
                    masterPassword={masterPassword}
                    account={account}
                    activeVaultId={activeVaultId}
                    onPanelChange={handlePanelChange}
                    onPointerDown={handlePointerDown}
                    onPanelWidthChange={setPanelWidth}
                    onResizeEnd={handleResizeEnd}
                    onOpenCreateVaultModal={() => setCreateVaultModalOpen(true)}
                />

                <MainContent
                    activePanel={activePanel}
                    accountId={accountId}
                    masterPassword={masterPassword}
                    vaultId={vaultId}
                    account={account}
                    onSubmitForm={onSubmitForm}
                    onPanelChange={handlePanelChange}
                    onAccountUpdated={() => syncAccount(accountId)}
                />

            </div>
        </div>
    )

}