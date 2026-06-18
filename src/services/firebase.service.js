"use strict";

const firebaseConfig = require("../config/firebase");
const firebaseClientConfig = require("../config/firebase.client");

exports.isAdminEnabled = () => firebaseConfig.enabled;

/** @deprecated use isAdminEnabled */
exports.isEnabled = () => firebaseConfig.enabled;

exports.isClientConfigured = () => firebaseClientConfig.isConfigured();

exports.getClientConfig = () => firebaseClientConfig.getClientConfig();

exports.getMessaging = () => {
  if (!firebaseConfig.enabled) return null;
  return firebaseConfig.admin.messaging();
};

exports.getFirestore = () => {
  if (!firebaseConfig.enabled) return null;
  return firebaseConfig.admin.firestore();
};

exports.getStatus = () => ({
  clientConfigured: firebaseClientConfig.isConfigured(),
  adminConfigured: firebaseConfig.enabled,
  projectId: process.env.FIREBASE_PROJECT_ID || null,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || null,
  apnsBundleId: firebaseConfig.apnsBundleId,
});

exports.getAdmin = () => firebaseConfig.admin;
