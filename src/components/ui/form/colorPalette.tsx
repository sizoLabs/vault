interface ColorPaletteProps {
    id: string
    value: string
    onChange: ({ settingId, value }: { settingId: string; value: string }) => void
}

interface ColorOption {
    hex: string
    name: string
}

const ColorPalette = (props: ColorPaletteProps) => {
    const { id, value, onChange } = props

    const colors: ColorOption[] = [
        { hex: "#FF6565", name: "Cherrybliss" },
        { hex: "#FFA069", name: "Peachwhisper" },
        { hex: "#FFFFB3", name: "Sunhaze" },
        { hex: "#B3FFB3", name: "Mintspark" },
        { hex: "#B3D9FF", name: "Skyribbon" },
        { hex: "#D9B3FF", name: "Lavendergloss" },
        { hex: "#FFB3E6", name: "Rosemist" },
        { hex: "#a58fff", name: "Enigmaflow" },
    ]

    return (
        <div className="max-w-30 mr-2 h-full p-1.5 flex gap-1 flex-wrap">
            {colors.map((color) => (
                <span
                    key={color.hex}
                    onClick={() => {
                        onChange({ settingId: id, value: color.hex })
                    }}
                    className="w-5 h-5 rounded-full inline-block cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                ></span>
            ))}
        </div>
    )
}

export default ColorPalette
