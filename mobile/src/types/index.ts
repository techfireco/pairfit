export type CategoryGroup = 'top' | 'bottom' | 'outer' | 'onepiece';

export type CategoryValue =
  | 'tshirt'
  | 'shirt'
  | 'top'
  | 'kurta'
  | 'sweater'
  | 'jeans'
  | 'pants'
  | 'skirt'
  | 'shorts'
  | 'jacket'
  | 'hoodie'
  | 'dress';

export interface CategoryInfo {
  value: CategoryValue;
  label: string;
  group: CategoryGroup;
}

export const CATEGORIES: CategoryInfo[] = [
  { value: 'tshirt', label: 'T-Shirt', group: 'top' },
  { value: 'shirt', label: 'Shirt', group: 'top' },
  { value: 'top', label: 'Top', group: 'top' },
  { value: 'kurta', label: 'Kurta', group: 'top' },
  { value: 'sweater', label: 'Sweater', group: 'top' },
  { value: 'jeans', label: 'Jeans', group: 'bottom' },
  { value: 'pants', label: 'Pants', group: 'bottom' },
  { value: 'skirt', label: 'Skirt', group: 'bottom' },
  { value: 'shorts', label: 'Shorts', group: 'bottom' },
  { value: 'jacket', label: 'Jacket', group: 'outer' },
  { value: 'hoodie', label: 'Hoodie', group: 'outer' },
  { value: 'dress', label: 'Dress', group: 'onepiece' },
];

export const CATEGORY_LABELS: Record<string, string> = {
  tshirt: 'T-Shirt',
  shirt: 'Shirt',
  top: 'Top',
  kurta: 'Kurta',
  sweater: 'Sweater',
  jeans: 'Jeans',
  pants: 'Pants',
  skirt: 'Skirt',
  shorts: 'Shorts',
  jacket: 'Jacket',
  hoodie: 'Hoodie',
  dress: 'Dress',
};

export const CATEGORY_GROUPS_MAP: Record<CategoryGroup, { title: string; categories: CategoryInfo[] }> = {
  top: {
    title: 'Tops & Shirts',
    categories: CATEGORIES.filter((c) => c.group === 'top'),
  },
  bottom: {
    title: 'Pants & Bottoms',
    categories: CATEGORIES.filter((c) => c.group === 'bottom'),
  },
  outer: {
    title: 'Jackets & Outerwear',
    categories: CATEGORIES.filter((c) => c.group === 'outer'),
  },
  onepiece: {
    title: 'Dresses & One-Piece',
    categories: CATEGORIES.filter((c) => c.group === 'onepiece'),
  },
};

export interface Item {
  id: string;
  name: string;
  category: CategoryValue | string;
  colorHex: string;
  h: number;
  s: number;
  l: number;
  photoUrl: string;
  thumbnailUrl?: string;
  createdAt?: string;
}

export interface Recommendation {
  item: Item;
  score: number;
  reasons: string[];
}

export interface RecommendationResponse {
  item: Item;
  recommendations: Recommendation[];
}

export interface MeResponse {
  id: string;
  email: string;
  name?: string | null;
  isPro: boolean;
  itemCount: number;
  itemLimit: number | null;
}

export interface ApiConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
}
