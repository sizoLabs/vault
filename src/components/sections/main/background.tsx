export default function Background() {
    return (
        <>
            <div className="absolute inset-x-0 top-0 w-full h-screen lg:h-auto -z-1">
                <img className="opacity-50 w-full h-screen" src="/images/background.webp" />
            </div>
        </>
    )
}