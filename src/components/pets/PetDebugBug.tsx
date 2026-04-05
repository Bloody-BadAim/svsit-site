interface PetProps {
  size?: number
}

export function PetDebugBug({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0; 1,0; 0,0; -1,0; 0,0"
          dur="2s"
          keyTimes="0;0.25;0.5;0.75;1"
          repeatCount="indefinite"
        />
        {/* Body */}
        <ellipse cx="16" cy="20" rx="6" ry="7" fill="rgba(34,197,94,0.20)" stroke="#22C55E" strokeWidth="1" />
        {/* Head */}
        <circle cx="16" cy="11" r="5" fill="rgba(34,197,94,0.15)" stroke="#22C55E" strokeWidth="1" />
        {/* Antenna left */}
        <line x1="13" y1="7" x2="10" y2="3" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" />
        <circle cx="10" cy="3" r="1.2" fill="#22C55E">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" begin="0s" repeatCount="indefinite" />
        </circle>
        {/* Antenna right */}
        <line x1="19" y1="7" x2="22" y2="3" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" />
        <circle cx="22" cy="3" r="1.2" fill="#22C55E">
          <animate attributeName="opacity" values="0.3;0.8;0.3" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
        </circle>
        {/* Eyes */}
        <circle cx="14" cy="11" r="1.5" fill="#22C55E" opacity="0.9" />
        <circle cx="18" cy="11" r="1.5" fill="#22C55E" opacity="0.9" />
        <circle cx="14.4" cy="10.6" r="0.6" fill="#052e16" />
        <circle cx="18.4" cy="10.6" r="0.6" fill="#052e16" />
        {/* Legs left - 3 */}
        <line x1="10" y1="18" x2="5" y2="16" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <line x1="10" y1="20" x2="4" y2="20" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <line x1="10" y1="22" x2="5" y2="24" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        {/* Legs right - 3 */}
        <line x1="22" y1="18" x2="27" y2="16" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <line x1="22" y1="20" x2="28" y2="20" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <line x1="22" y1="22" x2="27" y2="24" stroke="#22C55E" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        {/* Wing pattern on body */}
        <ellipse cx="16" cy="18" rx="3" ry="4" fill="none" stroke="#22C55E" strokeWidth="0.5" opacity="0.4" />
      </g>
    </svg>
  )
}
