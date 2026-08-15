import { useState } from "react"

import SidebarLogo from "@component/ui/sidebar/logo"
import SidebarButton from "@component/ui/sidebar/button"
import SidebarUfo from "@component/ui/sidebar/ufo"

interface MobileMenuProps {
    isOpen: boolean
    onClose: () => void
    activePanel: string
    accountId: string
    account: any
    activeVaultId: string | null
    onPanelChange: (panel: string, vaultId?: string) => void
    onOpenCreateVaultModal: () => void
}

export default function MobileMenu({
    isOpen,
    onClose,
    activePanel,
    accountId,
    account,
    activeVaultId,
    onPanelChange,
    onOpenCreateVaultModal
}: MobileMenuProps) {

    const handlePanelChange = (panel: string, vaultId?: string) => {
        onPanelChange(panel, vaultId)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>

            {/* Mobile Menu Overlay */}

            <div
                className="fixed inset-0 bg-darker/10 md:hidden z-999 backdrop-blur-3xl"
                onClick={onClose}
            />

            {/* Mobile Menu Panel */}

            <div className="fixed left-0 top-0 h-full w-full border-r border-white/10 z-999 md:hidden p-2">

                <div className="flex flex-col h-full w-full border border-white/10 squircle-md overflow-hidden">

                    {/* Close Button */}

                    <div className="pl-3 pr-2 pt-2 flex items-center justify-between">

                        <SidebarLogo
                            label="VAULT"
                            icon="ti-vault"
                            onClick={() => onPanelChange("main-vault")}
                        />

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex items-center justify-center p-2 border border-white/10 bg-white/2 hover:bg-white/10 squircle-md transition-colors duration-200 cursor-pointer"
                        >
                            <i className="ti ti-x text-xl text-white" />
                        </button>

                    </div>

                    <div className="relative flex h-full flex-col min-h-0">
                        <div className="flex-1 min-h-0 overflow-auto no-scrollbar-but-scroll mask-to-bottom mask-fade-20 px-2 py-2 pb-10">
                            <div className="flex flex-col gap-1 w-full">

                                <div className="w-full py-2 flex gap-1 flex-col">

                                    <SidebarButton
                                        icon="ti-vault"
                                        label="My Vault"
                                        active={activePanel === "vault"}
                                        show={accountId ? false : true}
                                        onClick={() => handlePanelChange("main-vault")}
                                        className="w-full"
                                    />

                                    {account && account.vaults && account.vaults.length > 0 && account.vaults.map((vault: any, index: number) => (
                                        <SidebarButton
                                            key={index}
                                            icon={"ti-" + (vault.icon ? vault.icon : "vault")}
                                            label={vault.name}
                                            active={activePanel === "vault" && activeVaultId === vault.id}
                                            show={accountId ? true : false}
                                            onClick={() => handlePanelChange("vault", vault.id)}
                                            className="w-full"
                                        />
                                    ))}

                                    {account && account.vaults.length === 0 && (
                                        <div className="mt-8 px-6 opacity-50 scale-150 mx-auto max-w-48">
                                            <SidebarUfo />
                                        </div>
                                    )}

                                </div>

                            </div>
                        </div>

                        <div className="w-full pt-2 pb-2 px-2">
                            <div className="w-full flex flex-col items-left justify-left gap-1">

                                <SidebarButton
                                    icon="ti-book-2"
                                    label="How it works"
                                    active={activePanel === "how-it-works"}
                                    show={true}
                                    onClick={() => handlePanelChange("how-it-works")}
                                />

                                <SidebarButton
                                    icon="ti ti-vault"
                                    label="New Vault"
                                    active={false}
                                    show={accountId ? true : false}
                                    onClick={() => {
                                        onOpenCreateVaultModal()
                                        onClose()
                                    }}
                                />

                                <SidebarButton
                                    icon="ti-abc"
                                    label="Alphabets"
                                    active={activePanel === "alphabets"}
                                    show={accountId ? true : false}
                                    onClick={() => handlePanelChange("alphabets")}
                                />

                                <SidebarButton
                                    icon="ti-user"
                                    label="Accounts"
                                    active={activePanel === "accounts"}
                                    show={accountId ? true : false}
                                    onClick={() => handlePanelChange("accounts")}
                                />

                                <SidebarButton
                                    icon="ti-settings"
                                    label="Settings"
                                    active={activePanel === "settings"}
                                    show={accountId ? true : false}
                                    onClick={() => handlePanelChange("settings")}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
