// "use client";

// import { useEffect, useState } from "react";

// const KONAMI = [
//   "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
//   "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
//   "b", "a",
// ];

// export default function KonamiCode() {
//   const [index, setIndex] = useState(0);
//   const [activated, setActivated] = useState(false);

//   useEffect(() => {
//     const onKeyDown = (e: KeyboardEvent) => {
//       if (e.key === KONAMI[index]) {
//         const next = index + 1;
//         if (next === KONAMI.length) {
//           setActivated(true);
//           setIndex(0);
//           // Reset after 4 seconds
//           setTimeout(() => setActivated(false), 4000);
//         } else {
//           setIndex(next);
//         }
//       } else {
//         setIndex(0);
//       }
//     };

//     window.addEventListener("keydown", onKeyDown);
//     return () => window.removeEventListener("keydown", onKeyDown);
//   }, [index]);

//   if (!activated) return null;

//   return (
//     <div className="fixed inset-0 z-[9998] pointer-events-none flex items-center justify-center animate-[fadeIn_0.3s_ease_forwards]">
//       {/* Neon overlay effect */}
//       <div
//         className="absolute inset-0"
//         style={{
//           background: "radial-gradient(ellipse at center, rgba(245, 158, 11, 0.08) 0%, transparent 70%)",
//           animation: "pulse 1s ease-in-out infinite",
//         }}
//       />

//       {/* ASCII art SIT logo */}
//       <pre
//         className="font-mono text-[var(--color-accent-gold)] text-center whitespace-pre leading-tight"
//         style={{
//           fontSize: "clamp(8px, 2vw, 16px)",
//           textShadow: "0 0 20px #F59E0B, 0 0 40px #F59E0B, 0 0 80px #F59E0B",
//           animation: "fadeIn 0.5s ease forwards",
//         }}
//       >
//         {`
//   ███████╗   ██╗  ████████╗
//   ██╔════╝   ██║  ╚══██╔══╝
//   ███████╗   ██║     ██║
//   ╚════██║   ██║     ██║
//   ███████║   ██║     ██║
//   ╚══════╝   ╚═╝     ╚═╝

//   // easter egg found!
//   // je bent een echte dev
// `}
//       </pre>
//     </div>
//   );
// }
