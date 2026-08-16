interface LegalProps {
    onPanelChange: (panel: string) => void
}

const Legal = (props: LegalProps) => {
    const { onPanelChange } = props
    return (
        <div className="group">
            <button
                onClick={ () => onPanelChange("legal") }
                className="cursor-pointer hover:font-inter-bold opacity-30 group-hover:opacity-80 hover:opacity-100 duration-300 text-sm"
            >
                Legal Notice & Disclaimer
            </button>
        </div>
    )
}

export default Legal