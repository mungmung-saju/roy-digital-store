import { useState } from 'react';
import BrandLogo from './BrandLogo';

// ── Brand accent colours (top border gradient) ────────────────────────────────
const BRAND_ACCENT = {
  claude:  ['#f59e0b', '#ea580c'],
  gemini:  ['#3b82f6', '#a855f7'],
  youtube: ['#ef4444', '#f97316'],
  capcut:  ['#94a3b8', '#e2e8f0'],
  canva:   ['#a855f7', '#6366f1'],
  default: ['#6366f1', '#4f46e5'],
};

function getBrand(slug = '') {
  if (slug.startsWith('claude'))  return 'claude';
  if (slug.startsWith('gemini'))  return 'gemini';
  if (slug.startsWith('youtube')) return 'youtube';
  if (slug.startsWith('capcut'))  return 'capcut';
  if (slug.startsWith('canva'))   return 'canva';
  return 'default';
}

// ── Badge definitions ─────────────────────────────────────────────────────────
const BADGE = {
  Hot: {
    text: '🔥 Hot',
    style: 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-900/40',
  },
  'Best Seller': {
    text: '⭐ Best Seller',
    style: 'bg-gradient-to-r from-violet-600 to-indigo-500 shadow-lg shadow-violet-900/40',
  },
};

// ── Qty stepper ───────────────────────────────────────────────────────────────
function QtySelector({ qty, onDec, onInc }) {
  return (
    <div className="flex items-center rounded-xl border border-white/10 overflow-hidden bg-white/[0.04]">
      <button
        onClick={onDec}
        aria-label="Decrease"
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors select-none text-lg leading-none"
      >
        −
      </button>
      <span className="w-9 text-center text-sm font-bold text-white border-x border-white/10 leading-8 h-8 select-none">
        {qty}
      </span>
      <button
        onClick={onInc}
        aria-label="Increase"
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors select-none text-lg leading-none"
      >
        +
      </button>
    </div>
  );
}

// ── ProductCard ───────────────────────────────────────────────────────────────
export default function ProductCard({ product }) {
  const { id, slug, name, description, price_usd, badge, stock, sold, warranty } = product;
  const [qty, setQty] = useState(1);

  const outOfStock = stock <= 0;
  const brand      = getBrand(slug);
  const [c1, c2]   = BRAND_ACCENT[brand] ?? BRAND_ACCENT.default;
  const badgeCfg   = BADGE[badge];
  const unitPrice  = Number(price_usd);
  const total      = (unitPrice * qty).toFixed(2);

  return (
    <div
      className={[
        'glass-card rounded-2xl flex flex-col relative overflow-hidden',
        outOfStock ? 'opacity-50 pointer-events-none' : '',
      ].join(' ')}
    >
      {/* ── Top accent line ── */}
      <div
        className="h-[2px] w-full shrink-0"
        style={{ background: `linear-gradient(90deg, ${c1}, ${c2})` }}
      />

      {/* ── Main body ── */}
      <div className="flex flex-col gap-[18px] p-5 flex-1">

        {/* Row 1 – Logo + badge */}
        <div className="flex items-start justify-between gap-2">
          <BrandLogo slug={slug} size={50} />

          {outOfStock ? (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-gray-700/80 text-gray-400 leading-none border border-white/10">
              Sold Out
            </span>
          ) : badgeCfg ? (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full text-white leading-none ${badgeCfg.style}`}>
              {badgeCfg.text}
            </span>
          ) : null}
        </div>

        {/* Row 2 – Title + description ── visual hierarchy step 1 */}
        <div>
          <h3 className="text-[15px] font-bold text-white leading-snug">{name}</h3>
          <p className="text-[12px] text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Row 3 – Price ── visual hierarchy step 2 */}
        <div className="flex items-end gap-2">
          <span className="text-[26px] font-black text-white leading-none">
            ${total}
          </span>
          {qty > 1 && (
            <span className="text-[11px] text-gray-500 mb-0.5 leading-none">
              ${unitPrice.toFixed(2)} × {qty}
            </span>
          )}
        </div>

        {/* Row 4 – Features: warranty + sold ── visual hierarchy step 3 */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Warranty badge — duration comes from the product data */}
          {warranty && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-emerald-500/12 text-emerald-400 border border-emerald-500/25 leading-none">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {warranty}
            </span>
          )}

          {/* Sold count */}
          {sold != null && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 leading-none">
              <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/>
              </svg>
              {sold.toLocaleString()} sold
            </span>
          )}
        </div>

        {/* ── Push footer to bottom ── */}
        <div className="flex-1" />

        {/* Row 5 – Qty selector ── visual hierarchy step 4 */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Qty
          </span>
          <QtySelector
            qty={qty}
            onDec={() => setQty((q) => Math.max(1, q - 1))}
            onInc={() => setQty((q) => q + 1)}
          />
        </div>

        {/* Row 6 – Buy Now ── visual hierarchy step 5 */}
        {outOfStock ? (
          <button
            disabled
            className="w-full py-3 rounded-xl text-sm font-bold bg-gray-800/60 text-gray-600 cursor-not-allowed"
          >
            Out of Stock
          </button>
        ) : (
          <a
            href="#payment-section"
            className="btn-gradient w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white"
          >
            Buy Now
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
