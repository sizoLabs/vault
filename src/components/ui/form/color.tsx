import { useEffect, useState } from "react"

interface ColorProps {
    id: string
    value: string
    onChange: (payload: { settingId: string, value: string }) => void
}

const Color = (props: ColorProps) => {

    const { id, value, onChange } = props

    const [ color, setColor ] = useState<string>(typeof value === "string" && value ? value : "#8A5FFF")

    useEffect(() => {
        setColor(typeof value === "string" && value ? value : "#8A5FFF")
    }, [ value ])

    return (
        <div className="flex items-center gap-3">
            <label className="relative block h-11 w-14 cursor-pointer overflow-hidden border border-white/20 bg-white/5 shadow-inner squircle squircle-md">
                <span
                    className="absolute inset-0 block squircle squircle-md"
                    style={{ backgroundColor: color }}
                />
                <input
                    type="color"
                    value={ color }
                    onChange={ (event) => {
                        const nextColor = event.target.value
                        setColor(nextColor)
                        onChange({ settingId: id, value: nextColor })
                    }}
                    className="absolute inset-0 h-full w-full cursor-pointer border-0 bg-transparent opacity-0"
                />
            </label>
        </div>
    )

}

export default Color
