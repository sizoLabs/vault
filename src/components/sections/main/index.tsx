import { useEffect, useRef, useState } from "react"

import MainVault from "@component/sections/main/vault"
import VaultAccess from "@component/sections/main/access"
import HowItWorks from "@component/sections/main/how-it-works"
import Settings from "@component/sections/settings"
import Vault from "@component/sections/vault"
import Accounts from "@component/sections/accounts"
import Alphabets from "@component/sections/alphabets"

import SidebarLogo from "@component/ui/sidebar/logo"
import SidebarButton from "@component/ui/sidebar/button"

import { getStorage, setStorage } from "@logic/storage"

const PANEL_WIDTH_STORAGE_KEY = "panel-width"
const MIN_PANEL_WIDTH = 250
const MAX_PANEL_WIDTH = 420

export default function Home() {

    const panelRef = useRef<HTMLDivElement | null>(null)

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

    const handlePanelChange = (panel: string) => {
        setActivePanel(panel)
        if (panel !== "vault") {
            setActiveVaultId(null)
        }
    }

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsResizing(true)
    }

    useEffect(() => {  }, [activeVaultId])

    useEffect(() => { setStorage(PANEL_WIDTH_STORAGE_KEY, String(panelWidth)) }, [panelWidth])

    useEffect(() => {

        if (!isResizing) return

        const onPointerMove = (event: PointerEvent) => {
            if (!panelRef.current) return
            const rect = panelRef.current.getBoundingClientRect()
            const nextWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, event.clientX - rect.left))
            setPanelWidth(nextWidth)
        }

        const stopResize = () => setIsResizing(false)

        document.addEventListener("pointermove", onPointerMove)
        document.addEventListener("pointerup", stopResize)
        document.addEventListener("pointercancel", stopResize)
        document.body.style.cursor = "col-resize"
        document.body.style.userSelect = "none"

        return () => {
            document.removeEventListener("pointermove", onPointerMove)
            document.removeEventListener("pointerup", stopResize)
            document.removeEventListener("pointercancel", stopResize)
            document.body.style.cursor = ""
            document.body.style.userSelect = ""
        }
        
    }, [isResizing])

    useEffect(() => {

        const storedWidth = getStorage(PANEL_WIDTH_STORAGE_KEY)

        if (storedWidth) {
            const width = Number(storedWidth)
            if (!Number.isNaN(width)) {
                setPanelWidth(Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, width)))
            }
        }

    }, [])

    return (
        <div className="z-0 h-screen">
            <div className="p-2 h-full flex flex-col md:flex-row items-center justify-left">

                <div className="block md:hidden bg-white/2 border-white/10 border squircle squircle-md p-2 w-full mb-2">
                    <div className="relative flex flex-row items-start justify-left px-1">
                        <SidebarLogo
                            label="VAULT"
                            icon="ti-vault"
                            onClick={ () => handlePanelChange("main-vault") }
                        />
                    </div>
                </div>

                <div
                    ref={ panelRef }
                    className="bg-white/2 border-white/10 border squircle squircle-md p-2 w-full h-full md:shrink-0 hidden md:block overflow-hidden"
                    style={{ width: panelWidth, maxWidth: "100%" }}
                >

                    <div className="relative flex flex-row items-center justify-left px-1 mb-1">
                        <SidebarLogo
                            label="VAULT"
                            icon="ti-vault"
                            onClick={ () => handlePanelChange("main-vault") }
                        />
                    </div>

                    <div className="relative flex h-full flex-col">

                        <div className="flex-1 min-h-0 overflow-auto">
                            <div className="flex flex-col items-left justify-left gap-1 p-1">
                                { !accountId && (
                                    <>
                                        <SidebarButton
                                            icon="ti-vault"
                                            label="My Vault"
                                            active={ activePanel === "vault" }
                                            onClick={ () => handlePanelChange("main-vault") }
                                        />
                                    </>
                                )}

                                { account && (
                                    <>
                                        {account.vaults.map((vault: any, index: number) => (
                                            <SidebarButton
                                                key={ index }
                                                icon={ "ti-" + (vault.icon ? vault.icon : "vault") }
                                                label={ vault.name }
                                                active={ activePanel === "vault" && activeVaultId === vault.id }
                                                onClick={ () => {
                                                    setVaultId(vault.id);
                                                    setActiveVaultId(vault.id);
                                                    handlePanelChange("vault");
                                                }}
                                            />
                                        ))}
                                    </>
                                )}

                            </div>
                        </div>

                        <div className="w-full sticky bottom-0">
                            <div className="w-full flex flex-col items-left justify-left gap-1">

                                <SidebarButton
                                    icon="ti-book-2"
                                    label="How it works"
                                    active={ activePanel === "how-it-works" }
                                    onClick={ () => handlePanelChange("how-it-works") }
                                />

                                { accountId && (
                                    <>

                                        <SidebarButton
                                            icon="ti-abc"
                                            label="Alphabets"
                                            active={ activePanel === "alphabets" }
                                            onClick={ () => handlePanelChange("alphabets") }
                                        />

                                        <SidebarButton
                                            icon="ti-user"
                                            label="Accounts"
                                            active={ activePanel === "accounts" }
                                            onClick={ () => handlePanelChange("accounts") }
                                        />

                                        <SidebarButton
                                            icon="ti-settings"
                                            label="Settings"
                                            active={ activePanel === "settings" }
                                            onClick={ () => handlePanelChange("settings") }
                                        />
                                    </>
                                )}

                            </div>
                        </div>

                    </div>

                </div>

                <div className="hidden md:flex mx-px group active:bg-primary hover:bg-primary rounded-full duration-300 h-[98%] items-center justify-center" style={{ width: 5 }}>
                    <div
                        className="relative flex h-full w-10 cursor-col-resize items-center justify-center"
                        onPointerDown={ handlePointerDown }
                    >
                    </div>
                </div>

                <div className="w-full h-full flex flex-col">

                    { activePanel == "main-vault" && (
                        accountId
                            ? <MainVault accountId={ accountId } />
                            : <VaultAccess onSubmitForm={ onSubmitForm } />
                    )}

                    { activePanel == "vault" && <Vault accountId={ accountId } vaultId={ vaultId } /> }

                    { activePanel == "how-it-works" && <HowItWorks /> }
                    { activePanel == "alphabets" && <Alphabets /> }
                    { activePanel == "accounts" && <Accounts /> }
                    { activePanel == "settings" && (
                        <Settings
                            masterPassword={ masterPassword }
                            onAccountUpdated={ () => syncAccount(accountId) }
                        />
                    ) }

                </div>

            </div>
        </div>
    )

}