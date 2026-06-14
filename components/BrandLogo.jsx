/**
 * BrandLogo – inline SVG logos for each product brand.
 * All logos use path-based SVG so no external requests are needed.
 * useId() ensures gradient IDs are unique per component instance (React 18+).
 */
import { useId } from 'react';

// ── YouTube ────────────────────────────────────────────────────────────────────
function YouTubeLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill="#FF0000" />
      {/* White play triangle, horizontally offset slightly right for visual balance */}
      <path d="M21 16 L21 36 L39 26 Z" fill="white" />
    </svg>
  );
}

// ── Gemini ─────────────────────────────────────────────────────────────────────
function GeminiLogo({ size }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill="#1B1F3B" />
      <defs>
        <linearGradient id={`${uid}h`} x1="8" y1="26" x2="44" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#4285F4" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id={`${uid}v`} x1="26" y1="8" x2="26" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#34A853" />
          <stop offset="100%" stopColor="#4285F4" />
        </linearGradient>
        <linearGradient id={`${uid}f`} x1="8" y1="8" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#4285F4" />
          <stop offset="40%"  stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {/* 4-pointed Gemini sparkle star */}
      <path
        d="M26 9 L27.6 24.4 L43 26 L27.6 27.6 L26 43 L24.4 27.6 L9 26 L24.4 24.4 Z"
        fill={`url(#${uid}f)`}
      />
    </svg>
  );
}

// ── CapCut ─────────────────────────────────────────────────────────────────────
function CapCutLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill="#000000" />
      {/* Scissors icon: two handle circles + two crossing blades */}
      <circle cx="15" cy="17" r="5" stroke="white" strokeWidth="2.5" fill="none" />
      <circle cx="15" cy="35" r="5" stroke="white" strokeWidth="2.5" fill="none" />
      {/* Blade going upper-right */}
      <line x1="19.5" y1="19.5" x2="40" y2="33" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Blade going lower-right */}
      <line x1="19.5" y1="32.5" x2="40" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Small pivot circle at crossing */}
      <circle cx="28" cy="26" r="2" fill="#444" />
    </svg>
  );
}

// ── Canva ──────────────────────────────────────────────────────────────────────
function CanvaLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill="#7C3AED" />
      {/*
        The Canva "C":  a near-full arc of a circle (r=13, center at 24,26),
        open on the right side (roughly 45° gap top and bottom).
        Arc from ~315° back around to ~45° the long way.
        SVG arc: M start_x start_y A rx ry x-rot large-arc sweep end_x end_y
      */}
      <path
        d="M 33.2 14.8 A 13 13 0 1 0 33.2 37.2"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// ── Claude / Anthropic ─────────────────────────────────────────────────────────
function ClaudeLogo({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect width="52" height="52" rx="12" fill="#C96A2B" />
      {/*
        Anthropic-style "A": two slanted legs meeting at a peak, with a crossbar.
        Legs: left from (13,38) to (26,14), right from (26,14) to (39,38).
        Crossbar: (18,29) to (34,29)  — at roughly 60% down the height.
        Using rounded joins for a softer, modern look.
      */}
      <path
        d="M13 38 L26 14 L39 38"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="18.5"
        y1="29"
        x2="33.5"
        y2="29"
        stroke="white"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Router ─────────────────────────────────────────────────────────────────────
function getBrand(slug = '') {
  if (slug.startsWith('claude'))   return 'claude';
  if (slug.startsWith('gemini'))   return 'gemini';
  if (slug.startsWith('youtube'))  return 'youtube';
  if (slug.startsWith('capcut'))   return 'capcut';
  if (slug.startsWith('canva'))    return 'canva';
  return 'default';
}

const BRAND_BG = {
  claude:  'bg-[#C96A2B]/20',
  gemini:  'bg-[#1B1F3B]',
  youtube: 'bg-[#FF0000]/20',
  capcut:  'bg-black/60',
  canva:   'bg-[#7C3AED]/20',
  default: 'bg-gray-700',
};

export default function BrandLogo({ slug, size = 52 }) {
  const brand = getBrand(slug);

  return (
    <div className={`inline-flex items-center justify-center rounded-xl ${BRAND_BG[brand]}`}>
      {brand === 'youtube' && <YouTubeLogo size={size} />}
      {brand === 'gemini'  && <GeminiLogo  size={size} />}
      {brand === 'capcut'  && <CapCutLogo  size={size} />}
      {brand === 'canva'   && <CanvaLogo   size={size} />}
      {brand === 'claude'  && <ClaudeLogo  size={size} />}
      {brand === 'default' && (
        <div
          style={{ width: size, height: size }}
          className="rounded-xl bg-gray-700 flex items-center justify-center text-2xl"
        >
          📦
        </div>
      )}
    </div>
  );
}
