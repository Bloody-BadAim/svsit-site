"use client";

import { useEffect } from "react";
import { SITE_CONFIG } from "@/lib/constants";

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
      "color: #F29E18; font-family: monospace; font-size: 12px; line-height: 1.2;"
    );
    console.log(
      "%cStudievereniging ICT - Hogeschool van Amsterdam",
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
      `%c> %cInteresse in meehelpen? %c${SITE_CONFIG.email}`,
      "color: #F29E18; font-family: monospace; font-size: 12px;",
      "color: #A1A1AA; font-family: monospace; font-size: 12px;",
      "color: #3B82F6; font-family: monospace; font-size: 12px; text-decoration: underline;"
    );
  }, []);

  return null;
}
