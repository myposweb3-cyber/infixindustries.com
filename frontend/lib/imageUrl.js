export function normalizeImageUrl(value) {
  if (!value || typeof value !== 'string') return null;
  if (/^(https?:\/\/|data:|blob:)/i.test(value)) return value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/i, '');
  return `${baseUrl}${value.startsWith('/') ? '' : '/'}${value}`;
}
