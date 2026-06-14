/**
 * Shared order fulfilment logic called by both PayPal and NOWPayments webhooks.
 */
import { supabaseAdmin } from './supabase';
import { decrypt } from './encryption';
import { sendOrderConfirmation } from './email';

/**
 * Mark an order as completed and email credentials to the buyer.
 *
 * @param {string} orderId     UUID of the order in the `orders` table
 * @param {string} [providerId]  Provider-side payment/capture ID for reconciliation
 */
export async function fulfillOrder(orderId, providerId) {
  // 1. Fetch the order (admin client bypasses RLS)
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (error || !order) {
    throw new Error(`Order ${orderId} not found: ${error?.message}`);
  }

  // Idempotency guard – don't re-deliver if already completed
  if (order.payment_status === 'completed') {
    console.log(`[fulfillOrder] Order ${orderId} already completed – skipping.`);
    return;
  }

  // 2. Update status to completed
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      payment_status:     'completed',
      provider_payment_id: providerId ?? null,
    })
    .eq('id', orderId);

  if (updateError) throw new Error(`Failed to update order: ${updateError.message}`);

  // 3. Decrypt credentials and email them
  const credentials = decrypt(order.account_credentials);

  await sendOrderConfirmation({
    to:          order.buyer_email,
    productName: order.product_name,
    credentials,
    orderId:     order.id,
  });

  console.log(`[fulfillOrder] Order ${orderId} fulfilled and email sent to ${order.buyer_email}`);
}
