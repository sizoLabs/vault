import type { ReactNode } from "react"

type BlockProps = {
    value: ReactNode
    label: string
    className?: string
}

const Block = ({ value, label, className = "" }: BlockProps) => {
    return (
        <div className={`bg-white/5 min-w-30 md:min-w-45 text-center px-5 md:px-8 py-7 squircle squircle-lg border border-white/15 shadow-lg ${className}`}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-inter-black">
                { value }
            </h2>
            <span className="mt-1 md:mt-2 block text-md md:text-lg lg:text-xl font-inter-medium">
                { label }
            </span>
        </div>
    )
}

export default Block