// PairFit Mobile Configuration & Constants
import Constants from 'expo-constants';

export const DEFAULT_API_BASE = 'https://jtgohjakh6gsnaiabtdmlyyn.152.67.25.227.sslip.io';

export function getApiBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  const manifestUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  const url = (envUrl || manifestUrl || DEFAULT_API_BASE).replace(/\/+$/, '');
  return url;
}

export const CATEGORIES = [
  { value: 'tshirt', label: 'T-Shirt', group: 'top' },
  { value: 'shirt', label: 'Shirt', group: 'top' },
  { value: 'top', label: 'Top', group: 'top' },
  { value: 'kurta', label: 'Kurta', group: 'top' },
  { value: 'sweater', label: 'Sweater', group: 'top' },
  { value: 'jeans', label: 'Jeans', group: 'bottom' },
  { value: 'pants', label: 'Pants / Trousers', group: 'bottom' },
  { value: 'skirt', label: 'Skirt', group: 'bottom' },
  { value: 'shorts', label: 'Shorts', group: 'bottom' },
  { value: 'jacket', label: 'Jacket', group: 'outer' },
  { value: 'hoodie', label: 'Hoodie', group: 'outer' },
  { value: 'dress', label: 'Dress', group: 'onepiece' },
];

export const CATEGORY_LABELS = CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = cat.label;
  return acc;
}, {});
