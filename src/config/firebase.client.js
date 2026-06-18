"use strict";

/**
 * Firebase Web / mobile client config (safe to expose via API).
 * Mirrors the Firebase JS SDK initializeApp({ ... }) object.
 */
function getClientConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const apiKey = process.env.FIREBASE_API_KEY;
  const appId = process.env.FIREBASE_APP_ID;

  if (!projectId || !apiKey || !appId) {
    return null;
  }

  const config = {
    apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket:
      process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || undefined,
    appId,
  };

  if (process.env.FIREBASE_MEASUREMENT_ID) {
    config.measurementId = process.env.FIREBASE_MEASUREMENT_ID;
  }

  return config;
}

module.exports = {
  getClientConfig,
  isConfigured: () => Boolean(getClientConfig()),
};
