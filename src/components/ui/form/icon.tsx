import { useEffect, useMemo, useRef, useState } from "react"

const PAGE_SIZE = 80
const FALLBACK_ICONS = [
    "password-user",
    "password-fingerprint",
    "key",
    "lock",
    "lock-open",
    "shield",
    "shield-check",
    "mail",
    "user",
    "users",
    "briefcase",
    "database",
    "server",
    "world",
    "cloud",
    "book",
    "wallet",
    "credit-card",
    "home",
    "rocket",
    "star",
    "settings",
    "search",
    "folder",
    "bell",
    "calendar-event",
    "clock"
]

const extractIconNames = (cssText: string) => {
    const matches = [ ...cssText.matchAll(/\.ti-([a-z0-9-]+)(?::before|::before)?/gi) ]
    return [ ...new Set(matches.map((match) => match[1]).filter(Boolean)) ]
        .filter((icon) => !icon.includes(" "))
        .sort((a, b) => a.localeCompare(b))
}

const ICON_CATEGORIES = [
    "All",
    "Security",
    "People",
    "Files",
    "Navigation",
    "Communication",
    "Devices",
    "Tools",
    "Brands",
    "Arrows",
    "General"
] as const

const getIconCategory = (iconName: string) => {
    const value = iconName.toLowerCase()

    if (/password|lock|key|shield|fingerprint|safe|scan|security/.test(value)) return "Security"
    if (/user|person|users|profile|contact|friend|group/.test(value)) return "People"
    if (/file|folder|document|clipboard|copy|note|book|archive|database|sheet|report/.test(value)) return "Files"
    if (/home|map|location|route|pin|globe|world|building|compass|navigate|travel/.test(value)) return "Navigation"
    if (/mail|message|chat|bell|phone|send|at|notification|comment|sms|connection/.test(value)) return "Communication"
    if (/device|screen|monitor|laptop|tablet|mobile|server|cloud|wifi|router|camera|phone|computer/.test(value)) return "Devices"
    if (/search|settings|tool|wrench|gear|code|terminal|calendar|clock|star|flag|rocket|sparkles|brush/.test(value)) return "Tools"
    if (/brand|brand-|facebook|google|github|twitter|instagram|microsoft|apple|amazon|paypal|slack|discord|youtube|spotify|linkedin|dropbox|paypal|netflix|docker|chrome|gitlab/.test(value)) return "Brands"
    if (/arrow|chevron|caret|up|down|left|right|next|previous|back|forward|expand|collapse/.test(value)) return "Arrows"

    return "General"
}

type IconSelectorProps = {
    value: string
    onChange: (value: string) => void
    className?: string
}

const IconSelector = ({ value, onChange, className = "" }: IconSelectorProps) => {

    const [ open, setOpen ] = useState(false)
    const [ allIcons, setAllIcons ] = useState<string[]>([])
    const [ search, setSearch ] = useState("")
    const [ selectedCategory, setSelectedCategory ] = useState<(typeof ICON_CATEGORIES)[number]>("All")
    const [ visibleCount, setVisibleCount ] = useState(PAGE_SIZE)
    const [ showAllIcons, setShowAllIcons ] = useState(false)
    const sentinelRef = useRef<HTMLDivElement | null>(null)

    const normalizedValue = useMemo(() => {
        if (!value) return "password-user"
        return value.startsWith("ti-") ? value.replace(/^ti-/, "") : value
    }, [value])

    useEffect(() => {

        if (!open || allIcons.length > 0) return

        let isCancelled = false

        const loadIcons = async () => {
            try {
                const response = await fetch("/libs/tabler-icons.min.css")

                if (!response.ok) {
                    throw new Error("Unable to fetch icon CSS")
                }

                const cssText = await response.text()
                const parsedIcons = extractIconNames(cssText)

                if (!isCancelled) {
                    setAllIcons(parsedIcons.length ? parsedIcons : FALLBACK_ICONS)
                }

            } catch {
                if (!isCancelled) {
                    setAllIcons(FALLBACK_ICONS)
                }
            }
        }

        loadIcons()

        return () => {
            isCancelled = true
        }
    }, [open, allIcons.length])

    useEffect(() => {
        if (!open) return
        setVisibleCount(showAllIcons ? allIcons.length : PAGE_SIZE)
    }, [open, search, selectedCategory, showAllIcons, allIcons.length])

    const filteredIcons = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        const categoryFiltered = selectedCategory === "All"
            ? allIcons
            : allIcons.filter((icon) => getIconCategory(icon) === selectedCategory)

        if (!normalizedSearch) return categoryFiltered

        return categoryFiltered.filter((icon) => icon.toLowerCase().includes(normalizedSearch))
    }, [allIcons, search, selectedCategory])

    const visibleIcons = filteredIcons.slice(0, visibleCount)

    const handleShowAllToggle = () => {
        if (showAllIcons) {
            setShowAllIcons(false)
            setVisibleCount(PAGE_SIZE)
            return
        }

        setShowAllIcons(true)
        setVisibleCount(filteredIcons.length)
    }

    const handleCategorySelect = (nextCategory: (typeof ICON_CATEGORIES)[number]) => {
        setSelectedCategory(nextCategory)
        setShowAllIcons(true)
        setSearch("")
        setVisibleCount(nextCategory === "All" ? allIcons.length : allIcons.filter((icon) => getIconCategory(icon) === nextCategory).length)

        requestAnimationFrame(() => {
            const grid = document.querySelector(".icon-grid-scroll") as HTMLDivElement | null
            if (grid) grid.scrollTop = 0
        })
    }

    useEffect(() => {
        if (!open || !sentinelRef.current) return

        const scrollContainer = sentinelRef.current.parentElement

        if (!scrollContainer) return

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0]

            if (entry?.isIntersecting && visibleCount < filteredIcons.length) {
                setVisibleCount((current) => Math.min(current + PAGE_SIZE, filteredIcons.length))
            }
        }, {
            root: scrollContainer,
            rootMargin: "200px 0px",
            threshold: 0.1
        })

        observer.observe(sentinelRef.current)

        return () => observer.disconnect()
    }, [open, visibleCount, filteredIcons.length])

    const handleSelect = (nextIcon: string) => {
        onChange(nextIcon)
        setShowAllIcons(false)
        setOpen(false)
        setSearch("")
    }

    return (
        <div className="w-fit">
            <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className={ `font-inter-medium flex w-fit self-start items-center justify-center gap-3 squircle-md border pl-1 py-1 text-left duration-300 bg-white/5 border-white/20 focus:bg-white/10 focus:border-white/50 hover:bg-white/10 hover:border-white/50 hover:text-white cursor-pointer ${className}` }
            >
                <span className="flex items-center gap-3 min-w-0">
                    <span className="flex h-10 w-10 items-center justify-center squircle-md border border-white/10 bg-white/5 text-xl text-white">
                        <i className={ `ti ti-${normalizedValue}` } />
                    </span>
                    <span className="truncate text-sm font-inter-medium text-white/80">
                        { normalizedValue }
                    </span>
                </span>
                <i className={ `ti ${open ? "ti-chevron-up" : "ti-chevron-down"} text-xl text-white/60 mr-2` } />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-60 overflow-hidden flex items-center justify-center px-7"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setOpen(false)
                        }
                    }}
                >
                    <div className="w-full max-w-150 max-h-[60vh] border border-white/10 overflow-hidden rounded-2xl backdrop-blur-xl">
                        <div className="px-5 py-5 mb-4 flex items-center justify-between gap-3 border-b border-white/10 bg-white/5 pb-3">
                            <span className="text-sm md:text-lg font-inter-bold text-white">Select an Icon</span>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Close icon picker"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center squircle-md border border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                            >
                                <i className="ti ti-x text-lg" />
                            </button>
                        </div>

                        <div className="mb-4 flex flex-col gap-3 px-5">
                            <div className="flex flex-col md:flex-row items-center gap-3">
                                <div className="relative flex-1 w-full">
                                    <i className="ti ti-search absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search icon..."
                                        className="w-full squircle-md border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleShowAllToggle}
                                    className={ `w-full md:w-fit cursor-pointer squircle-md border px-6 py-3 text-xs duration-300 ${showAllIcons ? "border-primary bg-primary/20 text-white" : "border-white/15 bg-white/5 text-white/80 hover:border-primary/40 hover:bg-primary/10"}` }
                                >
                                    {showAllIcons ? "Hide all icons" : "Show all icons"}
                                </button>
                            </div>

                            <div className="overflow-x-auto no-scrollbar-but-scroll md:overflow-visible">
                                <div className="flex min-w-max md:min-w-fit gap-2 md:flex-wrap md:justify-start">
                                    {ICON_CATEGORIES.map((category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => handleCategorySelect(category)}
                                            className={ `cursor-pointer shrink-0 squircle-md border px-3 py-1.5 text-[10px] font-inter-medium uppercase tracking-wide duration-300 ${selectedCategory === category ? "border-primary bg-primary/20 text-white" : "border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white"}` }
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {allIcons.length === 0 ? (
                            <div className="py-10 text-center text-white/50">Loading icons...</div>
                        ) : filteredIcons.length === 0 ? (
                            <div className="py-10 text-center text-white/50">No icons found for this category or search.</div>
                        ) : (
                            <div className="flex max-h-[calc(55vh-8.5rem)] min-h-0 flex-col pb-15 px-5">
                                <div className="icon-grid-scroll grid min-h-0 max-h-full grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-5">
                                    {visibleIcons.map((icon) => (
                                        <button
                                            key={icon}
                                            type="button"
                                            onClick={() => handleSelect(icon)}
                                            className={ `flex flex-col items-center justify-center gap-2 squircle-md border px-2 py-3 duration-300 cursor-pointer ${normalizedValue === icon ? "border-primary bg-primary/20 text-white" : "border-white/10 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10"}` }
                                            aria-label={icon}
                                        >
                                            <i className={ `ti ti-${icon} text-3xl md:text-5xl` } />
                                            <span className="w-full truncate text-center text-[10px]">
                                                {icon}
                                            </span>
                                        </button>
                                    ))}

                                    {visibleCount < filteredIcons.length && <div ref={sentinelRef} className="col-span-full h-1 w-full" />}
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default IconSelector
