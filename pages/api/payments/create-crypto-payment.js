/**
 * POST /api/payments/create-crypto-payment
 *
 * Creates a pending order in the DB, then creates a NOWPayments invoice
 * for USDT (TRC20). Returns the payment URL and amount so the frontend
 * can display the crypto payment UI.
 *
 * Body: { productId, buyerEmail }
 */
import axios from 'axios';
import { supabaseAdmin } from '../../../lib/supabase';

const NP_API = 'https://api.nowpayments.io/v1';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { productId, buyerEmail } = req.body ?? {};
  if (!productId || !buyerEmail) {
    return res.status(400).json({ error: 'productId and buyerEmail are required.' });
  }

  // 1. Fetch product
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

  // 2. Create pending order in Supabase
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      product_name:        product.name,
      buyer_email:         buyerEmail,
      payment_method:      'usdt',
      payment_status:      'pending',
      account_credentials: product.credentials,
      amount_usd:          product.price_usd,
    })
    .select()
    .single();

  if (orderError) {
    console.error('[create-crypto-payment]', orderError);
    return res.status(500).json({ error: 'Failed to create order.' });
  }

  // 3. Create NOWPayments payment
  try {
    const { data: payment } = await axios.post(
      `${NP_API}/payment`,
      {
        price_amount:      product.price_usd,
        price_currency:    'usd',
        pay_currency:      'usdttrc20',
        order_id:          order.id,          // echoed back in the webhook
        order_description: product.name,
        ipn_callback_url:  process.env.NOWPAYMENTS_CALLBACK_URL,
        success_url:       `${process.env.NEXT_PUBLIC_APP_URL}/success?orderId=${order.id}`,
        cancel_url:        `${process.env.NEXT_PUBLIC_APP_URL}/`,
      },
      { headers: { 'x-api-key': process.env.NOWPAYMENTS_API_KEY } },
    );

    // Persist the NOWPayments payment ID
    await supabaseAdmin
      .from('orders')
      .update({ provider_order_id: String(payment.payment_id) })
      .eq('id', order.id);

    return res.status(200).json({
      orderId:        order.id,
      paymentId:      payment.payment_id,
      payAddress:     payment.pay_address,
      payAmount:      payment.pay_amount,
      payCurrency:    payment.pay_currency,
      expirationTime: payment.expiration_estimate_date,
    });
  } catch (err) {
    console.error('[create-crypto-payment] NOWPayments error:', err.response?.data ?? err.message);
    return res.status(500).json({ error: 'Failed to create crypto payment.' });
  }
}
