import { useEffect, useState, type RefObject } from "react"
import Sidebar from "./sidebar"
import { getStorage, setStorage } from "@logic/storage"

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

interface UseResizePanelProps {
    panelRef: RefObject<HTMLDivElement | null>
    isResizing: boolean
    onPanelWidthChange: (width: number) => void
    onResizeEnd: () => void
    minWidth?: number
    maxWidth?: number
}

export function useResizePanel({
    panelRef,
    isResizing,
    onPanelWidthChange,
    onResizeEnd,
    minWidth = 250,
    maxWidth = 420
}: UseResizePanelProps) {
    useEffect(() => {
        if (!isResizing) return

        const onPointerMove = (event: PointerEvent) => {
            if (!panelRef.current) return
            const rect = panelRef.current.getBoundingClientRect()
            const nextWidth = Math.min(maxWidth, Math.max(minWidth, event.clientX - rect.left))
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
    }, [isResizing, onPanelWidthChange, onResizeEnd, minWidth, maxWidth])
}

interface ResizerProps {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
}

export function Resizer({ onPointerDown }: ResizerProps) {
    return (
        <div className="hidden md:flex mx-px group active:bg-primary hover:bg-primary rounded-full duration-300 h-[98%] items-center justify-center" style={{ width: 5 }}>
            <div
                className="relative flex h-full w-10 cursor-col-resize items-center justify-center"
                onPointerDown={onPointerDown}
            >
            </div>
        </div>
    )
}

interface SidebarWithResizerProps {
    activePanel: string
    accountId: string
    masterPassword: string
    account: any
    activeVaultId: string | null
    onPanelChange: (panel: string, vaultId?: string) => void
    onOpenCreateVaultModal: () => void
}

export function SidebarWithResizer({
    activePanel,
    accountId,
    masterPassword,
    account,
    activeVaultId,
    onPanelChange,
    onOpenCreateVaultModal
}: SidebarWithResizerProps) {
    const [panelWidth, setPanelWidth] = useState<number>(MIN_PANEL_WIDTH)
    const [isResizing, setIsResizing] = useState(false)
    const [hasLoadedStoredPanelWidth, setHasLoadedStoredPanelWidth] = useState(false)

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        event.preventDefault()
        setIsResizing(true)
    }

    const handleResizeEnd = () => {
        setIsResizing(false)
    }

    useEffect(() => {
        const storedPanelWidth = getStoredPanelWidth()
        setPanelWidth(storedPanelWidth)
        setHasLoadedStoredPanelWidth(true)
    }, [])

    useEffect(() => {
        if (!hasLoadedStoredPanelWidth) return
        setStorage(PANEL_WIDTH_STORAGE_KEY, String(panelWidth))
    }, [hasLoadedStoredPanelWidth, panelWidth])

    return (
        <>
        
            <Sidebar
                panelWidth={panelWidth}
                isResizing={isResizing}
                activePanel={activePanel}
                accountId={accountId}
                masterPassword={masterPassword}
                account={account}
                activeVaultId={activeVaultId}
                onPanelChange={onPanelChange}
                onPanelWidthChange={setPanelWidth}
                onResizeEnd={handleResizeEnd}
                onOpenCreateVaultModal={onOpenCreateVaultModal}
            />

            <Resizer onPointerDown={handlePointerDown} />

        </>
    )
}
