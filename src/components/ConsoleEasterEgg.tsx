"use client";

import { useEffect } from "react";

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      "%c{SIT}%c Studievereniging ICT — HvA\n\n" +
        "Hey developer 👀\n" +
        "Interesse in SIT? Check svsit.nl\n" +
        "Word lid → sitlid.nl\n\n" +
        "// built with next.js + tailwind + gsap",
      "color: #F59E0B; font-size: 24px; font-weight: bold; font-family: monospace;",
      "color: #71717A; font-size: 12px; font-family: monospace;"
    );
  }, []);

  return null;
}
