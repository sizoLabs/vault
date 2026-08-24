import { useState } from "react"

const Lite = () => {

    const [ showLiteMessage, setShowLiteMessage ] = useState(false)

    return (
        <>
            { showLiteMessage && (
                <div className="absolute inset-0 z-999 hidden bg-darker lite:flex">

                    <div className="bg-amber-500/10 w-full h-full flex flex-col items-center justify-center gap-5 p-5 border border-amber-500 squircle-md">

                        <div className="flex max-w-150 flex-col items-center gap-5 text-center">

                            <h2 className="text-6xl font-inter-black text-amber-500">
                                VAULT LITE
                            </h2>

                            <p className="text-lg text-white/80">
                                We detected that your browser is not using hardware acceleration.
                            </p>

                            <p className="text-white/60">
                                To keep VAULT running smoothly and avoid unnecessary CPU usage, the visual options that consume the most resources have been disabled by default. You can continue using the application in this lightweight mode.
                            </p>

                            <p className="text-white/60">
                                To see the full website design, open Chrome and go to <b className="text-white">Settings -&gt; System</b>. Turn on <b className="text-white">Use graphics acceleration when available</b> and restart Chrome.
                            </p>

                            <button
                                type="button"
                                onClick={() => setShowLiteMessage(false)}
                                className="mt-2 border border-amber-500 px-5 py-3 text-amber-500 squircle-full duration-300 hover:bg-amber-500 hover:text-darker cursor-pointer"
                            >
                                Continue with VAULT Lite
                            </button>

                        </div>

                    </div>
                </div>
            )}

            <button
                type="button"
                onClick={() => setShowLiteMessage(true)}
                className="lite:block hidden text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/50 hover:border-amber-500 duration-300 px-4 pt-2 pb-1.5 squircle-full mb-5 cursor-pointer"
            >
                <i className="ti ti-info-circle mr-2 text-xl -mt-0.5 align-middle inline-block" />
                You are using <b>Vault Lite</b>
            </button>
        </>
    )

}

export default Lite
