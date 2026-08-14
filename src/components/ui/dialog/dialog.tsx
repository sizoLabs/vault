import { type ReactNode, useEffect, useState } from "react"

interface DialogProps {
    open?: boolean
    defaultOpen?: boolean
    title?: ReactNode
    children: ReactNode
    footer?: ReactNode
    className?: string
    contentClassName?: string
    showCloseButton?: boolean
    onClose?: () => void
    onOpenChange?: (open: boolean) => void
}

const Dialog = (props: DialogProps) => {

    const {
        open,
        defaultOpen = false,
        title,
        children,
        footer,
        onClose,
        onOpenChange,
        className = "",
        contentClassName = "",
        showCloseButton = true
    } = props

    const [ isOpen, setIsOpen ] = useState(Boolean(open ?? defaultOpen))

    useEffect(() => {
        if (open !== undefined) {
            setIsOpen(Boolean(open))
        }
    }, [ open ])

    const setDialogOpen = (nextOpen: boolean) => {
        setIsOpen(nextOpen)
        onOpenChange?.(nextOpen)

        if (!nextOpen) {
            onClose?.()
        }
    }

    const handleClose = () => {
        setDialogOpen(false)
    }

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 z-50 h-screen w-full bg-darker/50 backdrop-blur-2xl" />

            <div
                className="fixed inset-0 z-50 h-screen flex items-center justify-center"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) { handleClose() }
                }}
            >
                <dialog
                    open={ isOpen }
                    className="z-90 relative m-auto h-full md:h-auto w-full max-w-160 bg-transparent p-5 md:p-0"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className={`relative m-0 h-full md:m-auto md:max-h-190 overflow-auto w-full rounded-2xl border bg-white/5 border-white/10 text-white no-scrollbar-but-scroll ${className}`}>

                        {(title || showCloseButton) && (
                            <div className="z-90 bg-white/5 px-5 pt-5 pb-4 sticky top-0 backdrop-blur-xl w-full border-b border-white/10">
                                {showCloseButton && (
                                    <button
                                        type="button"
                                        className="bg-white/5 border border-white/10 hover:border-white/50 hover:bg-white/10 duration-300 squircle squircle-md px-2 pt-1 pb-0.5 cursor-pointer group absolute right-3.5 top-3.5 text-2xl"
                                        aria-label="Close"
                                        onClick={handleClose}
                                    >
                                        <i className="ti ti-x text-white/50 group-hover:text-white duration-300" />
                                    </button>
                                )}

                                {title && (
                                    <span className="text-xl md:text-2xl font-inter-black">
                                        {title}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className={contentClassName || "flex flex-col"}>{children}</div>

                        {footer}
                    </div>
                </dialog>
            </div>
        </>
    )
}

export default Dialog
