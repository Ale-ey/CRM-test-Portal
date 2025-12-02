/**
 * Normalizes currency codes from various formats to ISO 4217 codes
 */
export function normalizeCurrencyCode(currency?: string): string {
  if (!currency) return 'USD';
  
  const normalized = currency.trim().toUpperCase();
  
  // Map common variations to ISO codes
  const currencyMap: Record<string, string> = {
    'US$': 'USD',
    '$': 'USD',
    'USD': 'USD',
    'GBP': 'GBP',
    '£': 'GBP',
    'EUR': 'EUR',
    '€': 'EUR',
    'JPY': 'JPY',
    '¥': 'JPY',
    'CAD': 'CAD',
    'AUD': 'AUD',
    'CHF': 'CHF',
    'CNY': 'CNY',
    'INR': 'INR',
    'BRL': 'BRL',
    'ZAR': 'ZAR',
    'MXN': 'MXN',
  };
  
  // Check if it's a direct match
  if (currencyMap[normalized]) {
    return currencyMap[normalized];
  }
  
  // Check if it starts with a known currency symbol
  for (const [key, value] of Object.entries(currencyMap)) {
    if (normalized.startsWith(key) || normalized.includes(key)) {
      return value;
    }
  }
  
  // Default to USD if unknown
  return 'USD';
}

/**
 * Formats a number as currency
 */
export function formatCurrency(value: number, currencyCode?: string): string {
  const code = normalizeCurrencyCode(currencyCode);
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    // Fallback if currency code is invalid
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}

