import type { MouseEventHandler } from "react"
import type { IAlphabet } from "@interface/index"

interface AlphabetCardProps {
    alphabet: IAlphabet
    onSettingsClick: MouseEventHandler<HTMLDivElement>
}

const AlphabetCard = ({
    alphabet,
    onSettingsClick
}: AlphabetCardProps) => {

    return (
        <div
            className={`z-40 relative group bg-white/2 px-5 py-5 squircle-md border w-full border-white/10 hover:bg-primary/15 hover:border-primary hover:shadow-xl hover:-translate-y-0.5 duration-300 min-w-40 sm:max-w-50 flex flex-col justify-center items-center backdrop-blur-2xl`}
        >
            <div className="font-inter-bold text-center mb-3">
                { alphabet.name }
            </div>
            <div className="text-center">
                <i className={ `text-8xl ti ti-${alphabet.icon}` } />
            </div>
            <div
                onClick={ (e) => {
                    e.stopPropagation()
                    onSettingsClick(e)
                }}
                className="z-50 absolute sm:opacity-0 duration-300 sm:group-hover:opacity-100 bottom-2 right-2 px-1.5 pt-1.5 pb-0 bg-white/5 squircle-md cursor-pointer border border-white/20 sm:border-white/50 hover:bg-white/15 hover:border-white"
            >
                <i className="ti ti-settings text-xl" />
            </div>
        </div>
    )

}

export default AlphabetCard
