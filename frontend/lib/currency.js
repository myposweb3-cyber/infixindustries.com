export const CURRENCY_CODE = process.env.NEXT_PUBLIC_CURRENCY_CODE || 'USD';

export function formatMoney(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '-';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
