// Open Food Facts API — free, no key required
// https://world.openfoodfacts.org

const BASE = 'https://world.openfoodfacts.org/cgi/search.pl';
const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';

export async function searchFood(query, page = 1) {
  try {
    const params = new URLSearchParams({
      action: 'process',
      json: '1',
      search_terms: query,
      page_size: '20',
      page: String(page),
      fields: 'code,product_name,brands,nutriments,serving_size,serving_quantity,image_front_thumb_url',
    });
    const res = await fetch(`${BASE}?${params}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return (data.products || [])
      .filter(p => p.product_name?.trim())
      .map(normaliseProduct);
  } catch (e) {
    console.error('[Ritual] Food search error:', e);
    return [];
  }
}

export async function getProductByBarcode(barcode) {
  try {
    const res = await fetch(`${PRODUCT_URL}/${barcode}.json?fields=code,product_name,brands,nutriments,serving_size,serving_quantity,image_front_thumb_url`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1) return null;
    return normaliseProduct(data.product);
  } catch (e) {
    console.error('[Ritual] Barcode lookup error:', e);
    return null;
  }
}

function normaliseProduct(p) {
  const n = p.nutriments || {};
  // Prefer per-serving values if available; fall back to per-100g
  const perServing = p.serving_quantity ? (p.serving_quantity / 100) : 1;
  return {
    id:          p.code || `ff_${Math.random().toString(36).slice(2)}`,
    name:        p.product_name?.trim() || 'Unknown',
    brand:       p.brands?.split(',')[0]?.trim() || '',
    image:       p.image_front_thumb_url || null,
    servingSize: p.serving_size || '100g',
    servingQty:  p.serving_quantity || 100,
    // per 100g values (multiply by servingQty/100 to get per-serving)
    per100g: {
      calories: Math.round(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
      protein:  round1(n.proteins_100g   || 0),
      carbs:    round1(n.carbohydrates_100g || 0),
      fat:      round1(n.fat_100g        || 0),
      fiber:    round1(n.fiber_100g      || 0),
      sugar:    round1(n.sugars_100g     || 0),
      sodium:   round1(n.sodium_100g     || 0),
    },
    // convenience: per-serving values
    calories: Math.round((n['energy-kcal_100g'] || 0) * perServing),
    protein:  round1((n.proteins_100g   || 0) * perServing),
    carbs:    round1((n.carbohydrates_100g || 0) * perServing),
    fat:      round1((n.fat_100g        || 0) * perServing),
  };
}

function round1(n) { return Math.round(n * 10) / 10; }

// ── Common foods fallback (shown when search is empty) ────────────────────────
export const COMMON_FOODS = [
  { id: 'cf1',  name: 'Chicken breast (cooked)', brand: '', servingSize: '100g', servingQty: 100, calories: 165, protein: 31, carbs: 0,  fat: 3.6, per100g: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 0.07 } },
  { id: 'cf2',  name: 'Brown rice (cooked)',      brand: '', servingSize: '100g', servingQty: 100, calories: 112, protein: 2.6, carbs: 24, fat: 0.9, per100g: { calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8, sugar: 0.4, sodium: 0.001 } },
  { id: 'cf3',  name: 'Whole egg',                brand: '', servingSize: '1 large (50g)', servingQty: 50, calories: 78, protein: 6, carbs: 0.6, fat: 5, per100g: { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sugar: 1.1, sodium: 0.12 } },
  { id: 'cf4',  name: 'Oats (dry)',               brand: '', servingSize: '40g', servingQty: 40, calories: 148, protein: 5.5, carbs: 25, fat: 2.7, per100g: { calories: 371, protein: 13, carbs: 63, fat: 6.9, fiber: 10, sugar: 1, sodium: 0.002 } },
  { id: 'cf5',  name: 'Banana',                   brand: '', servingSize: '1 medium (118g)', servingQty: 118, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, per100g: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 0.001 } },
  { id: 'cf6',  name: 'Greek yogurt (plain)',     brand: '', servingSize: '170g', servingQty: 170, calories: 100, protein: 17, carbs: 6,  fat: 0.7, per100g: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sugar: 3.2, sodium: 0.036 } },
  { id: 'cf7',  name: 'Almonds',                  brand: '', servingSize: '28g (1oz)', servingQty: 28, calories: 164, protein: 6, carbs: 6, fat: 14, per100g: { calories: 579, protein: 21, carbs: 22, fat: 50, fiber: 12.5, sugar: 4.4, sodium: 0.001 } },
  { id: 'cf8',  name: 'Salmon (cooked)',          brand: '', servingSize: '100g', servingQty: 100, calories: 208, protein: 20, carbs: 0, fat: 13, per100g: { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 0.059 } },
  { id: 'cf9',  name: 'Sweet potato (cooked)',    brand: '', servingSize: '100g', servingQty: 100, calories: 86,  protein: 1.6, carbs: 20, fat: 0.1, per100g: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3.3, sugar: 4.2, sodium: 0.036 } },
  { id: 'cf10', name: 'Broccoli (cooked)',        brand: '', servingSize: '100g', servingQty: 100, calories: 35,  protein: 2.4, carbs: 7.2, fat: 0.4, per100g: { calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, fiber: 3.3, sugar: 1.7, sodium: 0.04 } },
  { id: 'cf11', name: 'Whole milk',               brand: '', servingSize: '240ml', servingQty: 240, calories: 149, protein: 8, carbs: 12, fat: 8, per100g: { calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1, sodium: 0.043 } },
  { id: 'cf12', name: 'Bread (wholegrain)',       brand: '', servingSize: '1 slice (30g)', servingQty: 30, calories: 75, protein: 3.8, carbs: 14, fat: 1.1, per100g: { calories: 250, protein: 13, carbs: 46, fat: 3.8, fiber: 6.8, sugar: 4, sodium: 0.4 } },
];
