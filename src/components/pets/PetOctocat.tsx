interface PetProps {
  size?: number
}

export function PetOctocat({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head */}
      <circle cx="16" cy="13" r="8" fill="#333333" />
      {/* Left ear */}
      <polygon points="9,8 11,3 14,8" fill="#444444" />
      {/* Right ear */}
      <polygon points="23,8 21,3 18,8" fill="#444444" />
      {/* Left eye */}
      <ellipse cx="13" cy="12" rx="2.5" ry="2.5" fill="white" />
      <circle cx="13.5" cy="12.5" r="1.3" fill="#111111" />
      <circle cx="14" cy="12" r="0.5" fill="white" />
      {/* Right eye */}
      <ellipse cx="19" cy="12" rx="2.5" ry="2.5" fill="white" />
      <circle cx="19.5" cy="12.5" r="1.3" fill="#111111" />
      <circle cx="20" cy="12" r="0.5" fill="white" />
      {/* Tentacle 1 - left outer */}
      <path stroke="#444444" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate
          attributeName="d"
          values="M10,20 C8,22 7,25 8,28; M10,20 C7,21 5,23 6,27; M10,20 C8,22 7,25 8,28"
          dur="2.5s"
          begin="0s"
          repeatCount="indefinite"
        />
      </path>
      {/* Tentacle 2 - left inner */}
      <path stroke="#444444" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate
          attributeName="d"
          values="M13,21 C13,24 12,27 13,30; M13,21 C12,23 11,26 12,29; M13,21 C13,24 12,27 13,30"
          dur="3s"
          begin="0.3s"
          repeatCount="indefinite"
        />
      </path>
      {/* Tentacle 3 - right inner */}
      <path stroke="#444444" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate
          attributeName="d"
          values="M19,21 C19,24 20,27 19,30; M19,21 C20,23 21,26 20,29; M19,21 C19,24 20,27 19,30"
          dur="2.8s"
          begin="0.6s"
          repeatCount="indefinite"
        />
      </path>
      {/* Tentacle 4 - right outer */}
      <path stroke="#444444" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate
          attributeName="d"
          values="M22,20 C24,22 25,25 24,28; M22,20 C25,21 27,23 26,27; M22,20 C24,22 25,25 24,28"
          dur="3.2s"
          begin="0.9s"
          repeatCount="indefinite"
        />
      </path>
      {/* Smile */}
      <path d="M13,16 Q16,19 19,16" stroke="#666666" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}
