
interface LegalProps {
    onPanelChange: (panel: string) => void
}

const Links = (props: LegalProps) => {

    const { onPanelChange } = props

    return (

        <div className="group mb-5">
            <button
                onClick={ () => onPanelChange("legal") }
                className="cursor-pointer hover:font-inter-bold opacity-30 group-hover:opacity-80 hover:opacity-100 duration-300 text-sm"
            >
                Legal Notice & Disclaimer
            </button>
        </div>

    )
}

export default Links