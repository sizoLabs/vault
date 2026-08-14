import { useEffect, useState } from "react"

import type { BackgroundSVGData } from "@logic/background"
import { generateBackgroundSVGData } from "@logic/background"
import { getSetting } from "@logic/settings"
import { getStorage } from "@logic/storage"

const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return "165, 95, 255"
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
}

export default function Background() {

    const [ svgData, setSvgData ] = useState<BackgroundSVGData | null>(null)
    const [ themeColor, setThemeColor ] = useState<string>("#a58fff")
    const [ showBackground, setShowBackground ] = useState(false)

    useEffect(() => {

        const accountId = getStorage("current-account")
        const disableBackground = getSetting({ accountId, settingId: "disable-background" })
        const color = getSetting({ accountId, settingId: "theme-color" }) as string || "#a58fff"
        const shouldShowBackground = !disableBackground

        setShowBackground(shouldShowBackground)
        setThemeColor(color)

        const handleBackgroundChange = (event: Event) => {
            const customEvent = event as CustomEvent
            const data = customEvent.detail as BackgroundSVGData
            if (data && data.pathData && data.color) {
                setSvgData(data)
                setThemeColor(data.color)
            }
        }

        const handleBackgroundSettingChange = (event: Event) => {

            const customEvent = event as CustomEvent
            const { isDisabled, color } = customEvent.detail as { isDisabled: boolean; color?: string }
            setShowBackground(!isDisabled)

            if (color) {
                setThemeColor(color)
            }
            
        }

        window.addEventListener('backgroundChange', handleBackgroundChange)
        window.addEventListener('backgroundSettingChange', handleBackgroundSettingChange)
        
        if(shouldShowBackground) {
            setSvgData(generateBackgroundSVGData(color))
        }

        return () => {
            window.removeEventListener('backgroundChange', handleBackgroundChange)
            window.removeEventListener('backgroundSettingChange', handleBackgroundSettingChange)
        }

    }, [])
    
    if(!showBackground) return (
        <div 
            className="w-full h-full absolute z-0" 
            style={{
                backgroundColor: `rgba(${hexToRgb(themeColor)}, 0.05)`
            }}
        />
    )

    if (!svgData) return (<></>)
        
    const filterId = `blur-${svgData.color.replace('#', '')}`

    return (
        <>
            <svg 
                viewBox="0 0 500 500" 
                xmlns="http://www.w3.org/2000/svg" 
                preserveAspectRatio="xMidYMid meet"
                className="fixed duration-300 top-0 -left-12.5 lg:left-0 w-225 lg:w-[3000px] h-325 lg:h-[1800px] -z-1 blur-[100px]"
                style={{ 
                    opacity: 0.3,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <defs>
                    <filter id={filterId}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
                    </filter>
                    <filter id={`turbulence-${filterId}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" />
                    </filter>
                </defs>
                <path 
                    d={svgData.pathData} 
                    fill={svgData.color} 
                    opacity="0.6" 
                    filter={`url(#${filterId})`} 
                />
                <path 
                    d={svgData.pathData} 
                    fill={svgData.color} 
                    opacity="0.3" 
                    filter={`url(#turbulence-${filterId})`} 
                />
            </svg>
            <svg 
                viewBox="0 0 500 500" 
                xmlns="http://www.w3.org/2000/svg" 
                preserveAspectRatio="xMidYMid meet"
                className="fixed duration-300 top-0 rotate-180 lg:-top-250 -left-12.5 lg:left-[-1800px] w-225 lg:w-[3000px] h-325 lg:h-[1800px] -z-1 blur-[100px]"
                style={{ 
                    opacity: 0.3,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <defs>
                    <filter id={filterId}>
                        <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
                    </filter>
                    <filter id={`turbulence-${filterId}`}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" />
                    </filter>
                </defs>
                <path 
                    d={svgData.pathData} 
                    fill={svgData.color} 
                    opacity="0.3" 
                    filter={`url(#${filterId})`} 
                />
                <path 
                    d={svgData.pathData} 
                    fill={svgData.color} 
                    opacity="0.2" 
                    filter={`url(#turbulence-${filterId})`} 
                />
            </svg>
        </>
    )
}