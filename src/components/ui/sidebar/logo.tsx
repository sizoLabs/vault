import type { MouseEventHandler } from "react"

type SidebarLogoProps = {
    label: string
    icon: string
    onClick: MouseEventHandler<HTMLButtonElement>
    className?: string
}

export default function SidebarLogo({ label, icon, onClick, className = "" }: SidebarLogoProps) {
    return (
        <button
            type="button"
            onClick={ onClick }
            className={`z-50 block text-2xl font-inter-black text-white hover:text-primary cursor-pointer transition duration-300 ${className}`}
        >
            { label }
            <i className={`ti ${icon} ml-1 align-middle inline-block -mt-0.75 text-white`}></i>
        </button>
    )
}
