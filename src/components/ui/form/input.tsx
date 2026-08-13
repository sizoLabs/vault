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
    }, [])

    return (
        <div className="input">
            <input
                value={ value }
                type={ type }
                onChange={ (event) => {
                    onChange({ settingId: id, value: event.target.value});
                    setValue(event.target.value)
                }}
            />
        </div>
    )
}

export default Input