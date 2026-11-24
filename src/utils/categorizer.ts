import type { CategorySuggestion, GstRate } from '../types/billing.ts';

interface CategoryRule {
  category: string;
  hsnCode: string;
  gstRate: GstRate;
  keywords: string[];
  description: string;
}

export const HSN_CATEGORY_RULES: CategoryRule[] = [
  {
    category: 'IT Hardware & Computing',
    hsnCode: '8471',
    gstRate: 18,
    keywords: [
      'laptop',
      'desktop',
      'computer',
      'server',
      'ssd',
      'ram',
      'keyboard',
      'mouse',
      'workstation',
      'tablet',
      'macbook',
      'thinkpad',
    ],
    description: 'Automatic data processing machines & computing hardware (HSN 8471, 18% GST)',
  },
  {
    category: 'Monitors & Displays',
    hsnCode: '8528',
    gstRate: 18,
    keywords: ['monitor', 'display', 'led screen', 'projector', 'tv', 'panel'],
    description: 'Monitors, projectors & display units (HSN 8528, 18% GST)',
  },
  {
    category: 'Networking & Telecom',
    hsnCode: '8517',
    gstRate: 18,
    keywords: ['router', 'switch', 'modem', 'wifi', 'ethernet', 'access point', 'firewall', 'voip'],
    description: 'Networking & telecommunication equipment (HSN 8517, 18% GST)',
  },
  {
    category: 'Printers & Scanners',
    hsnCode: '8443',
    gstRate: 18,
    keywords: ['printer', 'scanner', 'toner', 'cartridge', 'photocopier', 'barcode', 'pos thermal'],
    description: 'Printing machinery, scanners & consumables (HSN 8443, 18% GST)',
  },
  {
    category: 'Office Furniture',
    hsnCode: '9403',
    gstRate: 18,
    keywords: ['chair', 'desk', 'table', 'cabinet', 'workstation', 'ergonomic', 'rack', 'shelf'],
    description: 'Commercial & office furniture (HSN 9403, 18% GST)',
  },
  {
    category: 'Paper & Stationery',
    hsnCode: '4820',
    gstRate: 12,
    keywords: ['notebook', 'register', 'ledger', 'diary', 'paper', 'a4', 'envelopes', 'folder', 'stationery'],
    description: 'Stationery, registers & paper products (HSN 4820, 12% GST)',
  },
  {
    category: 'Books & Educational Print',
    hsnCode: '4901',
    gstRate: 0,
    keywords: ['book', 'textbook', 'manual', 'printed book', 'journal', 'handbook'],
    description: 'Printed books & educational materials (HSN 4901, 0% Exempt)',
  },
  {
    category: 'Food Grains & Staples',
    hsnCode: '1006',
    gstRate: 5,
    keywords: ['rice', 'basmati', 'wheat', 'flour', 'atta', 'dal', 'pulses', 'tea', 'coffee', 'spice', 'turmeric'],
    description: 'Pre-packaged food staples, grains & spices (HSN 1006, 5% GST)',
  },
  {
    category: 'Apparel & Textiles',
    hsnCode: '6205',
    gstRate: 12,
    keywords: ['shirt', 'uniform', 'fabric', 'cotton', 'garment', 'apron', 'tshirt', 'textile'],
    description: 'Apparel & textile goods (HSN 6205, 12% GST)',
  },
  {
    category: 'Electrical & Power Backup',
    hsnCode: '8504',
    gstRate: 18,
    keywords: ['ups', 'inverter', 'transformer', 'adapter', 'charger', 'power supply', 'stabilizer'],
    description: 'Static converters, UPS & electrical transformers (HSN 8504, 18% GST)',
  },
  {
    category: 'Air Conditioning & Luxury Appliances',
    hsnCode: '8415',
    gstRate: 28,
    keywords: ['air conditioner', 'split ac', 'hvac', 'chiller', 'dishwasher'],
    description: 'Air conditioning machines & high-slab appliances (HSN 8415, 28% GST)',
  },
  {
    category: 'Software & IT Consulting (SAC)',
    hsnCode: '9983',
    gstRate: 18,
    keywords: ['software', 'license', 'amc', 'maintenance', 'consulting', 'subscription', 'installation', 'support'],
    description: 'IT & professional services (SAC 9983, 18% GST)',
  },
];

export function suggestProductCategorisation(
  name: string,
  description = ''
): CategorySuggestion {
  const haystack = `${name} ${description}`.toLowerCase().trim();

  if (!haystack) {
    return {
      category: 'General Merchandise',
      hsnCode: '9999',
      suggestedGstRate: 18,
      confidence: 0.4,
      matchedKeywords: [],
      explanation: 'No descriptive keywords entered yet; defaulting to standard 18% commercial slab.',
      advisoryOnly: true,
    };
  }

  let bestRule: CategoryRule | null = null;
  let bestMatches: string[] = [];

  for (const rule of HSN_CATEGORY_RULES) {
    const matches = rule.keywords.filter((kw) => haystack.includes(kw));
    if (matches.length > bestMatches.length) {
      bestMatches = matches;
      bestRule = rule;
    }
  }

  if (bestRule && bestMatches.length > 0) {
    const confidence = Math.min(0.98, 0.72 + bestMatches.length * 0.12);
    return {
      category: bestRule.category,
      hsnCode: bestRule.hsnCode,
      suggestedGstRate: bestRule.gstRate,
      confidence,
      matchedKeywords: bestMatches,
      explanation: `Matched keywords [${bestMatches.join(', ')}] -> ${bestRule.description}. Advisory suggestion only; confirm before saving.`,
      advisoryOnly: true,
    };
  }

  return {
    category: 'General Commercial Goods',
    hsnCode: '8543',
    suggestedGstRate: 18,
    confidence: 0.55,
    matchedKeywords: [],
    explanation: 'No specialized HSN keyword match found; suggested standard 18% GST slab for review.',
    advisoryOnly: true,
  };
}

export function getExpectedGstForHsn(hsnCode: string): GstRate | null {
  const prefix = hsnCode.trim().slice(0, 4);
  const found = HSN_CATEGORY_RULES.find((r) => r.hsnCode === prefix);
  return found ? found.gstRate : null;
}
