import { useEffect, useRef, useState } from "react"
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type Modifier } from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import SidebarLogo from "@component/ui/sidebar/logo"
import SidebarUfo from "@component/ui/sidebar/ufo"
import SidebarButton from "@component/ui/sidebar/button"
import MobileMenu from "@component/global/mobile"
import Search from "@component/sections/search"
import { useResizePanel } from "@component/global/resize"
import { getSetting } from "@logic/settings"
import { reorderVaults } from "@logic/vault"

interface SidebarProps {
    panelWidth: number
    isResizing: boolean
    activePanel: string
    accountId: string
    masterPassword: string
    account: any
    activeVaultId: string | null
    onPanelChange: (panel: string, vaultId?: string) => void
    onPanelWidthChange: (width: number) => void
    onResizeEnd: () => void
    onOpenCreateVaultModal: () => void
}

const SortableVault = ({ vault, active, onClick }: { vault: any, active: boolean, onClick: () => void }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: vault.id })

    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`relative z-10 flex items-center gap-1 ${isDragging ? "z-999" : ""}`}
        >
            <button
                ref={setActivatorNodeRef}
                type="button"
                className="absolute z-999 right-2 flex h-8 w-8 shrink-0 items-center justify-center squircle-md border border-white/20 bg-white/2 text-white transition hover:border-primary hover:bg-primary/20 hover:text-white cursor-grab active:cursor-grabbing duration-300"
                aria-label={`Drag ${vault.name}`}
                {...attributes}
                {...listeners}
            >
                <i className="ti ti-grip-vertical text-base" />
            </button>
            <div className="flex-1">
                <SidebarButton
                    icon={"ti-" + (vault.icon ? vault.icon : "vault")}
                    label={vault.name}
                    active={active}
                    show={true}
                    onClick={onClick}
                    className={`w-full backdrop-blur-xl ${isDragging ? "bg-primary/40! border-primary! shadow-xl" : ""}`}
                />
            </div>
        </div>
    )
}

const restrictVaultsToVerticalAxis: Modifier = ({ transform }) => ({
    ...transform,
    x: 0
})

const Sidebar = ({
    panelWidth,
    isResizing,
    activePanel,
    accountId,
    masterPassword,
    account,
    activeVaultId,
    onPanelChange,
    onPanelWidthChange,
    onResizeEnd,
    onOpenCreateVaultModal
}: SidebarProps) => {

    const panelRef = useRef<HTMLDivElement>(null)

    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [vaults, setVaults] = useState<any[]>(account?.vaults ?? [])

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 6
        }
    }))

    const isVaultOrganizationEnabled = Boolean(accountId && getSetting({ accountId, settingId: "enable-organize-vaults" }))

    useEffect(() => setVaults(account?.vaults ?? []), [account?.vaults])

    const handleVaultDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id || !accountId) return

        const currentIndex = vaults.findIndex((vault) => vault.id === active.id)
        const targetIndex = vaults.findIndex((vault) => vault.id === over.id)
        if (currentIndex < 0 || targetIndex < 0) return

        const direction = currentIndex < targetIndex ? 1 : -1
        for (let index = currentIndex; index !== targetIndex; index += direction) {
            reorderVaults({ accountId, vaultId: active.id.toString(), direction })
        }

        const reorderedVaults = [...vaults]
        const [movedVault] = reorderedVaults.splice(currentIndex, 1)
        reorderedVaults.splice(targetIndex, 0, movedVault)
        setVaults(reorderedVaults)
    }

    useResizePanel({
        panelRef,
        isResizing,
        onPanelWidthChange,
        onResizeEnd,
        minWidth: 250,
        maxWidth: 420
    })

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

            <div className="md:hidden bg-white/2 border-white/10 border squircle-md p-2 w-full mb-2 flex flex-row justify-between items-center gap-2">

                <div className="relative flex items-start justify-left px-1">
                    <SidebarLogo
                        label="VAULT"
                        icon="ti-vault"
                        onClick={() => onPanelChange("home")}
                    />
                </div>

                {accountId && (
                    <div className="ml-auto flex items-center gap-1">
                        <button
                            type="button"
                            className="flex items-center gap-2 squircle-md border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-inter-bold text-white/70 duration-300 hover:border-white/30 hover:bg-white/10 hover:text-white cursor-pointer"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <i className="ti ti-search text-base" />
                            <span>
                                Search
                            </span>
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center justify-center p-2 border border-white/10 bg-white/2 hover:bg-white/10 squircle-md transition-colors duration-200 cursor-pointer"
                >
                    <i className="ti ti-menu-2 text-xl text-white" />
                </button>

            </div>

            {/* Mobile Menu */}

            <MobileMenu
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                activePanel={activePanel}
                accountId={accountId}
                account={account}
                activeVaultId={activeVaultId}
                onPanelChange={onPanelChange}
                onOpenCreateVaultModal={onOpenCreateVaultModal}
            />

            <div
                ref={panelRef}
                className="bg-white/2 border-white/10 border squircle-md pb-0 w-full h-full md:shrink-0 hidden md:block overflow-hidden"
                style={{ width: panelWidth, maxWidth: "100%" }}
            >
                <div className="relative flex flex-row items-center justify-left px-3 pt-3 mb-1">

                    <SidebarLogo
                        label="VAULT"
                        icon="ti-vault"
                        onClick={() => onPanelChange("home")}
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
                                onClick={() => onPanelChange("home")}
                            />

                            {isVaultOrganizationEnabled ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    modifiers={[restrictVaultsToVerticalAxis]}
                                    onDragEnd={handleVaultDragEnd}
                                >
                                    <SortableContext
                                        items={vaults.map((vault) => vault.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        {vaults.map((vault, index) => (
                                            <SortableVault
                                                key={vault.id ?? index}
                                                vault={vault}
                                                active={activePanel === "vault" && activeVaultId === vault.id}
                                                onClick={() => onPanelChange("vault", vault.id)}
                                            />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            ) : vaults.map((vault, index) => (
                                <SidebarButton
                                    key={vault.id ?? index}
                                    icon={"ti-" + (vault.icon ? vault.icon : "vault")}
                                    label={vault.name}
                                    active={activePanel === "vault" && activeVaultId === vault.id}
                                    show={accountId ? true : false}
                                    onClick={() => onPanelChange("vault", vault.id)}
                                    className="w-full"
                                />
                            ))}

                            {accountId && vaults.length === 0 && (
                                <div className="mt-35 px-10 opacity-8 scale-200 mx-auto max-w-75">
                                    <SidebarUfo />
                                </div>
                            )}

                        </div>
                    </div>

                    <div className="w-full h-fit pt-2 pb-2" style={{ minHeight: accountId ? '303px' : '110px' }}>
                        <div className="w-full h-fit flex flex-col items-left justify-left gap-1 px-2">

                            <SidebarButton
                                icon="ti-question-mark"
                                label="FAQs"
                                active={activePanel === "faq"}
                                show={ true }
                                onClick={() => onPanelChange("faq")}
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
        </>
    )
}

export default Sidebar