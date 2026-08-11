export const CURRENCY_CODE = process.env.NEXT_PUBLIC_CURRENCY_CODE || 'INR';

export function formatMoney(value) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '-';
  return `Rs ${new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
