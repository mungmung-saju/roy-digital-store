/**
 * Featured product catalog — 7 highlighted digital account subscriptions.
 *
 * `sold`     – displayed on the card (deterministic, not live).
 * `badge`    – 'Hot' | 'Best Seller'
 * `warranty` – shown inside the card warranty badge (matches product duration).
 *
 * Update price_usd, stock, and credentials fields to match your actual inventory.
 * When Supabase is connected, use the same `id` values in your SQL seed so that
 * checkout deep-links remain stable. See supabase/schema.sql.
 */
export const STATIC_PRODUCTS = [
  {
    id:          '00000000-0000-0000-0000-000000000005',
    slug:        'capcut-6mo-individual',
    name:        'CapCut Individual Pro – 6 Months',
    description: 'Full premium video editing suite with templates, effects & AI tools.',
    price_usd:   34.99,
    badge:       'Hot',
    warranty:    '6-Month Warranty',
    sold:        2847,
    stock:       30,
  },
  {
    id:          '00000000-0000-0000-0000-000000000006',
    slug:        'gemini-pro-12mo',
    name:        'Gemini Pro – 12 Months',
    description: 'Google Gemini Pro access for a full year — advanced multimodal AI.',
    price_usd:   12.99,
    badge:       'Best Seller',
    warranty:    '12-Month Warranty',
    sold:        4123,
    stock:       25,
  },
  {
    id:          '00000000-0000-0000-0000-000000000007',
    slug:        'gemini-ultra-12mo',
    name:        'Gemini Ultra – 12 Months',
    description: "Google's most capable AI model — Ultra tier, full year access.",
    price_usd:   239.99,
    badge:       'Hot',
    warranty:    '12-Month Warranty',
    sold:        1956,
    stock:       15,
  },
  {
    id:          '00000000-0000-0000-0000-000000000008',
    slug:        'youtube-premium-12mo',
    name:        'YouTube Premium – 12 Months',
    description: 'Ad-free streaming, background play & offline downloads for a full year.',
    price_usd:   79.99,
    badge:       'Best Seller',
    warranty:    '12-Month Warranty',
    sold:        4891,
    stock:       50,
  },
  {
    id:          '00000000-0000-0000-0000-000000000009',
    slug:        'canva-edu-pro-12mo',
    name:        'Canva Edu Pro – 12 Months',
    description: 'Premium templates, brand kit, Magic AI design tools — full year.',
    price_usd:   5.99,
    badge:       'Hot',
    warranty:    '12-Month Warranty',
    sold:        3204,
    stock:       35,
  },
  {
    id:          '00000000-0000-0000-0000-000000000011',
    slug:        'claude-max-20x-12mo',
    name:        'Claude Max 20x – 12 Months',
    description: 'Anthropic Claude Max with 20× usage limit — highest capacity, full year.',
    price_usd:   1650.99,
    badge:       'Hot',
    warranty:    '12-Month Warranty',
    sold:        1372,
    stock:       10,
  },
  {
    id:          '00000000-0000-0000-0000-000000000010',
    slug:        'claude-max-5x-12mo',
    name:        'Claude Max 5x – 12 Months',
    description: 'Anthropic Claude Max with 5× usage limit — great value, full year.',
    price_usd:   720.99,
    badge:       'Best Seller',
    warranty:    '12-Month Warranty',
    sold:        2651,
    stock:       20,
  },
];
