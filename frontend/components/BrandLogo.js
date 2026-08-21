export default function BrandLogo({ className = 'h-14 w-auto object-contain max-w-full block' }) {
  return (
    <img
      src="/logo.png"
      alt="Infix Industries logo"
      className={`site-brand-logo ${className}`}
      style={{ display: 'block', width: 'min(250px, 100%)', height: 'auto', maxWidth: '100%' }}
    />
  )
}
