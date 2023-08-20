// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getRemoteConfig } from 'firebase/remote-config'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore, writeBatch } from 'firebase/firestore'
import { connectStorageEmulator, getStorage } from 'firebase/storage'

import { IS_DEVELOP, env } from '../constants'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Analytics and get a reference to the service
export const analytics = getAnalytics(app)

// Initialize Remote Config and get a reference to the service
export const remoteConfig = getRemoteConfig(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Create a root reference
export const storage = getStorage()

export const batch = writeBatch(db);

if (IS_DEVELOP) {
  const AUTH_PORT = 9099
  const FIRESTORE_PORT = 8080
  const STORAGE_PORT = 9199
  connectAuthEmulator(auth, `http://localhost:${AUTH_PORT}`)
  connectFirestoreEmulator(db, 'localhost', FIRESTORE_PORT)
  connectStorageEmulator(storage, 'localhost', STORAGE_PORT)

  remoteConfig.settings.minimumFetchIntervalMillis = 0
  remoteConfig.defaultConfig = {
    VITE_title: 'groove league 2023',
    // dark_mode: false,
    timeout: 2000,
  }
}
