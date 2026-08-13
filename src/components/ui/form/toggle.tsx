import { useEffect, useState } from "react"

interface ToggleProps {
    id: string
    isChecked: boolean
    onToggle: Function
}

const Toggle = (props: ToggleProps) => {

    const { id, isChecked, onToggle } = props

    const [ checked, setChecked ] = useState(isChecked)

    useEffect(() => {
        setChecked(isChecked)
    }, [ isChecked ])

    return (
        <div className="top-7.5!">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={ checked }
                    onChange={ (event) => {
                        onToggle({ settingId: id, value: event.target.checked});
                        setChecked(event.target.checked);
                    }}
                />
                <span className="slider"></span>
            </label>
        </div>
    )
}

export default Toggle