interface PetProps {
  size?: number
}

export function PetBabyDragon({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left wing */}
      <path fill="#6B1D00" opacity="0.85">
        <animate
          attributeName="d"
          values="M12,16 L4,10 L8,18 Z; M12,16 L3,8 L7,17 Z; M12,16 L4,10 L8,18 Z"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
      {/* Right wing */}
      <path fill="#6B1D00" opacity="0.85">
        <animate
          attributeName="d"
          values="M20,16 L28,10 L24,18 Z; M20,16 L29,8 L25,17 Z; M20,16 L28,10 L24,18 Z"
          dur="3s"
          begin="0.1s"
          repeatCount="indefinite"
        />
      </path>
      {/* Body */}
      <ellipse cx="16" cy="20" rx="7" ry="6" fill="#8B2500" />
      {/* Belly */}
      <ellipse cx="16" cy="21" rx="4" ry="4" fill="#B03000" opacity="0.6" />
      {/* Head */}
      <circle cx="16" cy="12" r="6" fill="#B03000" />
      {/* Left horn */}
      <line x1="13" y1="7" x2="11" y2="3" stroke="#6B1D00" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right horn */}
      <line x1="19" y1="7" x2="21" y2="3" stroke="#6B1D00" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyes */}
      <ellipse cx="13.5" cy="12" rx="2" ry="2" fill="#F59E0B" />
      <ellipse cx="18.5" cy="12" rx="2" ry="2" fill="#F59E0B" />
      <circle cx="14" cy="12.5" r="1" fill="#1a0800" />
      <circle cx="19" cy="12.5" r="1" fill="#1a0800" />
      {/* Tail */}
      <path d="M23,22 C26,24 27,28 25,30" stroke="#8B2500" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Fire breath - intermittent */}
      <path d="M16,17 L13,22 L16,20 L19,22 Z" fill="#F59E0B">
        <animate
          attributeName="opacity"
          values="0;0;0.7;0.9;0;0;0"
          dur="5s"
          keyTimes="0;0.35;0.4;0.45;0.5;0.9;1"
          repeatCount="indefinite"
        />
      </path>
      {/* Nostril hint */}
      <circle cx="15" cy="14.5" r="0.5" fill="#6B1D00" />
      <circle cx="17" cy="14.5" r="0.5" fill="#6B1D00" />
    </svg>
  )
}
