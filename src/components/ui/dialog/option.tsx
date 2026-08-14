import { type ReactNode } from "react"

interface DialogOptionProps {
    title: string
    description: string
    children: ReactNode
    layout?: "row" | "col"
    className?: string
}

const DialogOption = (props: DialogOptionProps) => {
    const { title, description, children, layout = "row", className = "" } = props

    const isRow = layout === "row"

    return (
        <div className={`pt-5 pb-5 border-b border-white/10 last:border-0 flex ${isRow ? "flex-col md:flex-row" : "flex-col"} gap-5 justify-between`}>
            <div className="px-5">
                <h3 className="font-inter-bold">
                    {title}
                </h3>
                <div className="text-sm text-white/50">
                    {description}
                </div>
            </div>
            <div className={`w-full md:w-auto px-5 ${isRow ? "md:flex md:justify-end md:items-center" : ""} ${className}`}>
                {children}
            </div>
        </div>
    )
}

export default DialogOption
