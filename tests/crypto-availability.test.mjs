import assert from 'node:assert/strict'

const run = async () => {
  const utilsModule = await import('../src/logic/utils.ts')
  const { ensureCryptoAvailability } = utilsModule

  const originalCrypto = globalThis.crypto
  const originalIsSecureContext = globalThis.isSecureContext

  try {
    Object.defineProperty(globalThis, 'crypto', { value: undefined, configurable: true })
    Object.defineProperty(globalThis, 'isSecureContext', { value: false, configurable: true, writable: true })
    assert.throws(() => ensureCryptoAvailability(), /secure context|Web Crypto/i)

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        subtle: {
          importKey: () => Promise.resolve('ok'),
          deriveKey: () => Promise.resolve('ok')
        }
      },
      configurable: true
    })
    Object.defineProperty(globalThis, 'isSecureContext', { value: true, configurable: true, writable: true })
    assert.doesNotThrow(() => ensureCryptoAvailability())
  } finally {
    Object.defineProperty(globalThis, 'crypto', { value: originalCrypto, configurable: true })
    Object.defineProperty(globalThis, 'isSecureContext', { value: originalIsSecureContext, configurable: true, writable: true })
  }
}

await run()
console.log('crypto availability regression check passed')
