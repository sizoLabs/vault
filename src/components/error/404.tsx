const Error = () => {

    return (
        <>
            <div className="z-0 h-screen">

                <div className="p-2 h-full flex flex-col md:flex-row items-center justify-left">

                    <div className="relative bg-white/2 border-white/10 w-full h-full squircle-md backdrop-blur-2xl border overflow-hidden">

                        <div className="absolute inset-0 overflow-y-scroll no-scrollbar-but-scroll">

                            <div className="z-50 relative mx-auto flex min-h-full max-w-200 flex-col px-5 py-5 md:py-10 justify-center items-center">
                                
                                <div className="text-center md:text-left">
                                    
                                    <h1 className="text-5xl md:text-5xl lg:text-8xl font-inter-black mb-10">
                                        VAULT <i className="ti ti-vault ml-1 align-bottom inline-block -mt-2 text-white text-[50px] md:text-[50px] lg:text-[95px]"></i>
                                    </h1>

                                    <h2 className="text-lg md:text-3xl text-white/70 font-inter-medium mb-8">
                                        Error 404 — Page Not Found
                                    </h2>

                                    <h2 className="text-2xl md:text-5xl font-inter-bold mb-2">
                                        Ops, something went wrong...
                                    </h2>

                                    <p className="text-lg md:text-2xl text-white/70 mb-15">
                                        We don't know what you wanted to see, but it's not here.
                                    </p>

                                    <a
                                        href="/"
                                        className="h-fit text-md md:text-lg font-inter-bold squircle-md px-3 md:px-8 py-3 md:py-5 border text-left cursor-pointer duration-300 hover:bg-primary/10 hover:border-primary/50 hover:text-white bg-white/5 border-white/10"
                                    >
                                        Back to VAULT
                                    </a>

                                </div>

                            </div>

                        </div>
                        
                    </div>
                </div>
                
            </div>
        </>
    )
}

export default Error