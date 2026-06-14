/**
 * PayPal Checkout Button Component
 *
 * Flow:
 *  1. User clicks "PayPal" – we create an order in our DB + a PayPal order via the server.
 *  2. PayPal SDK renders the approval popup.
 *  3. After buyer approves, we capture the order server-side and trigger fulfillment.
 */
import { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';

export default function PayPalButton({ product, buyerEmail, onSuccess }) {
  const [{ isPending }] = usePayPalScriptReducer();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // Called when PayPal button is clicked – creates server-side order
  async function createOrder() {
    setError('');
    const res = await fetch('/api/payments/create-paypal-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, buyerEmail }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? 'Failed to create order. Please try again.');
      throw new Error(data.error);
    }

    return data.paypalOrderId;
  }

  // Called after buyer approves in the PayPal popup
  async function onApprove(data) {
    setProcessing(true);
    setError('');
    try {
      const res = await fetch('/api/payments/capture-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          orderId:       data.orderID, // server resolves by paypalOrderId
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? 'Payment capture failed. Please contact support.');
        return;
      }

      onSuccess?.();
    } catch {
      setError('An unexpected error occurred. Please contact support.');
    } finally {
      setProcessing(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-14 rounded-xl bg-gray-800 animate-pulse">
        <span className="text-sm text-gray-500">Loading PayPal…</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-400 mb-4">
        Click the button below to pay <strong className="text-white">${product.price_usd} USD</strong> via PayPal.
        You will be redirected to PayPal to complete the payment securely.
      </p>

      <PayPalButtons
        style={{ layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay' }}
        createOrder={createOrder}
        onApprove={onApprove}
        onError={(err) => {
          console.error('PayPal SDK error:', err);
          setError('PayPal encountered an error. Please try again or use a different payment method.');
        }}
        onCancel={() => setError('Payment was cancelled.')}
        disabled={processing}
      />

      {processing && (
        <div className="flex items-center justify-center gap-2 py-3 text-sm text-brand-400">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Finalising payment…
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}
