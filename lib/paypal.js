/**
 * PayPal REST API helpers (server-side only).
 * Docs: https://developer.paypal.com/api/rest/
 */
import axios from 'axios';
import crypto from 'crypto';

const BASE = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

// ── OAuth token cache ──────────────────────────────────────────────────────────
let _tokenCache = null;

async function getAccessToken() {
  if (_tokenCache && _tokenCache.expiresAt > Date.now()) {
    return _tokenCache.token;
  }

  const credentials = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString('base64');

  const { data } = await axios.post(
    `${BASE}/v1/oauth2/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  _tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return _tokenCache.token;
}

// ── Create order ───────────────────────────────────────────────────────────────
export async function createPayPalOrder({ amountUSD, orderId, productName }) {
  const token = await getAccessToken();

  const { data } = await axios.post(
    `${BASE}/v2/checkout/orders`,
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          description: productName,
          amount: {
            currency_code: 'USD',
            value: String(amountUSD.toFixed(2)),
          },
        },
      ],
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
  );

  return data; // { id, status, links, ... }
}

// ── Capture order ─────────────────────────────────────────────────────────────
export async function capturePayPalOrder(paypalOrderId) {
  const token = await getAccessToken();

  const { data } = await axios.post(
    `${BASE}/v2/checkout/orders/${paypalOrderId}/capture`,
    {},
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
  );

  return data; // { id, status: 'COMPLETED', ... }
}

// ── Verify webhook signature ───────────────────────────────────────────────────
/**
 * Verifies the PayPal webhook signature using PayPal's /v1/notifications/verify-webhook-signature API.
 * @param {object} headers  Raw request headers
 * @param {string} rawBody  Raw request body string
 * @returns {Promise<boolean>}
 */
export async function verifyPayPalWebhook(headers, rawBody) {
  const token = await getAccessToken();

  const payload = {
    auth_algo:         headers['paypal-auth-algo'],
    cert_url:          headers['paypal-cert-url'],
    transmission_id:   headers['paypal-transmission-id'],
    transmission_sig:  headers['paypal-transmission-sig'],
    transmission_time: headers['paypal-transmission-time'],
    webhook_id:        process.env.PAYPAL_WEBHOOK_ID,
    webhook_event:     JSON.parse(rawBody),
  };

  const { data } = await axios.post(
    `${BASE}/v1/notifications/verify-webhook-signature`,
    payload,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } },
  );

  return data.verification_status === 'SUCCESS';
}
