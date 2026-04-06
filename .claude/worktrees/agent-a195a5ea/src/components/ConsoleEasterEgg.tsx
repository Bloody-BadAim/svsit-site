"use client";

import { useEffect } from "react";

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      `%c
   ██████╗ ██╗████████╗
  ██╔════╝ ██║╚══██╔══╝
  ╚█████╗  ██║   ██║
   ╚═══██╗ ██║   ██║
  ██████╔╝ ██║   ██║
  ╚═════╝  ╚═╝   ╚═╝
`,
      "color: #F59E0B; font-family: monospace; font-size: 12px; line-height: 1.2;"
    );
    console.log(
      "%cStudievereniging ICT — Hogeschool van Amsterdam",
      "color: #FAFAFA; font-size: 14px; font-weight: bold; font-family: monospace;"
    );
    console.log(
      "%cDoor studenten. Voor studenten. In tech.",
      "color: #71717A; font-size: 12px; font-family: monospace;"
    );
    console.log(
      "%c─────────────────────────────────────────",
      "color: #27272A; font-family: monospace;"
    );
    console.log(
      "%c> %cInteresse in meehelpen? %cbestuur@svsit.nl",
      "color: #F59E0B; font-family: monospace; font-size: 12px;",
      "color: #A1A1AA; font-family: monospace; font-size: 12px;",
      "color: #3B82F6; font-family: monospace; font-size: 12px; text-decoration: underline;"
    );
  }, []);

  return null;
}
