import { useState } from 'react'
import styles from './ShinyText.module.css'

export default function ShinyText({
  text,
  disabled = false,
  speed = 2,
  className = '',
  color = '#b5c4d8',
  shineColor = '#ffffff',
  spread = 120,
  pauseOnHover = false,
  direction = 'left'
}) {
  const [paused, setPaused] = useState(false)
  const animationDirection = direction === 'right' ? 'reverse' : 'normal'
  const style = {
    '--shiny-color': color,
    '--shiny-color-highlight': shineColor,
    '--shiny-spread': `${spread}deg`,
    '--shiny-speed': `${speed}s`,
    animationDirection
  }

  return (
    <span
      className={`${styles['shiny-text']} ${disabled ? styles.disabled : ''} ${pauseOnHover ? styles.pauseOnHover : ''} ${paused ? styles.paused : ''} ${className}`}
      style={style}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      {text}
    </span>
  )
}
