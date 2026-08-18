import { getStorage, setStorage } from "@logic/storage"
import { bufToBase64, base64ToBuf, randomBytes, deriveHmacKey, equalArrayBuffers, ensureCryptoAvailability } from "@logic/utils"

const getAccountStoreMasterVerifierSetting = (account: any): boolean => {
    const settings = Array.isArray(account?.settings) ? account.settings : []
    const matchingSetting = settings.find((setting: { id?: string, value?: unknown }) => setting?.id === "store-master-verifier")

    if (!matchingSetting || typeof matchingSetting.value === "undefined") return true
    return Boolean(matchingSetting.value)
}

export const setMasterVerifier = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {

    const account = getStorage(accountId) || {}

    if (!getAccountStoreMasterVerifierSetting(account)) {
        removeMasterVerifier(accountId)
        return
    }

    const cryptoApi = ensureCryptoAvailability()
    const salt = new Uint8Array(randomBytes(16))
    const key = await deriveHmacKey(masterPassword, salt.buffer)
    const enc = new TextEncoder()
    const verifierBuf = await cryptoApi.subtle.sign('HMAC', key, enc.encode('vault-verifier-v1'))

    const stored = {
        salt: bufToBase64(salt.buffer),
        verifier: bufToBase64(verifierBuf)
    }

    const nextAccount = {
        ...account,
        master: stored
    }

    setStorage(accountId, nextAccount)

}

export const verifyMasterPassword = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {

    const account = getStorage(accountId)
    if (!account || !account.master) return true

    if (!getAccountStoreMasterVerifierSetting(account)) return true

    const cryptoApi = ensureCryptoAvailability()
    const { salt: saltB64, verifier: verifierB64 } = account.master

    if (!saltB64 || !verifierB64) return true

    const saltBuf = base64ToBuf(saltB64)
    const key = await deriveHmacKey(masterPassword, saltBuf)
    const enc = new TextEncoder()
    const computed = await cryptoApi.subtle.sign('HMAC', key, enc.encode('vault-verifier-v1'))
    const storedVerifierBuf = base64ToBuf(verifierB64)

    return equalArrayBuffers(computed, storedVerifierBuf)

}

export const removeMasterVerifier = (accountId: string) => {

    const account = getStorage(accountId)
    if (!account) return

    delete account.master

    setStorage(accountId, account)

}
