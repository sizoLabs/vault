import { useEffect, useRef, useState } from "react"

import SidebarLogo from "@component/ui/sidebar/logo"
import SidebarButton from "@component/ui/sidebar/button"
import Search from "@component/sections/search"

interface MainSidebarProps {
    panelWidth: number
    isResizing: boolean
    activePanel: string
    accountId: string
    masterPassword: string
    account: any
    activeVaultId: string | null
    onPanelChange: (panel: string, vaultId?: string) => void
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
    onPanelWidthChange: (width: number) => void
    onResizeEnd: () => void
    onOpenCreateVaultModal: () => void
}

export default function MainSidebar({
    panelWidth,
    isResizing,
    activePanel,
    accountId,
    masterPassword,
    account,
    activeVaultId,
    onPanelChange,
    onPointerDown,
    onPanelWidthChange,
    onResizeEnd,
    onOpenCreateVaultModal
}: MainSidebarProps) {

    const panelRef = useRef<HTMLDivElement | null>(null)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(() => {
        if (!isResizing) return

        const onPointerMove = (event: PointerEvent) => {
            if (!panelRef.current) return
            const rect = panelRef.current.getBoundingClientRect()
            const MIN_PANEL_WIDTH = 250
            const MAX_PANEL_WIDTH = 420
            const nextWidth = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, event.clientX - rect.left))
            onPanelWidthChange(nextWidth)
        }

        const stopResize = () => {
            onResizeEnd()
        }

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
    }, [isResizing, onPanelWidthChange, onResizeEnd])

    return (
        <>

            {accountId && (
                <Search
                    account={account}
                    accountId={accountId}
                    masterPassword={masterPassword}
                    isOpen={isSearchOpen}
                    onOpenChange={setIsSearchOpen}
                    onSelect={(vaultId) => {
                        setIsSearchOpen(false)
                        onPanelChange("vault", vaultId)
                    }}
                />
            )}

            {/* Mobile Top Bar */}

            <div className="block md:hidden bg-white/2 border-white/10 border squircle-md p-2 w-full mb-2">
                <div className="relative flex flex-row items-start justify-left px-1">
                    <SidebarLogo
                        label="VAULT"
                        icon="ti-vault"
                        onClick={() => onPanelChange("main-vault")}
                    />
                </div>
            </div>

            {/* Desktop Sidebar */}

            <div
                ref={panelRef}
                className="bg-white/2 border-white/10 border squircle-md pb-0 w-full h-full md:shrink-0 hidden md:block overflow-hidden"
                style={{ width: panelWidth, maxWidth: "100%" }}
            >
                <div className="relative flex flex-row items-center justify-left px-3 pt-3 mb-1">

                    <SidebarLogo
                        label="VAULT"
                        icon="ti-vault"
                        onClick={() => onPanelChange("main-vault")}
                    />

                    {accountId && (
                        <div className="ml-auto flex items-center gap-1">
                            <button
                                type="button"
                                className="flex items-center gap-2 squircle-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-inter-bold text-white/70 duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white cursor-pointer"
                                onClick={() => setIsSearchOpen(true)}
                            >
                                <i className="ti ti-search text-base" />
                                <span>
                                    Search
                                </span>
                            </button>
                        </div>
                    )}

                </div>

                <div className="relative flex h-full flex-col">
                    <div className="flex-1 min-h-0 overflow-auto no-scrollbar-but-scroll mask-to-bottom mask-fade-20 ">
                        <div className="flex flex-col items-left justify-left gap-1 pt-1 px-2 pb-15">

                            <SidebarButton
                                icon="ti-vault"
                                label="My Vault"
                                active={activePanel === "vault"}
                                show={ accountId ? false : true }
                                onClick={() => onPanelChange("main-vault")}
                            />

                            {account && account.vaults && account.vaults.map((vault: any, index: number) => (
                                <SidebarButton
                                    key={index}
                                    icon={"ti-" + (vault.icon ? vault.icon : "vault")}
                                    label={vault.name}
                                    active={activePanel === "vault" && activeVaultId === vault.id}
                                    show={ accountId ? true : false }
                                    onClick={() => onPanelChange("vault", vault.id)}
                                />
                            ))}

                        </div>
                    </div>

                    <div className="w-full h-fit pt-2 pb-2" style={{ minHeight: accountId ? '303px' : '110px' }}>
                        <div className="w-full h-fit flex flex-col items-left justify-left gap-1 px-2">

                            <SidebarButton
                                icon="ti-book-2"
                                label="How it works"
                                active={activePanel === "how-it-works"}
                                show={ true }
                                onClick={() => onPanelChange("how-it-works")}
                            />

                            <SidebarButton
                                icon="ti ti-vault"
                                label="New Vault"
                                active={ false }
                                show={ accountId ? true : false }
                                onClick={onOpenCreateVaultModal}
                                className=""
                            />
                            <SidebarButton
                                icon="ti-abc"
                                label="Alphabets"
                                active={activePanel === "alphabets"}
                                show={ accountId ? true : false }
                                onClick={() => onPanelChange("alphabets")}
                            />

                            <SidebarButton
                                icon="ti-user"
                                label="Accounts"
                                active={activePanel === "accounts"}
                                show={ accountId ? true : false }
                                onClick={() => onPanelChange("accounts")}
                            />

                            <SidebarButton
                                icon="ti-settings"
                                label="Settings"
                                active={activePanel === "settings"}
                                show={ accountId ? true : false }
                                onClick={() => onPanelChange("settings")}
                            />

                        </div>
                    </div>
                </div>
            </div>

            {/* Resizer */}

            <div className="hidden md:flex mx-px group active:bg-primary hover:bg-primary rounded-full duration-300 h-[98%] items-center justify-center" style={{ width: 5 }}>
                <div
                    className="relative flex h-full w-10 cursor-col-resize items-center justify-center"
                    onPointerDown={onPointerDown}
                >
                </div>
            </div>
        </>
    )
}
