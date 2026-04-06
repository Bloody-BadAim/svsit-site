'use client'

/**
 * SitLogo — Official SIT (Studievereniging ICT) logo as inline SVG.
 *
 * Source: {SIT}SVGNEWBLACK.svg from the official Brand Kit.
 * Colors: Gold braces (#F29E18), White text (#FFF),
 *         Amsterdam × marks: Red (#EF4444), Green (#22C55E), Blue (#3B82F6)
 *
 * Usage:
 *   <SitLogo size={28} />                     — compact, no crosses (navbar)
 *   <SitLogo size={48} showCrosses />         — full logo with × marks (footer)
 *
 * Easter egg: 10 rapid clicks within 5 seconds grants the logo_click badge.
 */

import { useRef, useState } from 'react'

interface SitLogoProps {
  /** Height in pixels */
  size?: number;
  /** Show the three Amsterdam × marks below */
  showCrosses?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export default function SitLogo({
  size = 28,
  showCrosses = false,
  className,
}: SitLogoProps) {
  // Crop viewBox to content only (no black background)
  const vb = showCrosses
    ? "60 660 2080 930"   // includes × marks
    : "60 660 2080 770";  // braces + text only
  const aspect = showCrosses ? 2080 / 930 : 2080 / 770;
  const width = size * aspect;

  const clickTimestamps = useRef<number[]>([])
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [pulsing, setPulsing] = useState(false)

  function handleClick() {
    const now = Date.now()
    // Keep only clicks within the last 5 seconds
    clickTimestamps.current = clickTimestamps.current.filter((t) => now - t < 5000)
    clickTimestamps.current.push(now)

    // Reset the 5-second expiry timer
    if (resetTimer.current) clearTimeout(resetTimer.current)
    resetTimer.current = setTimeout(() => {
      clickTimestamps.current = []
    }, 5000)

    if (clickTimestamps.current.length >= 10) {
      clickTimestamps.current = []
      if (resetTimer.current) clearTimeout(resetTimer.current)
      setPulsing(true)
      setTimeout(() => setPulsing(false), 600)
      fetch('/api/easter-egg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId: 'logo_click' }),
      }).catch(() => {/* silently ignore — user may not be logged in */})
    }
  }

  return (
    <svg
      viewBox={vb}
      width={width}
      height={size}
      className={className}
      role="img"
      aria-label="SIT - Studievereniging ICT"
      onClick={handleClick}
      style={pulsing ? { filter: 'drop-shadow(0 0 8px #F29E18)', transition: 'filter 0.1s' } : undefined}
    >
      <defs>
        <clipPath id="sit-clip-r">
          <rect x="1725.46" y="687.67" width="388" height="810.67" />
        </clipPath>
        <clipPath id="sit-clip-l">
          <rect x="136.12" y="687.67" width="449.33" height="810.67" />
        </clipPath>
        <clipPath id="sit-clip-t">
          <rect x="490.12" y="687.67" width="1246.67" height="810.67" />
        </clipPath>
      </defs>

      {/* Right brace } */}
      <g clipPath="url(#sit-clip-r)">
        <path
          fill="#F29E18"
          d="M1780.9,1409.82v-77.02h33.85c15.94,0,28.45-3.76,37.52-11.29,9.07-7.53,13.17-19.26,12.29-35.19l-6.65-104.27c-1.78-24.78,5.19-44.47,20.9-59.08,15.72-14.61,36.65-22.36,62.77-23.25v-3.31c-26.57-.89-47.6-8.96-63.1-24.23-15.49-15.28-22.34-35.31-20.56-60.1l6.65-103.58c.88-15.05-3.33-26.67-12.63-34.85-9.29-8.19-21.69-12.29-37.19-12.29h-33.85v-76.38h45.81c18.58,0,35.51,2.77,50.79,8.31,15.28,5.53,28.34,13.39,39.19,23.56,10.84,10.18,19.03,22.47,24.56,36.85,5.53,14.39,7.63,30.66,6.31,48.81l-6.65,101.58c-1.33,18.16,2.31,31.77,10.94,40.85,8.64,9.07,23.15,13.6,43.52,13.6h79v76.35h-79c-38.96,0-57.11,18.38-54.46,55.13l6.65,103.58c.88,17.71-1.34,33.76-6.65,48.15-5.31,14.39-13.27,26.67-23.9,36.85-10.63,10.18-23.69,17.92-39.19,23.23-15.5,5.32-32.54,7.98-51.13,7.98h-45.81Z"
        />
      </g>

      {/* Left brace { */}
      <g clipPath="url(#sit-clip-l)">
        <path
          fill="#F29E18"
          d="M268.18,1059.22c38.96,0,57.1-18.15,54.44-54.46l-6.63-104.25c-.89-18.14,1.32-34.29,6.63-48.46,5.32-14.17,13.4-26.23,24.25-36.19,10.84-9.97,23.9-17.61,39.17-22.92,15.28-5.32,32.43-7.98,51.46-7.98h45.17v76.38h-33.88c-15.93,0-28.33,3.77-37.19,11.29-8.85,7.52-12.83,19.47-11.94,35.85l6.63,104.25c1.33,24.79-5.86,44.49-21.58,59.1-15.71,14.6-36.62,22.34-62.73,23.23v3.31c26.55.89,47.57,8.97,63.06,24.25,15.5,15.27,22.58,35.29,21.25,60.08l-6.63,103.6c-.89,14.6,3.2,25.99,12.27,34.19,9.08,8.2,21.36,12.29,36.85,12.29h33.88v77.02h-45.17c-18.58,0-35.63-2.77-51.13-8.31-15.49-5.53-28.66-13.39-39.5-23.56-10.85-10.18-19.04-22.58-24.58-37.19-5.53-14.61-7.63-30.98-6.29-49.13l6.63-100.94c1.33-18.15-2.32-31.88-10.96-41.17-8.63-9.3-23.12-13.96-43.48-13.96h-79.02v-76.35h79.02Z"
        />
      </g>

      {/* SIT text */}
      <g clipPath="url(#sit-clip-t)">
        <path
          fill="#FAFAFA"
          d="M691.78,1342.76c-23.46,0-45.04-3.1-64.75-9.29-19.7-6.21-36.63-15.17-50.79-26.9-14.17-11.73-25.35-25.79-33.54-42.17-8.18-16.39-12.72-34.76-13.6-55.13h85c.89,19.04,8.52,33.99,22.9,44.83,14.39,10.85,33.32,16.27,56.79,16.27s43.27-5.53,56.77-16.6c13.5-11.07,20.25-25.9,20.25-44.5,0-16.38-5.09-30.53-15.27-42.48-10.18-11.96-24.57-20.82-43.17-26.58l-50.46-14.6c-82.35-22.57-123.52-69.94-123.52-142.1,0-19.92,3.65-38.06,10.96-54.44,7.3-16.38,17.59-30.43,30.88-42.17,13.28-11.73,29.44-20.7,48.48-26.9,19.04-6.19,40.51-9.29,64.42-9.29,45.15,0,81.56,11.63,109.23,34.88,27.67,23.24,42.6,55.22,44.81,95.94h-84.33c-.88-18.15-7.96-32.32-21.25-42.5-13.28-10.18-30.1-15.27-50.46-15.27-21.7,0-38.74,5.09-51.15,15.27-12.39,10.18-18.58,23.68-18.58,40.5,0,31.88,19.26,53.35,57.77,64.42l53.13,14.6c39.84,11.07,70.17,29.11,90.98,54.13,20.8,25.02,31.21,55.89,31.21,92.63,0,20.81-3.88,39.62-11.63,56.44-7.75,16.82-18.71,31.21-32.88,43.17s-31.21,21.26-51.13,27.9c-19.92,6.64-42.27,9.96-67.06,9.96Z"
        />
        <path
          fill="#FAFAFA"
          d="M962.01,1336.12v-72.38h102.27v-333.33h-102.27v-72.4h288.19v72.4h-102.25v333.33h102.25v72.38h-288.19Z"
        />
        <path
          fill="#FAFAFA"
          d="M1347.13,858.01h346.63v76.38h-131.48v401.73h-83.67v-401.73h-131.48v-76.38Z"
        />
      </g>

      {/* Amsterdam × marks */}
      {showCrosses && (
        <g>
          {/* Green × */}
          <g>
            <path fill="#22C55E" d="M1125.64,1511.28l38.17-38.17c1.36-1.36,1.36-3.55,0-4.9l-7.3-7.3c-.65-.65-1.53-1.01-2.45-1.01s-1.8.37-2.45,1.01l-38.17,38.17-38.17-38.17c-.65-.65-1.53-1.01-2.45-1.01s-1.8.37-2.45,1.01l-7.3,7.3c-1.36,1.36-1.36,3.55,0,4.9l38.17,38.17-38.17,38.17c-1.35,1.36-1.35,3.55,0,4.9l7.3,7.3c.65.65,1.53,1.01,2.45,1.01s1.8-.37,2.45-1.01l38.17-38.17,38.17,38.17c.65.65,1.53,1.01,2.45,1.01s1.8-.37,2.45-1.01l7.3-7.3c1.35-1.36,1.35-3.55,0-4.9l-38.17-38.17Z" />
            <rect fill="#22C55E" x="1059.72" y="1463.92" width="17.24" height="4.55" transform="translate(-723.85 1184.87) rotate(-45)" />
            <rect fill="#22C55E" x="1149.99" y="1554.18" width="17.24" height="4.55" transform="translate(-761.23 1275.13) rotate(-45)" />
            <rect fill="#22C55E" x="1149.96" y="1463.87" width="17.24" height="4.55" transform="translate(1376.06 -389.82) rotate(45)" />
            <rect fill="#22C55E" x="1059.69" y="1554.12" width="17.24" height="4.55" transform="translate(1413.44 -299.55) rotate(45)" />
          </g>
          {/* Red × */}
          <g>
            <path fill="#EF4444" d="M960.95,1511.26l38.17-38.17c1.36-1.36,1.36-3.55,0-4.9l-7.3-7.3c-.65-.65-1.53-1.01-2.45-1.01s-1.8.37-2.45,1.01l-38.17,38.17-38.17-38.17c-.65-.65-1.53-1.01-2.45-1.01s-1.8.37-2.45,1.01l-7.3,7.3c-1.36,1.36-1.36,3.55,0,4.9l38.17,38.17-38.17,38.17c-1.35,1.36-1.35,3.55,0,4.9l7.3,7.3c.65.65,1.53,1.01,2.45,1.01s1.8-.37,2.45-1.01l38.17-38.17,38.17,38.17c.65.65,1.53,1.01,2.45,1.01s1.8-.37,2.45-1.01l7.3-7.3c1.35-1.36,1.35-3.55,0-4.9l-38.17-38.17Z" />
            <rect fill="#EF4444" x="895.03" y="1463.9" width="17.24" height="4.55" transform="translate(-772.07 1068.4) rotate(-45)" />
            <rect fill="#EF4444" x="985.3" y="1554.16" width="17.24" height="4.55" transform="translate(-809.45 1158.67) rotate(-45)" />
            <rect fill="#EF4444" x="985.27" y="1463.86" width="17.24" height="4.55" transform="translate(1327.81 -273.37) rotate(45)" />
            <rect fill="#EF4444" x="895" y="1554.1" width="17.24" height="4.55" transform="translate(1365.19 -183.1) rotate(45)" />
          </g>
          {/* Blue × */}
          <g>
            <path fill="#3B82F6" d="M1290.33,1511.26l38.17-38.17c1.36-1.36,1.36-3.55,0-4.9l-7.3-7.3c-.65-.65-1.53-1.01-2.45-1.01s-1.8.37-2.45,1.01l-38.17,38.17-38.17-38.17c-.65-.65-1.53-1.01-2.45-1.01s-1.8.37-2.45,1.01l-7.3,7.3c-1.36,1.36-1.36,3.55,0,4.9l38.17,38.17-38.17,38.17c-1.35,1.36-1.35,3.55,0,4.9l7.3,7.3c.65.65,1.53,1.01,2.45,1.01s1.8-.37,2.45-1.01l38.17-38.17,38.17,38.17c.65.65,1.53,1.01,2.45,1.01s1.8-.37,2.45-1.01l7.3-7.3c1.35-1.36,1.35-3.55,0-4.9l-38.17-38.17Z" />
            <rect fill="#3B82F6" x="1224.41" y="1463.9" width="17.24" height="4.55" transform="translate(-675.6 1301.31) rotate(-45)" />
            <rect fill="#3B82F6" x="1314.68" y="1554.16" width="17.24" height="4.55" transform="translate(-712.98 1391.58) rotate(-45)" />
            <rect fill="#3B82F6" x="1314.66" y="1463.86" width="17.24" height="4.55" transform="translate(1424.29 -506.28) rotate(45)" />
            <rect fill="#3B82F6" x="1224.38" y="1554.1" width="17.24" height="4.55" transform="translate(1461.66 -416.01) rotate(45)" />
          </g>
        </g>
      )}
    </svg>
  );
}
