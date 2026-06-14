/**
 * USDT (TRC20) Payment Component
 *
 * Flow:
 *  1. User clicks "Generate Payment Address" – server calls NOWPayments API.
 *  2. We display the USDT wallet address + exact amount to send.
 *  3. NOWPayments posts a webhook when payment is confirmed; the webhook
 *     handler fulfills the order and emails credentials automatically.
 */
import { useState, useEffect, useCallback } from 'react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                 bg-gray-700 hover:bg-gray-600 text-gray-300"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

function Countdown({ expirationTime }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    if (!expirationTime) return;
    const target = new Date(expirationTime).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const m = String(Math.floor(diff / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setRemaining(`${m}:${s}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expirationTime]);

  if (!remaining) return null;
  return (
    <p className="text-xs text-amber-400 mt-2">
      ⏱ Payment address expires in <strong>{remaining}</strong>
    </p>
  );
}

export default function USDTPayment({ product, buyerEmail }) {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePayment = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/payments/create-crypto-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, buyerEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to create payment. Please try again.');
        return;
      }
      setPayment(data);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [product.id, buyerEmail]);

  if (!payment) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-amber-300">
          <strong>Important:</strong> You will send exactly the amount shown to the provided USDT TRC20 address.
          Sending a different amount or using a different network (e.g. ERC20) will result in a failed payment.
        </div>

        <p className="text-sm text-gray-400">
          Total to pay: <strong className="text-white">${product.price_usd} USD</strong> in USDT (TRC20)
        </p>

        <button
          onClick={generatePayment}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating address…
            </>
          ) : (
            '💰 Generate USDT Payment Address'
          )}
        </button>

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-4 text-sm text-green-300">
        ✅ Payment address generated! Send exactly the amount below to the address shown.
        Your credentials will be emailed automatically once the payment is confirmed.
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-1.5">
          Amount to Send
        </label>
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
          <span className="font-mono font-bold text-white text-lg flex-1">
            {payment.payAmount} {payment.payCurrency?.toUpperCase()}
          </span>
          <CopyButton text={String(payment.payAmount)} />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 block mb-1.5">
          USDT TRC20 Address
        </label>
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
          <span className="font-mono text-sm text-green-300 flex-1 break-all">
            {payment.payAddress}
          </span>
          <CopyButton text={payment.payAddress} />
        </div>
        <Countdown expirationTime={payment.expirationTime} />
      </div>

      {/* Warning */}
      <div className="rounded-xl bg-gray-800 border border-gray-700 p-4 text-xs text-gray-400 space-y-1">
        <p>⚠️ Only send <strong className="text-white">USDT on the TRC20 network</strong> to this address.</p>
        <p>⚠️ Send the <strong className="text-white">exact amount</strong> — partial payments are not processed automatically.</p>
        <p>⚠️ Do <strong className="text-white">not</strong> close this page until you have sent the funds.</p>
      </div>

      <p className="text-xs text-gray-600 text-center">
        Order ID: <span className="font-mono">{payment.orderId}</span>
      </p>
    </div>
  );
}
