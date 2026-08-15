import { useEffect, useState } from "react"

import MainSidebar from "@component/sections/main/sidebar"
import MainContent from "@component/sections/main/content"

import { getStorage, setStorage } from "@logic/storage"
import { applyThemeColor } from "@logic/settings"

const PANEL_WIDTH_STORAGE_KEY = "panel-width"
const MIN_PANEL_WIDTH = 250
const MAX_PANEL_WIDTH = 420

export default function Home() {

    const [ activePanel, setActivePanel ] = useState("main-vault")
    const [ activeVaultId, setActiveVaultId ] = useState<string | null>(null)
    const [ panelWidth, setPanelWidth ] = useState(MIN_PANEL_WIDTH)
    const [ isResizing, setIsResizing ] = useState(false)

    const [ account, setAccount ] = useState<any>()
    const [ accountId, setAccountId ] = useState("")
    const [ masterPassword, setMasterPassword ] = useState("")

    const [ vaultId, setVaultId ] = useState("")

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
        }
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsResizing(true)
    }

    const handleResizeEnd = () => {
        setIsResizing(false)
    }

    useEffect(() => {  }, [activeVaultId])

    useEffect(() => { setStorage(PANEL_WIDTH_STORAGE_KEY, String(panelWidth)) }, [panelWidth])

    useEffect(() => {
        const storedWidth = getStorage(PANEL_WIDTH_STORAGE_KEY)

        if (storedWidth) {
            const width = Number(storedWidth)
            if (!Number.isNaN(width)) {
                setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width)))
            }
        }

    }, [])

    useEffect(() => {
        if (accountId) {
            applyThemeColor(accountId)
        }
    }, [accountId])

    return (
        <div className="z-0 h-screen">
            <div className="p-2 h-full flex flex-col md:flex-row items-center justify-left">

                <MainSidebar
                    panelWidth={panelWidth}
                    isResizing={isResizing}
                    activePanel={activePanel}
                    accountId={accountId}
                    account={account}
                    activeVaultId={activeVaultId}
                    onPanelChange={handlePanelChange}
                    onPointerDown={handlePointerDown}
                    onPanelWidthChange={setPanelWidth}
                    onResizeEnd={handleResizeEnd}
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