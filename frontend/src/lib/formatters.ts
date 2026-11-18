import { Currency } from '../types';

export function formatCurrency(amount: number | null | undefined, currency: Currency = 'INR'): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';

  if (currency === 'INR') {
    if (Math.abs(amount) >= 10000000) {
      const cr = amount / 10000000;
      return `₹${cr.toFixed(2)} Cr`;
    } else if (Math.abs(amount) >= 100000) {
      const lakh = amount / 100000;
      return `₹${lakh.toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  } else {
    // USD
    if (Math.abs(amount) >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(2)}B`;
    } else if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(1)}k`;
    } else {
      return `$${amount.toLocaleString('en-US')}`;
    }
  }
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${value.toFixed(1)}%`;
}

export function formatNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return 'N/A';
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
  return val.toLocaleString();
}
