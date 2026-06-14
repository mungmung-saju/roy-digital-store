/**
 * POST /api/webhooks/nowpayments
 *
 * NOWPayments sends IPN (Instant Payment Notification) events here.
 * We:
 *  1. Verify the HMAC-SHA512 signature from the x-nowpayments-sig header.
 *  2. On payment_status === 'finished', fulfill the matching order.
 *
 * Docs: https://documenter.getpostman.com/view/7907941/2s93JusNJt
 */
import crypto from 'crypto';
import { buffer } from 'micro';
import { fulfillOrder } from '../../../lib/orders';
import { supabaseAdmin } from '../../../lib/supabase';

export const config = {
  api: { bodyParser: false },
};

/**
 * NOWPayments signs the sorted JSON body with HMAC-SHA512 using the IPN secret.
 */
function verifyNowPaymentsSignature(rawBody, signature) {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret) throw new Error('NOWPAYMENTS_IPN_SECRET is not set.');

  // NOWPayments sorts keys alphabetically before signing
  const parsed = JSON.parse(rawBody);
  const sorted = JSON.stringify(
    Object.fromEntries(Object.entries(parsed).sort(([a], [b]) => a.localeCompare(b))),
  );

  const expected = crypto
    .createHmac('sha512', secret)
    .update(sorted)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex'),
    );
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const rawBody = (await buffer(req)).toString('utf8');
  const signature = req.headers['x-nowpayments-sig'];

  if (!signature) {
    console.warn('[nowpayments-webhook] Missing signature header.');
    return res.status(401).json({ error: 'Missing signature.' });
  }

  // 1. Verify HMAC signature
  let valid = false;
  try {
    valid = verifyNowPaymentsSignature(rawBody, signature);
  } catch (err) {
    console.error('[nowpayments-webhook] Signature error:', err.message);
    return res.status(400).json({ error: 'Signature verification error.' });
  }

  if (!valid) {
    console.warn('[nowpayments-webhook] Invalid signature – request rejected.');
    return res.status(401).json({ error: 'Invalid signature.' });
  }

  const event = JSON.parse(rawBody);
  console.log(`[nowpayments-webhook] payment_status=${event.payment_status} order_id=${event.order_id}`);

  // 2. Only act on final "finished" status
  if (event.payment_status === 'finished') {
    const internalOrderId = event.order_id; // We set this as order_id when creating the payment

    try {
      // Verify the order exists in our DB before fulfilling
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id, payment_status')
        .eq('id', internalOrderId)
        .single();

      if (!order) {
        console.warn(`[nowpayments-webhook] Order ${internalOrderId} not found.`);
        return res.status(200).end();
      }

      await fulfillOrder(order.id, String(event.payment_id));
    } catch (err) {
      console.error('[nowpayments-webhook] fulfillOrder error:', err.message);
      return res.status(500).json({ error: 'Order fulfillment failed.' });
    }
  }

  return res.status(200).json({ received: true });
}
