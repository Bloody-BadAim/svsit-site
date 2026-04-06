interface PetProps {
  size?: number
}

export function PetRobot({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Antenna */}
      <line x1="16" y1="3" x2="16" y2="7" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
      {/* Antenna tip - blinks */}
      <circle cx="16" cy="2.5" r="1.5" fill="#3B82F6">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
      </circle>
      {/* Head */}
      <rect x="8" y="7" width="16" height="12" rx="2" fill="#1E293B" stroke="#3B82F6" strokeWidth="1" />
      {/* Left eye - scanning */}
      <rect x="10" y="11" height="4" rx="1" fill="#3B82F6">
        <animate attributeName="width" values="3;1;3" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Right eye - scanning */}
      <rect y="11" height="4" rx="1" fill="#3B82F6">
        <animate attributeName="x" values="19;21;19" dur="3s" repeatCount="indefinite" />
        <animate attributeName="width" values="3;1;3" dur="3s" repeatCount="indefinite" />
      </rect>
      {/* Mouth line */}
      <rect x="12" y="17" width="8" height="1" rx="0.5" fill="#3B82F6" opacity="0.5" />
      {/* Neck */}
      <rect x="14" y="19" width="4" height="2" fill="#1E293B" />
      {/* Body */}
      <rect x="9" y="21" width="14" height="9" rx="2" fill="#1E293B" stroke="#3B82F6" strokeWidth="1" />
      {/* Chest light - breathes */}
      <circle cx="16" cy="25" r="2.5" fill="#3B82F6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Left arm */}
      <rect x="5" y="22" width="4" height="6" rx="2" fill="#1E293B" stroke="#3B82F6" strokeWidth="0.8" />
      {/* Right arm */}
      <rect x="23" y="22" width="4" height="6" rx="2" fill="#1E293B" stroke="#3B82F6" strokeWidth="0.8" />
    </svg>
  )
}
