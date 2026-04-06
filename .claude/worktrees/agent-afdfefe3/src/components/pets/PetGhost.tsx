interface PetProps {
  size?: number
}

export function PetGhost({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0,-4; 0,0"
          dur="3s"
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
          repeatCount="indefinite"
        />
        {/* Ghost body with wavy bottom */}
        <path
          d="M16 4 C9 4 6 9 6 15 L6 27 L8.5 25 L11 27 L13.5 25 L16 27 L18.5 25 L21 27 L23.5 25 L26 27 L26 15 C26 9 23 4 16 4 Z"
          fill="rgba(255,255,255,0.08)"
          stroke="rgba(255,255,255,0.30)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Left eye white */}
        <ellipse cx="12.5" cy="15" rx="2.5" ry="2.5" fill="rgba(255,255,255,0.60)" />
        {/* Left pupil */}
        <circle cx="13" cy="15.5" r="1.2" fill="rgba(9,9,11,0.9)" />
        {/* Right eye white */}
        <ellipse cx="19.5" cy="15" rx="2.5" ry="2.5" fill="rgba(255,255,255,0.60)" />
        {/* Right pupil */}
        <circle cx="20" cy="15.5" r="1.2" fill="rgba(9,9,11,0.9)" />
      </g>
    </svg>
  )
}
