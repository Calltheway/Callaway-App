export type Category = 'all' | 'mens' | 'womens' | 'streetwear' | 'luxury' | 'outerwear' | 'accessories';
export type Gender = 'men' | 'women' | 'unisex';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: Category;
  gender: Gender;
  description: string;
  details: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  images: string[];
  badges: ('new' | 'hot' | 'sale')[];
  rating: number;
  reviews: number;
  featured: boolean;
  trending: boolean;
  aiTags: string[];
}

export const products: Product[] = [
  // ── LUXURY ──────────────────────────────────────────────────────────────────
  {
    id: 'lux-001',
    name: 'Onyx Tailored Blazer',
    brand: 'LUMIS Collection',
    price: 895,
    category: 'luxury',
    gender: 'men',
    description: 'A masterpiece of precision tailoring. Hand-stitched lapels, ultra-fine Italian wool, and a silhouette refined over 300 hours of craft.',
    details: ['100% Italian Merino Wool', 'Hand-stitched lapels', 'Bemberg silk lining', 'Two-button fastening', 'Dry clean only'],
    colors: [{ name: 'Onyx', hex: '#1a1a2e' }, { name: 'Charcoal', hex: '#374151' }, { name: 'Navy', hex: '#1e3a5f' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4b2d5f?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['new'],
    rating: 4.9, reviews: 127, featured: true, trending: true,
    aiTags: ['formal', 'tailored', 'luxury', 'office', 'event'],
  },
  {
    id: 'lux-002',
    name: 'Aurora Silk Evening Gown',
    brand: 'LUMIS Atelier',
    price: 1250,
    originalPrice: 1650,
    category: 'luxury',
    gender: 'women',
    description: 'Liquid silk that moves like light. Floor-length silhouette with a dramatic open back and hand-sewn crystal accents along the neckline.',
    details: ['100% Mulberry Silk', 'Hand-sewn crystal accents', 'Floor length', 'Open back design', 'Dry clean only'],
    colors: [{ name: 'Midnight', hex: '#0f0f23' }, { name: 'Ivory', hex: '#f5f0e8' }, { name: 'Deep Ruby', hex: '#8b1a3a' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9ac6b59c6b59?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['sale'],
    rating: 4.8, reviews: 89, featured: true, trending: false,
    aiTags: ['evening', 'gown', 'luxury', 'silk', 'formal', 'wedding'],
  },
  {
    id: 'lux-003',
    name: 'Obsidian Leather Trench',
    brand: 'LUMIS Collection',
    price: 1890,
    category: 'luxury',
    gender: 'unisex',
    description: 'Full-grain Italian leather sculpted into a commanding statement. Weather-resistant, butter-soft, and built to last a lifetime.',
    details: ['Full-grain Italian leather', 'Quilted silk lining', 'YKK hardware', 'Water-resistant finish', 'Leather clean only'],
    colors: [{ name: 'Obsidian', hex: '#0a0a0a' }, { name: 'Cognac', hex: '#8b4513' }, { name: 'Forest', hex: '#2d4a2d' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['hot'],
    rating: 4.9, reviews: 214, featured: true, trending: true,
    aiTags: ['leather', 'trench', 'coat', 'luxury', 'unisex', 'statement'],
  },

  // ── WOMENS ──────────────────────────────────────────────────────────────────
  {
    id: 'wmn-001',
    name: 'Celestial Wrap Dress',
    brand: 'LUMIS Studio',
    price: 285,
    category: 'womens',
    gender: 'women',
    description: 'A wrap silhouette that flatters every body. Crafted from deadstock crepe fabric with an adjustable tie for a custom fit.',
    details: ['95% Recycled crepe', '5% Elastane', 'Adjustable tie waist', 'V-neckline', 'Machine wash cold'],
    colors: [{ name: 'Nebula Blue', hex: '#3b4d8a' }, { name: 'Dusty Rose', hex: '#c5a1a1' }, { name: 'Forest', hex: '#2d5a45' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1568252154048-4a1aa9f6c745?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['new'],
    rating: 4.7, reviews: 342, featured: false, trending: true,
    aiTags: ['dress', 'wrap', 'casual', 'feminine', 'versatile'],
  },
  {
    id: 'wmn-002',
    name: 'Prism Structured Blazer',
    brand: 'LUMIS Studio',
    price: 445,
    originalPrice: 560,
    category: 'womens',
    gender: 'women',
    description: 'Power dressing redefined. Architectural shoulders, nipped waist, and a slightly oversized cut that commands every room.',
    details: ['80% Wool, 20% Polyester', 'Structured shoulders', 'Single-button closure', 'Welt pockets', 'Dry clean only'],
    colors: [{ name: 'Ivory', hex: '#f5f0e8' }, { name: 'Power Black', hex: '#111111' }, { name: 'Sage', hex: '#8aaf8a' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1596285508507-ec15b2f6c64f?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603400521630-9f2de124b33b?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['sale'],
    rating: 4.8, reviews: 198, featured: false, trending: false,
    aiTags: ['blazer', 'power', 'work', 'formal', 'structured'],
  },
  {
    id: 'wmn-003',
    name: 'Mirage Asymmetric Top',
    brand: 'LUMIS Studio',
    price: 165,
    category: 'womens',
    gender: 'women',
    description: 'A fluid asymmetric drape in organic silk-blend jersey. Pairs effortlessly from coffee to cocktails.',
    details: ['70% Silk, 30% Modal', 'Asymmetric hem', 'One-shoulder design', 'Hand wash', 'True to size'],
    colors: [{ name: 'Champagne', hex: '#c5a55a' }, { name: 'Storm', hex: '#6b7a8d' }, { name: 'Cream', hex: '#f2ede4' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=750&fit=crop&q=80',
    ],
    badges: [],
    rating: 4.6, reviews: 156, featured: false, trending: true,
    aiTags: ['top', 'asymmetric', 'casual', 'elegant', 'evening'],
  },

  // ── MENS ─────────────────────────────────────────────────────────────────────
  {
    id: 'men-001',
    name: 'Phantom Oxford Shirt',
    brand: 'LUMIS Essentials',
    price: 195,
    category: 'mens',
    gender: 'men',
    description: 'Zero-iron Egyptian cotton with a subtle two-tone weave. The dress shirt that outperforms expectations all day, every day.',
    details: ['100% Egyptian Cotton', '2-ply poplin weave', 'Mother-of-pearl buttons', 'Machine washable', 'Easy iron finish'],
    colors: [{ name: 'Arctic White', hex: '#f8f9fa' }, { name: 'Blueprint', hex: '#1a3a5c' }, { name: 'Slate', hex: '#708090' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['new'],
    rating: 4.7, reviews: 389, featured: false, trending: false,
    aiTags: ['shirt', 'oxford', 'formal', 'business', 'classic'],
  },
  {
    id: 'men-002',
    name: 'Nexus Slim Chinos',
    brand: 'LUMIS Essentials',
    price: 175,
    originalPrice: 220,
    category: 'mens',
    gender: 'men',
    description: 'Engineered with 4-way stretch technology and a tailored slim fit. The only chinos you\'ll ever need.',
    details: ['98% Cotton, 2% Elastane', '4-way stretch', 'Slim straight fit', 'YKK zip', 'Machine wash cold'],
    colors: [{ name: 'Ecru', hex: '#c8b89a' }, { name: 'Olive', hex: '#5a6b40' }, { name: 'Midnight Navy', hex: '#1e2d4f' }],
    sizes: ['28', '30', '32', '34', '36', '38'],
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['sale'],
    rating: 4.6, reviews: 521, featured: false, trending: false,
    aiTags: ['chinos', 'pants', 'casual', 'business casual', 'slim'],
  },
  {
    id: 'men-003',
    name: 'Atlas Merino Crewneck',
    brand: 'LUMIS Essentials',
    price: 225,
    category: 'mens',
    gender: 'men',
    description: 'Extra-fine 17.5-micron Merino wool. Whisper-light yet incredibly warm, with no itch and natural odor resistance.',
    details: ['100% Fine Merino Wool', '17.5-micron fibers', 'Ribbed cuffs and hem', 'Machine wash cold', 'Pre-washed for softness'],
    colors: [{ name: 'Dusk', hex: '#4a3728' }, { name: 'Stone', hex: '#9e9585' }, { name: 'Alpine', hex: '#2c5364' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675173785254?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=750&fit=crop&q=80',
    ],
    badges: [],
    rating: 4.8, reviews: 274, featured: true, trending: false,
    aiTags: ['sweater', 'merino', 'crewneck', 'warm', 'casual', 'minimal'],
  },

  // ── STREETWEAR ───────────────────────────────────────────────────────────────
  {
    id: 'str-001',
    name: 'Signal Oversized Hoodie',
    brand: 'LUMIS STREET',
    price: 185,
    category: 'streetwear',
    gender: 'unisex',
    description: 'Drop-shoulder boxy cut in 400gsm heavyweight cotton. Screen-printed AI-circuit graphics. Built for the streets, designed for the future.',
    details: ['100% Organic Cotton 400gsm', 'Brushed fleece interior', 'Drop shoulder', 'Ribbed cuffs', 'Machine wash'],
    colors: [{ name: 'Tech Black', hex: '#0d0d0d' }, { name: 'Off White', hex: '#e8e4dc' }, { name: 'Digital Slate', hex: '#3d4a5c' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    images: [
      'https://images.unsplash.com/photo-1523398519-b2fd34dc2f38?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1609873814058-a8928924184a?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['hot'],
    rating: 4.8, reviews: 612, featured: true, trending: true,
    aiTags: ['hoodie', 'streetwear', 'oversized', 'casual', 'urban'],
  },
  {
    id: 'str-002',
    name: 'Neural Cargo Pants',
    brand: 'LUMIS STREET',
    price: 245,
    category: 'streetwear',
    gender: 'unisex',
    description: 'Engineered with 8 pockets and a functional adjustable waist. Ripstop nylon that handles both the city and the wilderness.',
    details: ['100% Ripstop Nylon', '8-pocket system', 'Adjustable waist tabs', 'Relaxed fit', 'Machine wash'],
    colors: [{ name: 'Void', hex: '#111111' }, { name: 'Camo Sage', hex: '#5a6b40' }, { name: 'Desert Tan', hex: '#c4a882' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1529391409-04b4e6e4c3b3?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['new'],
    rating: 4.7, reviews: 388, featured: false, trending: true,
    aiTags: ['cargo', 'streetwear', 'utilitarian', 'unisex', 'techwear'],
  },
  {
    id: 'str-003',
    name: 'Vector Bomber Jacket',
    brand: 'LUMIS STREET',
    price: 320,
    originalPrice: 395,
    category: 'streetwear',
    gender: 'unisex',
    description: 'Reversible design — matte nylon on one side, satin finish on the other. Embroidered constellation patches with reflective details.',
    details: ['Nylon + Satin reversible', 'Embroidered constellation patches', 'Ribbed knit trim', 'Interior zip pockets', 'Machine wash cold'],
    colors: [{ name: 'Night Sky', hex: '#0f0f2a' }, { name: 'Silver Fox', hex: '#9ca3af' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1611042557331-cbc83a1d5e2a?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['sale'],
    rating: 4.6, reviews: 201, featured: false, trending: true,
    aiTags: ['bomber', 'jacket', 'reversible', 'streetwear', 'statement'],
  },

  // ── OUTERWEAR ────────────────────────────────────────────────────────────────
  {
    id: 'out-001',
    name: 'Aether Puffer Coat',
    brand: 'LUMIS Collection',
    price: 485,
    category: 'outerwear',
    gender: 'unisex',
    description: '800-fill recycled down in an ultra-lightweight quilted shell. Packs to the size of a water bottle, protects in -20°C conditions.',
    details: ['800-fill recycled down', 'Ripstop outer shell', 'Packable design', 'Waterproof DWR coating', 'Machine wash cold'],
    colors: [{ name: 'Graphite', hex: '#374151' }, { name: 'Arctic Blue', hex: '#1a3a5f' }, { name: 'Volcanic', hex: '#1c0a00' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1539109136-081f16c6e26c?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['new'],
    rating: 4.9, reviews: 445, featured: true, trending: false,
    aiTags: ['puffer', 'coat', 'winter', 'warm', 'packable', 'outerwear'],
  },
  {
    id: 'out-002',
    name: 'Eclipse Wool Overcoat',
    brand: 'LUMIS Collection',
    price: 695,
    category: 'outerwear',
    gender: 'women',
    description: 'Camel-hair blend in a clean, minimalist silhouette. Notched lapels, concealed button placket, and a sweeping midi length.',
    details: ['60% Camel Hair, 40% Wool', 'Concealed button placket', 'Welt pockets', 'Satin lining', 'Dry clean only'],
    colors: [{ name: 'Camel', hex: '#b5813d' }, { name: 'Chalk', hex: '#e8e4dc' }, { name: 'Espresso', hex: '#2c1a0e' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&h=750&fit=crop&q=80',
    ],
    badges: [],
    rating: 4.8, reviews: 167, featured: true, trending: false,
    aiTags: ['overcoat', 'wool', 'camel', 'classic', 'elegant', 'winter'],
  },

  // ── ACCESSORIES ──────────────────────────────────────────────────────────────
  {
    id: 'acc-001',
    name: 'Prism Silk Scarf',
    brand: 'LUMIS Atelier',
    price: 145,
    category: 'accessories',
    gender: 'unisex',
    description: 'Hand-printed on 100% Habotai silk using reactive dyes. Each scarf is individually numbered — no two are exactly alike.',
    details: ['100% Habotai Silk', 'Hand-printed', 'Individually numbered', '90×90cm', 'Dry clean only'],
    colors: [{ name: 'Cosmos', hex: '#2d1b69' }, { name: 'Solar', hex: '#f59e0b' }, { name: 'Ocean', hex: '#0284c7' }],
    sizes: ['One Size'],
    images: [
      'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['new'],
    rating: 4.9, reviews: 93, featured: false, trending: false,
    aiTags: ['scarf', 'silk', 'accessory', 'gift', 'luxury'],
  },
  {
    id: 'acc-002',
    name: 'Titan Leather Belt',
    brand: 'LUMIS Atelier',
    price: 185,
    category: 'accessories',
    gender: 'unisex',
    description: 'Vegetable-tanned Italian leather with a precision-milled gunmetal buckle. Gets better with every year of wear.',
    details: ['Full-grain Italian leather', 'Gunmetal hardware', '3.5cm width', 'Sizes 28–42"', 'Leather conditioner included'],
    colors: [{ name: 'Black', hex: '#111111' }, { name: 'Cognac', hex: '#8b4513' }, { name: 'Tan', hex: '#c4a882' }],
    sizes: ['28', '30', '32', '34', '36', '38', '40', '42'],
    images: [
      'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553735945-7e6b1f99c843?w=600&h=750&fit=crop&q=80',
    ],
    badges: [],
    rating: 4.7, reviews: 234, featured: false, trending: false,
    aiTags: ['belt', 'leather', 'accessory', 'formal', 'classic'],
  },
  {
    id: 'acc-003',
    name: 'Nova Wool Beanie',
    brand: 'LUMIS Essentials',
    price: 75,
    category: 'accessories',
    gender: 'unisex',
    description: 'Extra-fine Merino wool in a ribbed double-layer construction. Keeps you warm down to -15°C without sacrificing style.',
    details: ['100% Merino Wool', 'Double-layer construction', 'One size fits most', 'Machine wash cold', 'OEKO-TEX certified'],
    colors: [{ name: 'Coal', hex: '#1a1a1a' }, { name: 'Ice', hex: '#d4e0ec' }, { name: 'Burgundy', hex: '#6b1a2e' }],
    sizes: ['One Size'],
    images: [
      'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=750&fit=crop&q=80',
      'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&h=750&fit=crop&q=80',
    ],
    badges: ['hot'],
    rating: 4.8, reviews: 518, featured: false, trending: true,
    aiTags: ['beanie', 'hat', 'winter', 'accessory', 'casual'],
  },
];

export const categories: { id: Category; label: string; count: number }[] = [
  { id: 'all',         label: 'All',         count: products.length },
  { id: 'mens',        label: "Men's",       count: products.filter(p => p.gender === 'men').length },
  { id: 'womens',      label: "Women's",     count: products.filter(p => p.gender === 'women').length },
  { id: 'streetwear',  label: 'Streetwear',  count: products.filter(p => p.category === 'streetwear').length },
  { id: 'luxury',      label: 'Luxury',      count: products.filter(p => p.category === 'luxury').length },
  { id: 'outerwear',   label: 'Outerwear',   count: products.filter(p => p.category === 'outerwear').length },
  { id: 'accessories', label: 'Accessories', count: products.filter(p => p.category === 'accessories').length },
];

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.featured);
}

export function getTrendingProducts(): Product[] {
  return products.filter(p => p.trending);
}

export function getProductsByCategory(category: Category): Product[] {
  if (category === 'all') return products;
  if (category === 'mens')   return products.filter(p => p.gender === 'men');
  if (category === 'womens') return products.filter(p => p.gender === 'women');
  return products.filter(p => p.category === category);
}
