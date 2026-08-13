import type { MouseEventHandler } from "react"

type SidebarButtonProps = {
    icon: string
    label: string
    active: boolean
    onClick: MouseEventHandler<HTMLButtonElement>
    className?: string
}

export default function SidebarButton({ icon, label, active, onClick, className = "" }: SidebarButtonProps) {
    return (
        <button
            type="button"
            onClick={ onClick }
            className={`h-fit text-md font-inter-bold squircle squircle-md px-3 py-2.5 border text-left cursor-pointer duration-300 hover:bg-primary/30 hover:border-primary hover:text-white ${active ? "bg-primary/30 border-primary text-white" : "bg-white/2 border-white/10"} ${className}`}
        >
            <i className={`ti ${icon} text-[20px] inline-block align-middle -mt-0.5 mr-2 text-white`}></i>
            { label }
        </button>
    )
}
