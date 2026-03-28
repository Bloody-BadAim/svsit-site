"use client";

import { forwardRef } from "react";

interface CodeLine {
  text: string;
  type: "comment" | "keyword" | "string" | "property" | "plain" | "blank";
}

const CODE_LINES: CodeLine[] = [
  { text: "// sit.config.ts", type: "comment" },
  { text: "import { SIT } from '@hva/verenigingen';", type: "plain" },
  { text: "", type: "blank" },
  { text: "const sit = new Vereniging({", type: "plain" },
  { text: "  naam: 'Studievereniging HBO-ICT',", type: "plain" },
  { text: "  bestuur: 'XI',", type: "plain" },
  { text: "  missie: 'tech + fun',", type: "plain" },
  { text: "});", type: "plain" },
  { text: "", type: "blank" },
  { text: "sit.events = [", type: "plain" },
  { text: "  'borrels', 'hackathons',", type: "plain" },
  { text: "  'workshops', 'kroegentochten',", type: "plain" },
  { text: "  'game nights', 'tech talks',", type: "plain" },
  { text: "];", type: "plain" },
  { text: "", type: "blank" },
  { text: "sit.voor = [", type: "plain" },
  { text: "  'software engineers',", type: "plain" },
  { text: "  'cyber security',", type: "plain" },
  { text: "  'game developers',", type: "plain" },
  { text: "  'business IT',", type: "plain" },
  { text: "  'technische informatica',", type: "plain" },
  { text: "];", type: "plain" },
  { text: "", type: "blank" },
  { text: "await sit.launch();", type: "plain" },
];

function colorize(line: string): string {
  if (!line) return "";
  return line
    .replace(
      /\b(import|from|const|new|await)\b/g,
      '<span class="hero-code-keyword">$1</span>'
    )
    .replace(
      /('[^']*')/g,
      '<span class="hero-code-string">$1</span>'
    )
    .replace(
      /(\/\/.*$)/,
      '<span class="hero-code-comment">$1</span>'
    )
    .replace(
      /(\.\w+)/g,
      '<span class="hero-code-property">$1</span>'
    );
}

const HeroCodeBlock = forwardRef<HTMLDivElement>(function HeroCodeBlock(_, ref) {
  return (
    <div
      ref={ref}
      className="hidden lg:block absolute right-8 xl:right-16 2xl:right-24 top-1/2 w-[400px] xl:w-[420px]"
      style={{
        transform: "translateY(-50%)",
        opacity: 0,
        zIndex: 15,
        willChange: "transform, opacity",
      }}
    >
      {/* Terminal chrome bar */}
      <div
        className="flex items-center gap-2 px-4 py-3 border border-[var(--color-border)] border-b-0 rounded-t-md"
        style={{ background: "var(--color-surface)" }}
      >
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#EF4444", opacity: 0.7 }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#F29E18", opacity: 0.7 }}
        />
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: "#22C55E", opacity: 0.7 }}
        />
        <span
          className="ml-3 font-mono text-[10px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          sit.config.ts
        </span>
      </div>

      {/* Code content */}
      <div
        className="border border-[var(--color-border)] rounded-b-md p-5 font-mono text-xs leading-[1.9] overflow-hidden"
        style={{
          background: "rgba(17, 17, 19, 0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        {CODE_LINES.map((line, i) => (
          <div
            key={i}
            className="flex gap-4 hero-code-line"
            style={{ opacity: 0.6 }}
          >
            <span
              className="select-none w-5 text-right shrink-0 font-mono"
              style={{
                color: "var(--color-text-muted)",
                opacity: 0.3,
                fontSize: "10px",
              }}
            >
              {i + 1}
            </span>
            {line.text ? (
              <span
                dangerouslySetInnerHTML={{ __html: colorize(line.text) }}
                style={{ color: "var(--color-text)", opacity: 0.8 }}
              />
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        ))}
      </div>

      {/* Inline styles for syntax highlighting */}
      <style>{`
        .hero-code-keyword { color: #3B82F6; }
        .hero-code-string { color: #F29E18; }
        .hero-code-comment { color: #22C55E; }
        .hero-code-property { color: #EF4444; }
      `}</style>
    </div>
  );
});

export default HeroCodeBlock;
