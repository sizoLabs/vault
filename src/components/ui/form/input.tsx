interface InputProps {
    id: string
    name?: string
    type: string
    min?: number
    max?: number
    value?: any
    placeholder?: string
    className?: string
    defaultValue?: any
    onChange?: ((e: React.ChangeEvent<HTMLInputElement>) => void) | ((value: any, id?: string) => void)
}

const Input = (props: InputProps) => {

    const { id, name, type, min, max, value, defaultValue, onChange, placeholder, className } = props

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onChange) return
        
        // Pass the full event to onChange - let the consumer decide what to do with it
        // The event contains both the value (e.target.value) and the id (e.currentTarget.id)
        onChange(e)
    }

    return (
        <div className="input">
            <input
                id={ id }
                name={ name }
                value={ value ?? defaultValue }
                type={ type }
                min={ type === "number" ? min : undefined }
                max={ type === "number" ? max : undefined }
                placeholder={ placeholder ?? "" }
                className={ className ?? "" }
                onChange={ onChange ? handleChange : undefined }
            />
        </div>
    )
}

export default Input