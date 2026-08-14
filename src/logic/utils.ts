import * as randomseed from "random-seed"

export const generateId = () => Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)

export const generateAccountId = (): string => {

    const cryptoApi = globalThis.crypto

    if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
        return cryptoApi.randomUUID()
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
        const random = Math.random() * 16 | 0
        const value = char === 'x' ? random : (random & 0x3) | 0x8
        return value.toString(16)
    })
	
}

export const genPassword = async (
	master: string,
	identifier: string,
	length: number,
	alphabet: {
		identifier: string,
		characters: string
	},
	version?: number
	): Promise<string> => {

    if(master == '' || identifier == '') return ''

	let versionHash = ''

	if(version && version > 1)
		versionHash = await createHash('version-' + version)

    const masterHash = await createHash(master)
    const identifierHash = await createHash(identifier)
    const alphabetHash = await createHash(alphabet.identifier)

	let appendHashes = masterHash + identifierHash + alphabetHash

	if(versionHash) appendHashes += versionHash

    const hash = await createHash(appendHashes)

	return await createPassword(hash, length, alphabet.characters)

}

const createPassword = async (hash: string, length: number, alphabet: string): Promise<string> => {

    const seed = randomseed.create(hash)

    let result = ''

    for(let i = 0; i < length; i++)
        result += alphabet[seed(alphabet.length)]

    return result
}

const createHash = async (str: string): Promise<string> => {
    const buffer = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(str))
    return Array.prototype.map.call(new Uint8Array(buffer), x => (('00' + x.toString(16)).slice(-2))).join('')
}

export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
}

export const downloadFile = (data: string, filename: string, type: string) => {
	
    var file = new Blob([data], { type: type })

	const a = document.createElement("a")
	const url = URL.createObjectURL(file)

	a.href = url
	a.download = filename

	document.body.appendChild(a)

	a.click()

	setTimeout(function() {
		document.body.removeChild(a)
		window.URL.revokeObjectURL(url); 
	}, 0)

}

const generateKey = async (masterKey: string, salt: BufferSource, iterations: number, length: number, hash: HashAlgorithmIdentifier, algorithm = 'AES-CBC'): Promise<CryptoKey> => {

	const encoder = new TextEncoder()

	const keyMaterial = await window.crypto.subtle.importKey('raw', encoder.encode(masterKey), { name: 'PBKDF2' }, false, ['deriveKey'])

	return await window.crypto.subtle.deriveKey({
		name: 'PBKDF2',
		salt,
		iterations,
		hash
	}, keyMaterial, {
		name: algorithm,
		length: length
	}, false, ['encrypt', 'decrypt'])

}

export const encodeData = async (masterKey: string, data: any) => {

	const encoder = new TextEncoder()

	const salt = window.crypto.getRandomValues(new Uint8Array(16))
	const iv = window.crypto.getRandomValues(new Uint8Array(16))
	const bufferData = encoder.encode(data)
	const key = await generateKey(masterKey, salt, 100000, 256, 'SHA-256')

	const encodedData = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: iv }, key, bufferData)

	return bufToBase64(new Uint8Array([...salt, ...iv, ...new Uint8Array(encodedData)]).buffer)

}

export const decodeData = async (masterKey: string, data: string) => {

	const decoder = new TextDecoder()

	const bufferData = base64ToBuf(data)
	const salt = bufferData.slice(0, 16)
	const iv = bufferData.slice(16, 32)
	const key = await generateKey(masterKey, salt, 100000, 256, 'SHA-256')

	const decodeDataBuffer = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: iv }, key, bufferData.slice(32))

	return decoder.decode(decodeDataBuffer)

}

export const bufToBase64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)))
export const base64ToBuf = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0)).buffer

export const randomBytes = (len = 16) => {
	const b = new Uint8Array(len)
	window.crypto.getRandomValues(b)
	return b.buffer
}

export const deriveHmacKey = async (password: string, salt: ArrayBuffer, iterations = 200000) => {
	const enc = new TextEncoder()
	const baseKey = await window.crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey'])
	const key = await window.crypto.subtle.deriveKey(
		{ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
		baseKey,
		{ name: 'HMAC', hash: 'SHA-256' },
		true,
		['sign', 'verify']
	)
	return key
}

export const equalArrayBuffers = (a: ArrayBuffer, b: ArrayBuffer) => {
	if (a.byteLength !== b.byteLength) return false
	const aa = new Uint8Array(a)
	const bb = new Uint8Array(b)
	let diff = 0
	for (let i = 0; i < aa.length; i++) diff |= aa[i] ^ bb[i]
	return diff === 0
}

export const normalizeHex = (defaultColor: string, color: string) => {
    if (!color || typeof color !== "string") return defaultColor
    const trimmed = color.trim()
    if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
        return `#${trimmed.slice(1).split("").map((value) => value + value).join("")}`.toUpperCase()
    }
    if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase()
    return defaultColor
}

export const hexToRgb = (defaultColor: string, hex: string) => {
    const normalized = normalizeHex(defaultColor, hex)
    const raw = normalized.replace("#", "")
    return {
        r: Number.parseInt(raw.slice(0, 2), 16),
        g: Number.parseInt(raw.slice(2, 4), 16),
        b: Number.parseInt(raw.slice(4, 6), 16)
    }
}

export const rgbToHex = ({ r, g, b }: { r: number, g: number, b: number }) => {
    const toHex = (value: number) => Math.min(255, Math.max(0, value)).toString(16).padStart(2, "0")
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

export const mixWithWhite = (defaultColor: string, hex: string, percentage = 0.2) => {
    const { r, g, b } = hexToRgb(defaultColor, hex)
    const ratio = 1 - percentage
    return rgbToHex({
        r: Math.round(r * ratio + 255 * percentage),
        g: Math.round(g * ratio + 255 * percentage),
        b: Math.round(b * ratio + 255 * percentage)
    })
}