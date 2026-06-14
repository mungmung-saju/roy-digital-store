import { useEffect, useState } from 'react';
import Head from 'next/head';
import ProductCard from '../components/ProductCard';
import { STATIC_PRODUCTS } from '../lib/products';

// ── Telegram floating button ──────────────────────────────────────────────────
function TelegramButton() {
  return (
    <a
      href="https://t.me/roy123456777"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Telegram Support"
      className="tg-ping fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl text-white text-sm font-bold select-none"
      style={{
        background: 'linear-gradient(135deg, #0088cc 0%, #00aff0 100%)',
        boxShadow: '0 8px 24px rgba(0, 136, 204, 0.55)',
      }}
    >
      {/* Telegram paper-plane icon */}
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
      TG Support
    </a>
  );
}

// ── Trust pill ────────────────────────────────────────────────────────────────
function TrustPill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] text-sm text-gray-400">
      <span>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// ── Stat block ────────────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-black text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
      <div className="h-[2px] bg-gray-700" />
      <div className="p-5 space-y-4">
        <div className="flex justify-between">
          <div className="w-12 h-12 rounded-xl bg-gray-800" />
          <div className="w-20 h-6 rounded-full bg-gray-800" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded w-3/4" />
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
        </div>
        <div className="h-px bg-gray-800" />
        <div className="h-8 bg-gray-800 rounded w-1/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-800 rounded w-32" />
          <div className="h-6 bg-gray-800 rounded w-20" />
        </div>
        <div className="h-10 bg-gray-800 rounded-xl" />
        <div className="h-11 bg-gray-800 rounded-xl" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StorePage() {
  // Initialise directly from the static catalog so cards are always visible.
  // A background fetch silently upgrades to live Supabase data when available.
  const [products, setProducts] = useState(STATIC_PRODUCTS);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((r) => { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then((data) => { if (Array.isArray(data) && data.length > 0) setProducts(data); })
      .catch(() => {}); // silently keep static products on any error
  }, []);

  return (
    <>
      <Head>
        <title>Digital Product Store — Premium AI &amp; Media Accounts</title>
        <meta name="description" content="Buy Claude, Gemini, YouTube Premium, CapCut & Canva Pro accounts. Pay with PayPal or USDT — fast delivery to your inbox." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ── Full-page background ── */}
      <div className="page-bg min-h-screen relative">

        {/* ── Header / Nav ─────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-40 border-b border-white/[0.06] backdrop-blur-xl bg-black/30">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
                style={{ background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}
              >
                D
              </div>
              <span className="font-bold text-white text-sm tracking-tight">Roy DigitalStore</span>
            </div>
            <a
              href="https://t.me/roy123456777"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Support
            </a>
          </div>
        </nav>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden pt-20 pb-16 px-6 text-center">
          {/* Glow disc behind text */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
          />

          <div className="relative max-w-3xl mx-auto">
            {/* Top pill */}
            <span
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border"
              style={{
                background: 'rgba(99,102,241,0.12)',
                borderColor: 'rgba(99,102,241,0.3)',
                color: '#a5b4fc',
              }}
            >
              ⚡ Fast Delivery — credentials sent within minutes
            </span>

            {/* Main heading */}
            <h1
              className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-none"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Premium Digital<br />Accounts Store
            </h1>

            <p className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed">
              Claude, Gemini, YouTube Premium, CapCut &amp; Canva — pay with{' '}
              <span className="text-gray-300 font-medium">PayPal</span> or{' '}
              <span className="text-gray-300 font-medium">USDT (TRC20)</span>.
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap justify-center gap-2.5">
              <TrustPill icon="🔒" label="Secure Payments" />
              <TrustPill icon="📧" label="Email Delivery" />
              <TrustPill icon="💬" label="24/7 TG Support" />
            </div>
          </div>
        </header>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 mb-16">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 px-8 rounded-2xl border border-white/[0.07]"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <Stat value="20,000+" label="Orders Delivered" />
            <Stat value="98.7%"   label="Satisfaction Rate" />
            <Stat value="< 5 min" label="Avg. Delivery Time" />
            <Stat value="24/7"    label="Customer Support" />
          </div>
        </div>

        {/* ── Products section ──────────────────────────────────────────────── */}
        <main className="max-w-7xl mx-auto px-6 pb-20">
          {/* Section header */}
          <div className="mb-10">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-1">
              Featured Products
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              🔥 Hot Digital Subscriptions
            </h2>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(7)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-panel rounded-2xl py-24 text-center">
              <p className="text-gray-500">No products available right now. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>

        {/* ── Trust / Feature bar ───────────────────────────────────────────── */}
        <section className="border-t border-white/[0.06]" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="max-w-5xl mx-auto px-6 py-12 grid sm:grid-cols-3 gap-8 text-center">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                ),
                title: 'Secure Payments',
                desc: 'PayPal buyer protection & USDT TRC20 — your funds are always safe.',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                ),
                title: 'Fast Delivery',
                desc: 'Credentials delivered to your inbox shortly after payment is confirmed.',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                ),
                title: '24/7 TG Support',
                desc: 'Instant help via Telegram — reply to your order email or message us directly.',
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {item.icon}
                </div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="text-center text-xs text-gray-700 py-8 border-t border-white/[0.04]">
          © {new Date().getFullYear()} Digital Product Store. All rights reserved.
          &nbsp;·&nbsp;
          <a
            href="https://t.me/roy123456777"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-500 transition-colors"
          >
            Telegram Support
          </a>
        </footer>
      </div>

      {/* ── Telegram floating button (always visible) ── */}
      <TelegramButton />
    </>
  );
}
