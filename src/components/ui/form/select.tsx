import { useEffect, useRef, useState } from "react"

interface SelectProps {
    id: string
    options: any[]
    selected: string
    descriptions?: boolean
    onSelect: Function
}

const Select = (props: SelectProps) => {

    const { id, options, selected, descriptions, onSelect } = props

    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const [ optionList, setOptionList ] = useState<any[]>(options)
    const [ dropdownOpen, setDropdownOpen ] = useState(false)

    useEffect(() => {
        setOptionList(options || [])
    }, [options])

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false)
            }
        }

        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const selectedOption = optionList.find((option) => option.id === selected) || optionList[0]

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="font-inter-medium h-fit w-full squircle-md px-3 py-2.5 border duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white flex justify-between items-center cursor-pointer"
            >
                <span className="truncate">
                    { selectedOption ? selectedOption.name : "Select an option" }
                </span>
                <i className={`ti ${dropdownOpen ? "ti-chevron-up" : "ti-chevron-down"} ml-2`} />
            </button>

            { dropdownOpen && (
                <ul className="absolute left-0 right-0 mt-0.5 max-h-50 overflow-y-auto squircle squircle-sm bg-white/5 backdrop-blur-xl border border-white/30 z-10">
                    { optionList && optionList.map((option: any) => (
                        <li
                            key={ option.id }
                            onClick={() => {
                                onSelect({ settingId: id, value: option.id })
                                setDropdownOpen(false)
                            }}
                            className="px-3 py-2 cursor-pointer hover:bg-white/10 border-b border-white/10 last:border-transparent"
                        >
                            { option.name }
                            { descriptions && option.description && (
                                <p className="text-xs text-white/70 mt-1">
                                    { option.description }
                                </p>
                            ) }
                        </li>
                    )) }
                </ul>
            ) }
        </div>
    )
}

export default Select