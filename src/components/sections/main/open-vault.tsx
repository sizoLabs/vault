interface OpenVaultProps {
    vaultOpened: boolean
}

export default function OpenVault(props: OpenVaultProps) {

    const { vaultOpened } = props

    return (
        <div className="backdrop-blur-3xl h-full w-full absolute z-90 flex flex-col justify-center items-center transition-opacity duration-300 ease-out opacity-100 pointer-events-auto">
            <div className="w-50 h-50 md:w-100 md:h-100">
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#vault_rect)">
                        <path d="M3 6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3H18C18.7956 3 19.5587 3.31607 20.1213 3.87868C20.6839 4.44129 21 5.20435 21 6V18C21 18.7956 20.6839 19.5587 20.1213 20.1213C19.5587 20.6839 18.7956 21 18 21H6C5.20435 21 4.44129 20.6839 3.87868 20.1213C3.31607 19.5587 3 18.7956 3 18V6Z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        <g className="animate-spin" style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                            <path d="M9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.7956 15 13.5587 14.6839 14.1213 14.1213C14.6839 13.5587 15 12.7956 15 12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12Z" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.75 9.75L8 8" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.25 9.75L16 8" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.25 14.25L16 16" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9.75 14.25L8 16" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                        </g>
                    </g>
                    <defs>
                        <clipPath id="vault_rect">
                            <rect width="24" height="24" fill="white"/>
                        </clipPath>
                    </defs>
                </svg>
            </div>
            <div className="font-inter-bold text-xl md:text-2xl">
                { vaultOpened ? "Vault Open!" : "Opening vault..." }
            </div>
        </div>
    )

}
