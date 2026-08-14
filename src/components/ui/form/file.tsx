import { useRef } from "react"

interface FileInputProps {
    id: string
    onChange: Function
    accept?: string
}

const FileInput = (props: FileInputProps) => {
    const { id, onChange, accept } = props
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event)
    }

    return (
        <div className="file-input">
            <input
                ref={fileInputRef}
                type="file"
                id={id}
                onChange={handleFileChange}
                accept={accept}
                style={{ display: "none" }}
            />
            <button
                type="button"
                onClick={handleButtonClick}
                className="file-input-button"
            >
                Select File to Import
            </button>
        </div>
    )
}

export default FileInput
