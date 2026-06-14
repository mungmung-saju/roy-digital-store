import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PayPalButton from '../../components/PayPalButton';
import USDTPayment from '../../components/USDTPayment';
import BrandLogo from '../../components/BrandLogo';

const TABS = [
  { id: 'paypal', label: 'PayPal',       icon: '💳' },
  { id: 'usdt',   label: 'USDT (TRC20)', icon: '💰' },
];

export async function getServerSideProps(context) {
  const { productId } = context.params;
  const qty = Math.max(1, parseInt(context.query.qty ?? '1', 10) || 1);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const res      = await fetch(`${baseUrl}/api/products`);
  const products = await res.json();
  const product  = products.find((p) => p.id === productId) ?? null;

  if (!product) return { notFound: true };

  return { props: { product, qty } };
}

export default function CheckoutPage({ product, qty }) {
  const router = useRouter();
  const [email, setEmail]               = useState('');
  const [emailError, setEmailError]     = useState('');
  const [activeTab, setActiveTab]       = useState('paypal');
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const unitPrice = Number(product.price_usd);
  const total     = (unitPrice * qty).toFixed(2);

  function validateEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function handleEmailConfirm() {
    if (!validateEmail(email)) { setEmailError('Please enter a valid email address.'); return; }
    setEmailError('');
    setEmailConfirmed(true);
  }

  return (
    <>
      <Head><title>Checkout – {product.name}</title></Head>

      <div className="page-bg min-h-screen py-12 px-4">
        <div className="max-w-lg mx-auto">

          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to store
          </Link>

          {/* Order summary */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Order Summary</p>
            <div className="flex items-start gap-4">
              <BrandLogo slug={product.slug} size={48} />
              <div className="flex-1 min-w-0">
                <h1 className="text-base font-bold text-white leading-snug">{product.name}</h1>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{product.description}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Unit Price</div>
                <div className="text-sm font-bold text-gray-300">${unitPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Qty</div>
                <div className="text-sm font-bold text-gray-300">{qty}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">Total</div>
                <div className="text-lg font-black text-white">${total}</div>
              </div>
            </div>

            {/* Warranty */}
            {product.warranty && (
              <div className="mt-4 flex items-center gap-1.5 text-[11px] text-emerald-400">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Includes {product.warranty.toLowerCase()}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Delivery Email *
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailConfirmed(false); }}
                className="input flex-1"
                disabled={emailConfirmed}
              />
              {!emailConfirmed ? (
                <button onClick={handleEmailConfirm} className="btn-gradient px-4 py-2.5 rounded-xl text-sm font-bold text-white shrink-0">
                  Confirm
                </button>
              ) : (
                <button onClick={() => setEmailConfirmed(false)} className="btn-outline px-4 py-2.5 rounded-xl text-sm shrink-0">
                  Edit
                </button>
              )}
            </div>
            {emailError && <p className="text-red-400 text-xs mt-2">{emailError}</p>}
            {emailConfirmed && (
              <p className="text-emerald-400 text-xs mt-2">
                ✓ Credentials will be sent to <strong>{email}</strong>
              </p>
            )}
          </div>

          {/* Payment */}
          {emailConfirmed && (
            <div className="glass-card rounded-2xl overflow-hidden mb-6">
              {/* Tabs */}
              <div className="flex border-b border-white/[0.06]">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-4 text-sm font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'text-indigo-400 border-b-2 border-indigo-500 -mb-px'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'paypal' ? (
                  <PayPalButton
                    product={{ ...product, price_usd: unitPrice * qty }}
                    buyerEmail={email}
                    onSuccess={() => router.push(`/success?method=paypal`)}
                  />
                ) : (
                  <USDTPayment
                    product={{ ...product, price_usd: unitPrice * qty }}
                    buyerEmail={email}
                  />
                )}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-700">
            🔒 Payments are processed securely. We never store your payment details.
          </p>
        </div>
      </div>
    </>
  );
}
