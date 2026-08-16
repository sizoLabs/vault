import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

const run = async () => {
  const source = await fs.readFile(new URL('../src/logic/google.ts', import.meta.url), 'utf8')
  const accountSource = await fs.readFile(new URL('../src/logic/account.ts', import.meta.url), 'utf8')

  assert.match(source, /export const getGoogleClientId/i)
  assert.match(source, /PUBLIC_GOOGLE_CLIENT_ID/i)
  assert.match(source, /drive\.appdata/i)
  assert.match(source, /account\.drive/i)
  assert.doesNotMatch(source, /enabled:\s*Boolean\(state\.enabled\)|enabled:\s*Boolean\(savedState\.enabled\)/i)
  assert.match(source, /files\?uploadType=multipart&supportsAllDrives=true/i)
  assert.doesNotMatch(source, /spaces=appDataFolder.*uploadType=multipart/i)
  assert.match(source, /export const buildDriveFileName/i)
  assert.match(source, /google-drive-file-id/i)
  assert.match(source, /export const getDriveFileIdentifier/i)
  assert.match(source, /export const formatGoogleDriveUserLabel/i)
  assert.match(source, /export const pushLocalAccountToGoogleDrive/i)
  assert.match(source, /export const pullGoogleDriveToAccount/i)
  assert.match(accountSource, /delete exportPayload\.drive/i)
  assert.ok(!source.includes("name = '${fileName}' and trashed = false"), 'pull should not depend on the current account id when reading Google Drive data')
  assert.match(source, /split\("@"\)\[0\]|split\('@'\)\[0\]/i)

  const fileName = source.match(/export const buildDriveFileName = \(accountId: string, [^\)]*\) => \{([\s\S]*?)return `vault-\$\{normalized\}\.vault`/)
  assert.ok(fileName, 'buildDriveFileName implementation should accept a custom file identifier')

  const normalizedName = source.match(/vault-\$\{normalized\}\.vault/i)
  assert.ok(normalizedName, 'drive filenames should still use the normalized vault naming pattern')

  const storage = new Map()
  const storageObject = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear()
  }
  const previousWindow = globalThis.window
  const previousCustomEvent = globalThis.CustomEvent
  globalThis.window = { localStorage: storageObject, dispatchEvent: () => {} }
  globalThis.CustomEvent = class CustomEvent {}

  try {
    const { resetAllData } = await import('../src/logic/data.ts')
    const { getStorage, setStorage } = await import('../src/logic/storage.ts')

    setStorage('account-1', {
      drive: { connected: true, accessToken: 'token', email: 'a@example.com' },
      services: [{ id: 'svc' }],
      secrets: [{ id: 'secret' }]
    })

    resetAllData('account-1')
    const account = getStorage('account-1')
    assert.equal(account.drive, undefined)
    assert.deepEqual(account.services, [])
    assert.deepEqual(account.secrets, [])
  } finally {
    globalThis.window = previousWindow
    globalThis.CustomEvent = previousCustomEvent
  }
}

await run()
console.log('google drive sync regression check passed')
