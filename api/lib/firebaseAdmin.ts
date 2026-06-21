/// <reference types="node" />
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function initAdmin() {
  if (getApps().length > 0) return

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT env var not set')
  }

  initializeApp({
    credential: cert(JSON.parse(serviceAccount)),
  })
}

export function getAdminDb() {
  initAdmin()
  return getFirestore()
}

// Firestore paths (multi-tenant ready)
export const skillDoc = (userId: string) => `aiSkills/${userId}`
export const skillVersionsCol = (userId: string) => `aiSkillVersions/${userId}/versions`
export const entryDoc = (entryId: string) => `entries/${entryId}`
