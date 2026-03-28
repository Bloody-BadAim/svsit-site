// "use client";

// import { forwardRef } from "react";

// const HeroScrollIndicator = forwardRef<HTMLDivElement>(
//   function HeroScrollIndicator(_, ref) {
//     return (
//       <div
//         ref={ref}
//         className="absolute bottom-10 left-1/2 flex flex-col items-center gap-2"
//         style={{
//           transform: "translateX(-50%)",
//           opacity: 0,
//           zIndex: 20,
//           willChange: "opacity",
//         }}
//       >
//         <span className="font-mono text-xs tracking-wider">
//           <span style={{ color: "var(--color-accent-gold)" }}>$ </span>
//           <span style={{ color: "var(--color-text-muted)", opacity: 0.7 }}>
//             scroll down
//           </span>
//         </span>
//         <div className="flex flex-col items-center gap-1">
//           <div
//             className="hero-scroll-pipe"
//             style={{
//               width: "1px",
//               height: "24px",
//               background:
//                 "linear-gradient(to bottom, rgba(242,158,24,0.6), transparent)",
//             }}
//           />
//           <span
//             className="font-mono text-xs hero-scroll-arrow"
//             style={{
//               color: "var(--color-accent-gold)",
//               opacity: 0.7,
//             }}
//           >
//             ▼
//           </span>
//         </div>

//         <style>{`
//           .hero-scroll-pipe {
//             animation: heroPipeBlink 1.2s step-end infinite;
//           }
//           .hero-scroll-arrow {
//             animation: heroArrowBounce 2s ease-in-out infinite;
//           }
//           @keyframes heroPipeBlink {
//             0%, 49% { opacity: 1; }
//             50%, 100% { opacity: 0; }
//           }
//           @keyframes heroArrowBounce {
//             0%, 100% { transform: translateY(0); }
//             50% { transform: translateY(8px); }
//           }
//           @media (prefers-reduced-motion: reduce) {
//             .hero-scroll-pipe,
//             .hero-scroll-arrow {
//               animation: none !important;
//             }
//           }
//         `}</style>
//       </div>
//     );
//   }
// );

// export default HeroScrollIndicator;
