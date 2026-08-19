import Version from "@component/sections/settings/version"

const Logo = () => {
    return (
        <div className="flex flex-col items-center justify-center gap-2 mb-5">
            <h1 className="text-5xl md:text-5xl lg:text-8xl font-inter-black text-center">
                VAULT <i className="ti ti-vault ml-1 align-bottom inline-block -mt-2 text-white text-[48px] md:text-[50px] lg:text-[95px]"></i>
            </h1>
        </div>
    )
}

export default Logo