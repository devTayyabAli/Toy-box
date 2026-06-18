"use strict";

const Stripe = require("stripe");

let client;

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

function isStripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

module.exports = { getStripe, isStripeEnabled };
