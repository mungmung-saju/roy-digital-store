/**
 * POST /api/payments/create-paypal-order
 *
 * Creates a pending order in the database, then creates a PayPal order via
 * the REST API. The PayPal order ID is returned so the client can render the
 * PayPal button to approve the payment.
 *
 * Body: { productId, buyerEmail }
 */
import { supabaseAdmin } from '../../../lib/supabase';
import { createPayPalOrder } from '../../../lib/paypal';
import { encrypt } from '../../../lib/encryption';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { productId, buyerEmail } = req.body ?? {};

  if (!productId || !buyerEmail) {
    return res.status(400).json({ error: 'productId and buyerEmail are required.' });
  }

  // 1. Fetch product from DB
  const { data: product, error: productError } = await supabaseAdmin
    .from('products')
    .select('id, name, price_usd, credentials, stock')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  if (product.stock <= 0) {
    return res.status(409).json({ error: 'Product is out of stock.' });
  }

  // 2. Create a pending order in Supabase
  // Credentials are already stored encrypted in the products table.
  // We copy them to the order so each order has its own snapshot.
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      product_name:        product.name,
      buyer_email:         buyerEmail,
      payment_method:      'paypal',
      payment_status:      'pending',
      account_credentials: product.credentials, // encrypted at rest
      amount_usd:          product.price_usd,
    })
    .select()
    .single();

  if (orderError) {
    console.error('[create-paypal-order]', orderError);
    return res.status(500).json({ error: 'Failed to create order.' });
  }

  // 3. Create PayPal order
  try {
    const paypalOrder = await createPayPalOrder({
      amountUSD:   product.price_usd,
      orderId:     order.id,
      productName: product.name,
    });

    // Store the PayPal order ID for later reconciliation
    await supabaseAdmin
      .from('orders')
      .update({ provider_order_id: paypalOrder.id })
      .eq('id', order.id);

    return res.status(200).json({
      paypalOrderId: paypalOrder.id,
      orderId:       order.id,
    });
  } catch (err) {
    console.error('[create-paypal-order] PayPal error:', err.response?.data ?? err.message);
    return res.status(500).json({ error: 'Failed to create PayPal order.' });
  }
}
