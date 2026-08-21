import { useRef } from 'react'
import styles from './SpotlightCard.module.css'

export default function SpotlightCard({ children, className = '', spotlightColor = 'rgba(96, 165, 250, 0.22)' }) {
  const cardRef = useRef(null)

  const handleMouseMove = (event) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    cardRef.current.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`)
    cardRef.current.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`)
    cardRef.current.style.setProperty('--spotlight-color', spotlightColor)
  }

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} className={`${styles['card-spotlight']} ${className}`}>
      {children}
    </div>
  )
}
