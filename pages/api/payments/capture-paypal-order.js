/**
 * POST /api/payments/capture-paypal-order
 *
 * Called by the client after the buyer approves the PayPal payment.
 * Captures the payment and triggers order fulfillment.
 *
 * Body: { paypalOrderId, orderId }
 */
import { capturePayPalOrder } from '../../../lib/paypal';
import { fulfillOrder } from '../../../lib/orders';
import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { paypalOrderId, orderId } = req.body ?? {};
  if (!paypalOrderId || !orderId) {
    return res.status(400).json({ error: 'paypalOrderId and orderId are required.' });
  }

  try {
    const capture = await capturePayPalOrder(paypalOrderId);

    if (capture.status !== 'COMPLETED') {
      return res.status(402).json({ error: `Payment not completed. Status: ${capture.status}` });
    }

    await fulfillOrder(orderId, capture.id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[capture-paypal-order]', err.response?.data ?? err.message);
    return res.status(500).json({ error: 'Failed to capture payment.' });
  }
}
