"use client";

export default function Footer() {
  return (
    <footer id="footer" className="relative border-t border-[var(--color-border)] px-6 md:px-12 lg:px-24 py-16 md:py-20">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Left: Logo + tagline */}
          <div>
            <span className="font-mono text-2xl font-bold">
              <span className="text-[var(--color-accent-gold)]">{"{"}</span>
              <span className="text-[var(--color-text)]">SIT</span>
              <span className="text-[var(--color-accent-gold)]">{"}"}</span>
            </span>
            <div className="font-mono text-xs text-[var(--color-text-muted)] mt-4 space-y-1 leading-relaxed">
              <p>Studievereniging ICT</p>
              <p>Hogeschool van Amsterdam</p>
              <p className="mt-2 opacity-60">Door studenten, voor studenten.</p>
            </div>
          </div>

          {/* Middle: Links */}
          <div>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-5 block opacity-50">
              Links
            </span>
            <nav className="flex flex-col gap-2.5">
              <a href="#about" className="font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-colors">
                over_sit
              </a>
              <a href="#events" className="font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-colors">
                events
              </a>
              <a href="#bestuur" className="font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-colors">
                bestuur
              </a>
              <a href="#join" className="font-mono text-sm text-[var(--color-accent-gold)] hover:text-[var(--color-text)] transition-colors">
                word_lid()
              </a>
            </nav>
          </div>

          {/* Right: Contact */}
          <div>
            <span className="font-mono text-[10px] text-[var(--color-text-muted)] tracking-[0.2em] uppercase mb-5 block opacity-50">
              Contact
            </span>
            <div className="flex flex-col gap-2.5">
              <a
                href="mailto:bestuur@svsit.nl"
                className="font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-colors"
              >
                bestuur@svsit.nl
              </a>
              <a
                href="https://instagram.com/svsit"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-colors"
              >
                @svsit — Instagram
              </a>
              <a
                href="https://linkedin.com/company/svsit"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-[var(--color-text)] hover:text-[var(--color-accent-gold)] transition-colors"
              >
                @svsit — LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Hidden HTML comment easter egg */}
        <div className="mt-8 font-mono text-[10px] text-[var(--color-text-muted)] opacity-15">
          {"<!-- TODO: meer events toevoegen -->"}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <span className="font-mono text-xs text-[var(--color-text-muted)] opacity-40">
            &copy; {new Date().getFullYear()} SIT — Studievereniging ICT
          </span>
          <span className="font-mono text-xs text-[var(--color-text-muted)] opacity-30">
            <span className="text-[var(--color-accent-gold)]">{"// "}</span>
            {"built_with: 'next.js' | tailwind | gsap"}
          </span>
        </div>
      </div>
    </footer>
  );
}
