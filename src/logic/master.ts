import { getStorage, setStorage } from "@logic/storage"
import { bufToBase64, base64ToBuf, randomBytes, deriveHmacKey, equalArrayBuffers } from "@logic/utils"

export const setMasterVerifier = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {

    const salt = new Uint8Array(randomBytes(16))
    const key = await deriveHmacKey(masterPassword, salt.buffer)
    const enc = new TextEncoder()
    const verifierBuf = await crypto.subtle.sign('HMAC', key, enc.encode('vault-verifier-v1'))

    const stored = {
        salt: bufToBase64(salt.buffer),
        verifier: bufToBase64(verifierBuf)
    }

    let account = getStorage(accountId) || {}

    account = {
        ...account,
        master: stored
    }

    setStorage(accountId, account)

}

export const verifyMasterPassword = async ({
    accountId,
    masterPassword
}: {
    accountId: string,
    masterPassword: string
}) => {

    const account = getStorage(accountId)
    if (!account || !account.master) return false

    const { salt: saltB64, verifier: verifierB64 } = account.master
    const saltBuf = base64ToBuf(saltB64)
    const key = await deriveHmacKey(masterPassword, saltBuf)
    const enc = new TextEncoder()
    const computed = await crypto.subtle.sign('HMAC', key, enc.encode('vault-verifier-v1'))
    const storedVerifierBuf = base64ToBuf(verifierB64)

    return equalArrayBuffers(computed, storedVerifierBuf)

}

export const removeMasterVerifier = (accountId: string) => {

    const account = getStorage(accountId)
    if (!account) return

    delete account.master

    setStorage(accountId, account)

}
