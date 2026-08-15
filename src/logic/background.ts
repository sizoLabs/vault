import * as randomseed from "random-seed"

export interface BackgroundSVGData {
    pathData: string
    color: string
    seed: any
}

export const generateBackgroundSVGData = (color: string): BackgroundSVGData => {
    
    const seed = randomseed.create(color)
    const points = []
    const numPoints = seed(4) + 4
    
    for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2
        const radius = 100 + seed(150)
        const x = 500 + Math.cos(angle) * radius
        const y = 500 + Math.sin(angle) * radius
        points.push({ x, y })
    }
    
    let pathData = `M ${points[0].x} ${points[0].y}`
    
    for (let i = 0; i < points.length; i++) {
        const current = points[i]
        const next = points[(i + 1) % points.length]
        const cpX1 = current.x + (next.x - current.x) * 0.3
        const cpY1 = current.y + (next.y - current.y) * 0.3
        const cpX2 = next.x - (next.x - current.x) * 0.3
        const cpY2 = next.y - (next.y - current.y) * 0.3
        pathData += ` C ${cpX1} ${cpY1} ${cpX2} ${cpY2} ${next.x} ${next.y}`
    }
    
    pathData += " Z"

    return { pathData, color, seed }
}

export const applyBackgroundSVG = (color: string) => {
    if (typeof document === "undefined" || typeof window === "undefined") return
    const svgData = generateBackgroundSVGData(color)
    window.dispatchEvent(new CustomEvent('backgroundChange', { detail: svgData }))
}

export const applyGradientBackgroundSetting = (isDisabled: boolean, color?: string) => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent('backgroundGradientSettingChange', { detail: { isDisabled, color } }))
}

export const applyColoredBackgroundSetting = (isDisabled: boolean) => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent('backgroundColoredSettingChange', { detail: { isDisabled } }))
}
