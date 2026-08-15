import type { MouseEventHandler } from "react"

interface AccountCardProps {
    accountId: string
    accountName: string
    accountIcon?: string
    isCurrent?: boolean
    canEdit?: boolean
    isSelectable?: boolean
    onClick?: () => void
    onSettingsClick?: MouseEventHandler<HTMLButtonElement>
}

const AccountCard = ({
    accountId,
    accountName,
    accountIcon = "user",
    isCurrent = false,
    canEdit = false,
    isSelectable = true,
    onClick,
    onSettingsClick
}: AccountCardProps) => {

    const cardClassName = isCurrent
        ? "border-primary bg-primary/10!"
        : isSelectable
            ? "border-white/10 hover:bg-primary/15 hover:border-primary hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
            : "border-white/10 cursor-not-allowed opacity-80"

    return (
        <div
            onClick={isSelectable ? onClick : undefined}
            className={`z-40 relative group bg-white/2 px-5 py-5 pb-7 squircle-md border w-full duration-300 min-w-40 sm:max-w-50 flex flex-col justify-center items-center backdrop-blur-2xl cursor-pointer ${cardClassName}`}
        >
            <div className="font-inter-bold text-center mb-1 truncate w-full">
                {accountName}
            </div>
            <div className="text-center text-white/30 text-[10px] mb-3 truncate w-full">
                {accountId.slice(0, 12)}{accountId.length > 12 ? "..." : ""}
            </div>
            <div className="text-center">
                <i className={`text-8xl ti ti-${accountIcon}`} />
            </div>
            {canEdit && onSettingsClick && (
                <button
                    type="button"
                    onClick={(event) => {
                        event.stopPropagation()
                        onSettingsClick(event)
                    }}
                    className="z-50 absolute sm:opacity-0 duration-300 sm:group-hover:opacity-100 bottom-2 right-2 px-1.5 pt-1.5 pb-0 bg-white/5 squircle-md cursor-pointer border border-white/20 sm:border-white/50 hover:bg-white/15 hover:border-white"
                >
                    <i className="ti ti-settings text-xl" />
                </button>
            )}
        </div>
    )

}

export default AccountCard
