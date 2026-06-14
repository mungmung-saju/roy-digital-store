/**
 * GET /api/products
 *
 * Returns the public product list (no credentials).
 * Falls back to the static catalog in lib/products.js when Supabase
 * is not yet configured (missing env vars or connection error).
 */
import { STATIC_PRODUCTS } from '../../../lib/products';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  // Skip Supabase if the env vars are not set (local dev without DB)
  const supabaseConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT') &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY.includes('YOUR_');

  if (supabaseConfigured) {
    try {
      const { supabaseAdmin } = await import('../../../lib/supabase');
      const { data, error } = await supabaseAdmin
        .from('products')
        .select('id, slug, name, description, price_usd, badge, stock')
        .order('created_at', { ascending: true });

      if (!error && data?.length > 0) {
        return res.status(200).json(data);
      }
    } catch (err) {
      console.warn('[api/products] Supabase error, falling back to static data:', err.message);
    }
  }

  // Fallback: serve static product catalog
  return res.status(200).json(STATIC_PRODUCTS);
}
