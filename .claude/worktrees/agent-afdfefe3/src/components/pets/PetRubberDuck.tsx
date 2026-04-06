interface PetProps {
  size?: number
}

export function PetRubberDuck({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-3,16,20; 3,16,20; -3,16,20"
          dur="2s"
          calcMode="spline"
          keySplines="0.45 0.05 0.55 0.95; 0.45 0.05 0.55 0.95"
          repeatCount="indefinite"
        />
        {/* Body */}
        <ellipse cx="16" cy="23" rx="10" ry="7" fill="#FBBF24" />
        {/* Head */}
        <circle cx="20" cy="14" r="6" fill="#FBBF24" />
        {/* Head top tuft */}
        <path d="M21,8 C21,6 22,5 22,5 C22,5 20,6 20,8 Z" fill="#F59E0B" />
        {/* Beak */}
        <polygon points="25,14 29,13 29,15" fill="#F97316" />
        {/* Eye */}
        <circle cx="22" cy="12.5" r="2" fill="#111111" />
        {/* Eye highlight */}
        <circle cx="22.7" cy="12" r="0.7" fill="white" />
        {/* Wing hint */}
        <path d="M8,22 C10,19 14,20 16,21" stroke="#F59E0B" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
        {/* Water ripple base */}
        <ellipse cx="16" cy="29" rx="12" ry="2" fill="none" stroke="#93C5FD" strokeWidth="0.8" opacity="0.4" />
      </g>
    </svg>
  )
}
