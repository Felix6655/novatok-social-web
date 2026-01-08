// NovaTok Music - Deterministic Artwork Generator
// Generates consistent gradient artwork based on track/playlist IDs

// Modern music-style gradient palettes
const GRADIENT_PALETTES = [
  ['#667eea', '#764ba2'], // Purple to violet
  ['#f093fb', '#f5576c'], // Pink to rose
  ['#4facfe', '#00f2fe'], // Blue to cyan
  ['#43e97b', '#38f9d7'], // Green to teal
  ['#fa709a', '#fee140'], // Pink to yellow
  ['#a8edea', '#fed6e3'], // Teal to pink
  ['#ff0844', '#ffb199'], // Red to peach
  ['#6a11cb', '#2575fc'], // Purple to blue
  ['#f857a6', '#ff5858'], // Pink to red
  ['#00d2ff', '#3a47d5'], // Cyan to indigo
  ['#ee0979', '#ff6a00'], // Magenta to orange
  ['#fc466b', '#3f5efb'], // Rose to blue
  ['#8360c3', '#2ebf91'], // Purple to green
  ['#c471f5', '#fa71cd'], // Lavender to pink
  ['#a18cd1', '#fbc2eb'], // Purple to light pink
  ['#667db6', '#0082c8', '#0082c8', '#667db6'], // Blue gradient
  ['#d558c8', '#24d292'], // Magenta to green
  ['#f77062', '#fe5196'], // Coral to pink
  ['#c33764', '#1d2671'], // Red to navy
  ['#ffe259', '#ffa751'], // Yellow to orange
]

// Hash function to convert string to number
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Generate HSL color from hash
function hashToHSL(hash, index = 0) {
  const h = (hash + index * 137) % 360
  const s = 60 + (hash % 30) // 60-90%
  const l = 45 + (hash % 20) // 45-65%
  return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * Get deterministic gradient for a track or playlist
 * @param {string} id - Track or playlist ID
 * @param {string} type - 'track' or 'playlist'
 * @returns {object} Gradient configuration
 */
export function getArtworkGradient(id, type = 'track') {
  const hash = hashCode(id + type)
  const paletteIndex = hash % GRADIENT_PALETTES.length
  const palette = GRADIENT_PALETTES[paletteIndex]
  
  // Determine gradient angle based on hash
  const angles = [135, 145, 155, 125, 180, 160, 140, 120]
  const angle = angles[hash % angles.length]
  
  return {
    colors: palette,
    angle,
    css: `linear-gradient(${angle}deg, ${palette.join(', ')})`,
    tailwind: `from-[${palette[0]}] to-[${palette[palette.length - 1]}]`
  }
}

/**
 * Get SVG artwork for a track (more complex patterns)
 * @param {string} id - Track ID
 * @param {number} size - Size in pixels
 * @returns {string} SVG data URL
 */
export function getTrackArtworkSVG(id, size = 200) {
  const hash = hashCode(id)
  const gradient = getArtworkGradient(id, 'track')
  
  // Generate pattern elements based on hash
  const patternType = hash % 5
  const rotation = (hash % 360)
  
  let patternElements = ''
  
  switch (patternType) {
    case 0: // Circles
      for (let i = 0; i < 3; i++) {
        const cx = 30 + (hash + i * 50) % 140
        const cy = 30 + (hash + i * 70) % 140
        const r = 20 + (hash + i * 30) % 40
        patternElements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.1)"/>`
      }
      break
    case 1: // Waves
      patternElements = `
        <path d="M0,100 Q50,${80 + hash % 40} 100,100 T200,100" stroke="rgba(255,255,255,0.15)" stroke-width="3" fill="none"/>
        <path d="M0,120 Q50,${100 + hash % 40} 100,120 T200,120" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none"/>
      `
      break
    case 2: // Geometric
      patternElements = `
        <polygon points="100,20 ${140 + hash % 30},${100 + hash % 40} ${60 - hash % 20},${100 + hash % 40}" fill="rgba(255,255,255,0.08)"/>
        <rect x="${60 + hash % 40}" y="${120 + hash % 30}" width="${40 + hash % 30}" height="${40 + hash % 30}" fill="rgba(255,255,255,0.06)" transform="rotate(${hash % 45} 100 150)"/>
      `
      break
    case 3: // Lines
      for (let i = 0; i < 5; i++) {
        const y = 30 + i * 35
        patternElements += `<line x1="0" y1="${y}" x2="200" y2="${y + (hash % 20) - 10}" stroke="rgba(255,255,255,0.08)" stroke-width="${1 + i % 2}"/>`
      }
      break
    case 4: // Dots grid
      for (let i = 0; i < 16; i++) {
        const x = 25 + (i % 4) * 50
        const y = 25 + Math.floor(i / 4) * 50
        const r = 3 + (hash + i) % 5
        patternElements += `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(255,255,255,${0.05 + (i % 3) * 0.05})"/>`
      }
      break
  }
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${gradient.colors.map((color, i) => 
            `<stop offset="${(i / (gradient.colors.length - 1)) * 100}%" stop-color="${color}"/>`
          ).join('')}
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#grad)"/>
      <g transform="rotate(${rotation} 100 100)" opacity="0.8">
        ${patternElements}
      </g>
    </svg>
  `
  
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`
}

/**
 * Get CSS gradient string for inline styles
 * @param {string} id - Track or playlist ID
 * @param {string} type - 'track' or 'playlist'
 * @returns {string} CSS gradient
 */
export function getGradientCSS(id, type = 'track') {
  return getArtworkGradient(id, type).css
}

/**
 * Generate a color based on ID for accents
 * @param {string} id - Any ID
 * @returns {string} Hex color
 */
export function getAccentColor(id) {
  const hash = hashCode(id)
  const palette = GRADIENT_PALETTES[hash % GRADIENT_PALETTES.length]
  return palette[0]
}
