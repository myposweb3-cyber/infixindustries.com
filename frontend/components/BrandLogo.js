export default function BrandLogo({ className = 'h-14 w-auto object-contain max-w-full block' }) {
  return (
    <img
      src="/logo.png"
      alt="Infix Industries logo"
      className={className}
      style={{ display: 'block' }}
    />
  )
}
