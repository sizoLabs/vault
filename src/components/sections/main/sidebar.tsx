import { useEffect, useRef } from "react"

import SidebarLogo from "@component/ui/sidebar/logo"
import SidebarButton from "@component/ui/sidebar/button"

interface MainSidebarProps {
    panelWidth: number
    isResizing: boolean
    activePanel: string
    accountId: string
    account: any
    activeVaultId: string | null
    onPanelChange: (panel: string, vaultId?: string) => void
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
    onPanelWidthChange: (width: number) => void
    onResizeEnd: () => void
}

export default function MainSidebar({
    panelWidth,
    isResizing,
    activePanel,
    accountId,
    account,
    activeVaultId,
    onPanelChange,
    onPointerDown,
    onPanelWidthChange,
    onResizeEnd
}: MainSidebarProps) {
    const panelRef = useRef<HTMLDivElement | null>(null)

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
            {/* Mobile sidebar */}
            <div className="block md:hidden bg-white/2 border-white/10 border squircle-md p-2 w-full mb-2">
                <div className="relative flex flex-row items-start justify-left px-1">
                    <SidebarLogo
                        label="VAULT"
                        icon="ti-vault"
                        onClick={() => onPanelChange("main-vault")}
                    />
                </div>
            </div>

            {/* Desktop sidebar */}
            <div
                ref={panelRef}
                className="bg-white/2 border-white/10 border squircle-md p-2 w-full h-full md:shrink-0 hidden md:block overflow-hidden"
                style={{ width: panelWidth, maxWidth: "100%" }}
            >
                <div className="relative flex flex-row items-center justify-left px-1 mb-1">
                    <SidebarLogo
                        label="VAULT"
                        icon="ti-vault"
                        onClick={() => onPanelChange("main-vault")}
                    />
                    <div></div>
                </div>

                <div className="relative flex h-full flex-col">
                    <div className="flex-1 overflow-auto no-scrollbar-but-scroll">
                        <div className="flex flex-col items-left justify-left gap-1 pt-1">
                            {!accountId && (
                                <>
                                    <SidebarButton
                                        icon="ti-vault"
                                        label="My Vault"
                                        active={activePanel === "vault"}
                                        onClick={() => onPanelChange("main-vault")}
                                    />
                                </>
                            )}

                            {account && (
                                <>
                                    {account.vaults.map((vault: any, index: number) => (
                                        <SidebarButton
                                            key={index}
                                            icon={"ti-" + (vault.icon ? vault.icon : "vault")}
                                            label={vault.name}
                                            active={activePanel === "vault" && activeVaultId === vault.id}
                                            onClick={() => onPanelChange("vault", vault.id)}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full sticky bottom-0 pt-10">
                        <div className="w-full flex flex-col items-left justify-left gap-1">
                            <SidebarButton
                                icon="ti-book-2"
                                label="How it works"
                                active={activePanel === "how-it-works"}
                                onClick={() => onPanelChange("how-it-works")}
                            />

                            {accountId && (
                                <>
                                    <SidebarButton
                                        icon="ti-abc"
                                        label="Alphabets"
                                        active={activePanel === "alphabets"}
                                        onClick={() => onPanelChange("alphabets")}
                                    />

                                    <SidebarButton
                                        icon="ti-user"
                                        label="Accounts"
                                        active={activePanel === "accounts"}
                                        onClick={() => onPanelChange("accounts")}
                                    />

                                    <SidebarButton
                                        icon="ti-settings"
                                        label="Settings"
                                        active={activePanel === "settings"}
                                        onClick={() => onPanelChange("settings")}
                                    />
                                </>
                            )}
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
