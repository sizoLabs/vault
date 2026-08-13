interface VaultProps {
    vaultId: string
}

const Vault = (props: VaultProps) => {

    const { vaultId } = props

    return (
        <div className="relative bg-white/2 border-white/10 w-full h-full squircle squircle-md backdrop-blur-2xl border overflow-hidden">

            <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                <div className="z-50 relative flex min-h-full max-w-200 flex-col px-5 py-5 md:p-10">
                    
                    <h2 className="text-3xl font-inter-black mb-5">
                        Vault
                    </h2>

                    <div className="flex flex-col w-full text">
                        a
                    </div>
                </div>
            </div>

        </div>
    )

}

export default Vault