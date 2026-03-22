"use client";

import { useEffect } from "react";

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      "%c{SIT} — Studievereniging ICT",
      "color: #F59E0B; font-size: 20px; font-weight: bold; font-family: monospace;"
    );
    console.log(
      "%cHey developer 👀 Interesse in meehelpen aan onze site? Mail bestuur@svsit.nl",
      "color: #71717A; font-size: 14px;"
    );
    console.log(
      "%c// P.S. Deze site is open source: github.com/svsit/website",
      "color: #3B82F6; font-size: 12px; font-family: monospace;"
    );
  }, []);

  return null;
}
