interface FooterProps {
    onSectionChange: (section: string) => void
}

const Footer = (props: FooterProps) => {

    const { onSectionChange } = props

    return (
        <div className="absolute z-50 -bottom-12.5 flex w-full flex-col md:flex-row justify-between items-center gap-3 pb-15 px-5">
            <div className="flex flex-row gap-2 items-center justify-center">
                <div className="group text-sm">
                    <span className="opacity-20 group-hover:opacity-50 mr-1.5 duration-300">
                        Crafted with ❤︎ by
                    </span>
                    <a
                        href="https://sizo.dev"
                        target="_blank"
                        className="hover:font-inter-bold opacity-30 group-hover:opacity-80 hover:opacity-100 duration-300"
                    >
                        SizoDev
                    </a>
                </div>
            </div>
            <div className="group">
                <button
                    onClick={ () => onSectionChange("legal") }
                    className="cursor-pointer hover:font-inter-bold opacity-30 group-hover:opacity-80 hover:opacity-100 duration-300 text-sm"
                >
                    Legal Notice & Disclaimer
                </button>
            </div>
        </div>
    )

}

export default Footer