import { useEffect, useState } from "react"
import type { BackgroundSVGData } from "@logic/background"
import { generateBackgroundSVGData } from "@logic/background"

export default function Background() {

    const [svgData, setSvgData] = useState<BackgroundSVGData | null>(null)

    useEffect(() => {

        const handleBackgroundChange = (event: Event) => {
            const customEvent = event as CustomEvent
            const data = customEvent.detail as BackgroundSVGData
            if (data && data.pathData && data.color) {
                setSvgData(data)
            }
        }

        window.addEventListener('backgroundChange', handleBackgroundChange)

        const initialColor = "#8A5FFF"

        setSvgData(generateBackgroundSVGData(initialColor))

        return () => window.removeEventListener('backgroundChange', handleBackgroundChange)

    }, [])

    if (!svgData) return (<></>)

    const filterId = `blur-${svgData.color.replace('#', '')}`

    return (
        <>
            <svg 
                viewBox="0 0 500 500" 
                xmlns="http://www.w3.org/2000/svg" 
                preserveAspectRatio="xMidYMid meet"
                className="fixed duration-300 top-0 left-[-50px] lg:left-0 w-[900px] lg:w-[3000px] h-[1300px] lg:h-[1800px] -z-1 blur-[80px]"
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
        </>
    )
}