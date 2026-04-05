interface PetProps {
  size?: number
}

export function PetClippy({ size = 48 }: PetProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="-5,16,16; 5,16,16; -5,16,16"
          dur="3s"
          repeatCount="indefinite"
        />
        {/* Paperclip body outer */}
        <path
          d="M20 6 C23 6 25 8 25 11 L25 22 C25 26 22 28 19 28 L13 28 C10 28 7 26 7 22 L7 11 C7 8 9 6 12 6 L20 6"
          stroke="#999999"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Paperclip inner loop */}
        <path
          d="M17 8 C19 8 21 9.5 21 11 L21 22 C21 24.5 19.5 26 18 26 L14 26 C12.5 26 11 24.5 11 22 L11 11 C11 9.5 12.5 8 14 8 L17 8"
          stroke="#999999"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left eyebrow */}
        <path strokeWidth="1.2" stroke="#CCCCCC" strokeLinecap="round" fill="none">
          <animate
            attributeName="d"
            values="M12,13 C12.5,12.5 13.5,12.5 14,13; M12,12 C12.5,11 13.5,11 14,12; M12,13 C12.5,12.5 13.5,12.5 14,13"
            dur="5s"
            repeatCount="indefinite"
          />
        </path>
        {/* Right eyebrow */}
        <path strokeWidth="1.2" stroke="#CCCCCC" strokeLinecap="round" fill="none">
          <animate
            attributeName="d"
            values="M18,13 C18.5,12.5 19.5,12.5 20,13; M18,12 C18.5,11 19.5,11 20,12; M18,13 C18.5,12.5 19.5,12.5 20,13"
            dur="5s"
            repeatCount="indefinite"
          />
        </path>
        {/* Left eye white */}
        <circle cx="13" cy="15" r="2" fill="white" />
        {/* Left pupil — looks around */}
        <circle cy="15" r="1" fill="#333333">
          <animate
            attributeName="cx"
            values="13;14;13;12;13"
            dur="5s"
            keyTimes="0;0.25;0.5;0.75;1"
            repeatCount="indefinite"
          />
        </circle>
        {/* Right eye white */}
        <circle cx="19" cy="15" r="2" fill="white" />
        {/* Right pupil — looks around */}
        <circle cy="15" r="1" fill="#333333">
          <animate
            attributeName="cx"
            values="19;20;19;18;19"
            dur="5s"
            keyTimes="0;0.25;0.5;0.75;1"
            repeatCount="indefinite"
          />
        </circle>
        {/* Mouth */}
        <path d="M14,19 Q16,21 18,19" stroke="#999999" strokeWidth="1" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}
