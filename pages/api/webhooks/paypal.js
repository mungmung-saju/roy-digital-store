/**
 * POST /api/webhooks/paypal
 *
 * PayPal sends webhook events here. We:
 *  1. Verify the signature via PayPal's API (prevents spoofing).
 *  2. On PAYMENT.CAPTURE.COMPLETED, fulfill the matching order.
 *
 * IMPORTANT: bodyParser must be disabled so we can read the raw body
 * needed for PayPal's signature verification.
 */
import { buffer } from 'micro';
import { verifyPayPalWebhook } from '../../../lib/paypal';
import { fulfillOrder } from '../../../lib/orders';
import { supabaseAdmin } from '../../../lib/supabase';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  // 1. Read raw body (needed for signature verification)
  const rawBody = (await buffer(req)).toString('utf8');
  const headers = req.headers;

  // 2. Verify PayPal webhook signature
  let verified = false;
  try {
    verified = await verifyPayPalWebhook(headers, rawBody);
  } catch (err) {
    console.error('[paypal-webhook] Signature verification error:', err.message);
    return res.status(500).json({ error: 'Signature verification failed.' });
  }

  if (!verified) {
    console.warn('[paypal-webhook] Invalid signature – request rejected.');
    return res.status(401).json({ error: 'Invalid signature.' });
  }

  // 3. Parse and handle the event
  const event = JSON.parse(rawBody);
  console.log(`[paypal-webhook] Event received: ${event.event_type}`);

  if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
    const capture = event.resource;
    // The reference_id on the purchase unit holds our internal order UUID
    const referenceId = capture?.supplementary_data?.related_ids?.order_id
      ?? event.resource?.supplementary_data?.related_ids?.order_id;

    // Alternatively look up by provider_order_id (PayPal order ID)
    const paypalOrderId = event.resource?.id;

    try {
      // Find our order by the PayPal order ID stored at creation time
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('provider_order_id', paypalOrderId)
        .single();

      if (!order) {
        console.warn(`[paypal-webhook] No order found for PayPal order ${paypalOrderId}`);
        return res.status(200).end(); // Acknowledge – not our order
      }

      await fulfillOrder(order.id, capture.id);
    } catch (err) {
      console.error('[paypal-webhook] fulfillOrder error:', err.message);
      return res.status(500).json({ error: 'Order fulfillment failed.' });
    }
  }

  // Always respond 200 to acknowledge receipt
  return res.status(200).json({ received: true });
}
