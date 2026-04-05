interface PetProps {
  size?: number
}

export function PetKonamiSnake({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="snakeRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="20%" stopColor="#F97316" />
          <stop offset="40%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#22C55E" />
          <stop offset="80%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
      </defs>
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 0.5,-0.5; 0,-0.5; 0.5,0; 0,0"
          dur="2s"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
        />
        {/* Body segments - tail to neck, increasing opacity */}
        <rect x="2" y="14" width="4" height="4" rx="1" fill="#22C55E" opacity="0.3" />
        <rect x="6" y="14" width="4" height="4" rx="1" fill="#22C55E" opacity="0.45" />
        <rect x="10" y="14" width="4" height="4" rx="1" fill="#22C55E" opacity="0.6" />
        <rect x="14" y="14" width="4" height="4" rx="1" fill="#22C55E" opacity="0.7" />
        <rect x="18" y="14" width="4" height="4" rx="1" fill="#22C55E" opacity="0.8" />
        {/* Neck segment */}
        <rect x="22" y="14" width="4" height="4" rx="1" fill="#22C55E" opacity="0.9" />
        {/* Head - slightly larger */}
        <rect x="24" y="11" width="6" height="6" rx="1.5" fill="#22C55E" />
        {/* Eye */}
        <rect x="28" y="12" width="1" height="1" fill="#000000" />
        {/* Flickering tongue */}
        <line y1="14" y2="16" x1="30.5" x2="30.5" stroke="#EF4444" strokeWidth="0.8" strokeLinecap="round">
          <animate attributeName="x2" values="31;30;31" dur="1s" repeatCount="indefinite" />
          <animate attributeName="x1" values="30;31;30" dur="1s" repeatCount="indefinite" />
        </line>
        {/* Rainbow name tag */}
        <text
          x="1"
          y="25"
          fontFamily="monospace"
          fontSize="4"
          fill="url(#snakeRainbow)"
          fontWeight="bold"
        >
          KONAMI
        </text>
      </g>
    </svg>
  )
}
