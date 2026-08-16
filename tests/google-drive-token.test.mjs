import assert from 'node:assert/strict'
import test from 'node:test'

import { isGoogleDriveAccessTokenExpired } from '../src/logic/google.ts'

test('expired token is detected when it has already expired', () => {
  assert.equal(
    isGoogleDriveAccessTokenExpired({ accessToken: 'abc', expiresAt: Date.now() - 1000 }),
    true,
  )
})

test('fresh token is not marked expired while still valid', () => {
  assert.equal(
    isGoogleDriveAccessTokenExpired({ accessToken: 'abc', expiresAt: Date.now() + 60_000 }),
    false,
  )
})

test('token without expiry metadata is treated as expired so it can be refreshed', () => {
  assert.equal(
    isGoogleDriveAccessTokenExpired({ accessToken: 'abc', expiresAt: 0 }),
    true,
  )
})
