interface PetProps {
  size?: number
}

export function PetPixelCat({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="16" cy="22" rx="8" ry="6" fill="#555555" />
      {/* Head */}
      <circle cx="16" cy="14" r="7" fill="#666666" />
      {/* Left ear */}
      <polygon points="9,10 11,4 14,10" fill="#777777" />
      {/* Right ear */}
      <polygon points="23,10 21,4 18,10" fill="#777777" />
      {/* Inner left ear */}
      <polygon points="10,9 11.5,6 13,9" fill="#AA8888" />
      {/* Inner right ear */}
      <polygon points="22,9 20.5,6 19,9" fill="#AA8888" />
      {/* Left eye */}
      <ellipse cx="13" cy="14" rx="1.8" ry="1.8" fill="#44CC44">
        <animate
          attributeName="ry"
          values="1.8;0.3;1.8"
          dur="4s"
          keyTimes="0;0.05;0.1"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Left pupil */}
      <ellipse cx="13" cy="14" rx="0.9" ry="0.9" fill="#112211">
        <animate
          attributeName="ry"
          values="0.9;0.1;0.9"
          dur="4s"
          keyTimes="0;0.05;0.1"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Right eye */}
      <ellipse cx="19" cy="14" rx="1.8" ry="1.8" fill="#44CC44">
        <animate
          attributeName="ry"
          values="1.8;0.3;1.8"
          dur="4s"
          keyTimes="0;0.05;0.1"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Right pupil */}
      <ellipse cx="19" cy="14" rx="0.9" ry="0.9" fill="#112211">
        <animate
          attributeName="ry"
          values="0.9;0.1;0.9"
          dur="4s"
          keyTimes="0;0.05;0.1"
          calcMode="spline"
          keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"
          repeatCount="indefinite"
        />
      </ellipse>
      {/* Nose */}
      <polygon points="16,16.5 15,17.8 17,17.8" fill="#CC8888" />
      {/* Whiskers left */}
      <line x1="9" y1="16" x2="14" y2="16.5" stroke="#AAAAAA" strokeWidth="0.5" opacity="0.6" />
      <line x1="9" y1="17.5" x2="14" y2="17.5" stroke="#AAAAAA" strokeWidth="0.5" opacity="0.6" />
      {/* Whiskers right */}
      <line x1="23" y1="16" x2="18" y2="16.5" stroke="#AAAAAA" strokeWidth="0.5" opacity="0.6" />
      <line x1="23" y1="17.5" x2="18" y2="17.5" stroke="#AAAAAA" strokeWidth="0.5" opacity="0.6" />
      {/* Tail - wagging */}
      <path stroke="#666666" strokeWidth="2" strokeLinecap="round" fill="none">
        <animate
          attributeName="d"
          values="M24,26 C27,24 29,20 28,17; M24,26 C28,25 31,22 29,18; M24,26 C27,24 29,20 28,17"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  )
}
