import { type ReactNode } from "react"

type ButtonVariant = "delete" | "cancel" | "success"

interface DialogButton {
    label: string
    variant: ButtonVariant
    onClick: () => void | Promise<void>
}

interface DialogFooterProps {
    buttons: DialogButton[]
}

const getButtonClasses = (variant: ButtonVariant): string => {

    const baseClasses = "cursor-pointer block h-fit w-full px-3 py-2 border duration-300 squircle squircle-md font-inter-bold text-[15px] md:text-lg"
    
    const variantClasses: Record<ButtonVariant, string> = {
        delete: "bg-rose-500/10 border-rose-500/50 focus:bg-rose-500/20 focus:border-rose-500 hover:bg-rose-500/20 hover:border-rose-500 hover:text-white",
        cancel: "bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white",
        success: "bg-emerald-500/10 border-emerald-500/50 focus:bg-emerald-500/20 focus:border-emerald-500 hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-white"
    }
    
    return `${baseClasses} ${variantClasses[variant]}`
}

const DialogFooter = (props: DialogFooterProps) => {
    
    const { buttons } = props

    return (
        <div className="z-90 bg-white/5 px-5 pt-5 pb-5 sticky bottom-0 backdrop-blur-xl w-full border-t border-white/10 flex flex-col md:flex-row justify-between gap-2 md:gap-5">
            {buttons.map((button, index) => (
                <button
                    key={index}
                    onClick={button.onClick}
                    className={getButtonClasses(button.variant)}
                >
                    {button.label}
                </button>
            ))}
        </div>
    )
}

export default DialogFooter
