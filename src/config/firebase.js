"use strict";

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

let app = null;

function parsePrivateKey(raw) {
  if (!raw) return null;
  return String(raw).replace(/\\n/g, "\n");
}

function loadServiceAccount() {
  const jsonPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (jsonPath) {
    const resolved = path.isAbsolute(jsonPath)
      ? jsonPath
      : path.resolve(process.cwd(), jsonPath);
    if (fs.existsSync(resolved)) {
      return JSON.parse(fs.readFileSync(resolved, "utf8"));
    }
    console.warn(
      `[Firebase] Service account file not found: ${resolved}. ` +
        "Chat will use in-memory store in development until this file is added.",
    );
  }

  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inlineJson) {
    return JSON.parse(inlineJson);
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
}

function initializeFirebase() {
  if (app) return app;

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  const options = {
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID,
  };

  if (!admin.apps.length) {
    app = admin.initializeApp(options);
  } else {
    app = admin.app();
  }

  return app;
}

const firebaseApp = initializeFirebase();

module.exports = {
  admin,
  app: firebaseApp,
  enabled: Boolean(firebaseApp),
  apnsBundleId: process.env.APNS_BUNDLE_ID || null,
  initializeFirebase,
};
