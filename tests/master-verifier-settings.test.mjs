import assert from 'node:assert/strict'

const makeStorage = () => {
  const store = new Map()
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key)
  }
}

const setupBrowserStorage = () => {
  const storage = makeStorage()
  globalThis.window = {
    localStorage: storage,
    sessionStorage: makeStorage(),
    dispatchEvent: () => {}
  }
  globalThis.CustomEvent = class CustomEvent {
    constructor(type, detail = {}) {
      this.type = type
      this.detail = detail.detail ?? {}
    }
  }
}

setupBrowserStorage()

const { setStorage } = await import('../src/logic/storage.ts')
const { checkAccountMasterPassword } = await import('../src/logic/account.ts')

const accountId = 'no-master-verifier'
setStorage(accountId, {
  settings: [{ id: 'store-master-verifier', value: false }]
})

assert.equal(
  await checkAccountMasterPassword({ accountId, masterPassword: 'any-password' }),
  true,
  'When master verification storage is disabled, access should not require a stored master verifier.'
)

setStorage(accountId, {
  settings: [{ id: 'store-master-verifier', value: false }],
  master: { salt: 'broken', verifier: 'broken' }
})

assert.equal(
  await checkAccountMasterPassword({ accountId, masterPassword: 'any-password' }),
  true,
  'Imported or synced data should not force master verification when the option is disabled.'
)

console.log('master verifier settings regression checks passed')
