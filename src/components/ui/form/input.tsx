import { useEffect, useState } from "react"

interface InputProps {
    id: string
    type: string
    defaultValue: any
    onChange: Function
}

const Input = (props: InputProps) => {

    const { id, type, defaultValue, onChange } = props

    const [ value, setValue ] = useState(defaultValue)

    useEffect(() => {
        setValue(defaultValue)
    }, [defaultValue])

    return (
        <div className="input">
            <input
                value={ value }
                type={ type }
                onChange={ (event) => {
                    const nextValue = type === "number" ? Number(event.target.value) : event.target.value
                    onChange({ settingId: id, value: nextValue })
                    setValue(nextValue)
                }}
            />
        </div>
    )
}

export default Input