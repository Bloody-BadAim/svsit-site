import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "{SIT} — Studievereniging ICT",
  description:
    "De studievereniging voor HBO-ICT studenten aan de Hogeschool van Amsterdam. Door studenten. Voor studenten. In code.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${jetbrainsMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
// {SIT} — Studievereniging ICT
// Hogeschool van Amsterdam
//
// Door studenten. Voor studenten. In code.
//
// TODO: meer events toevoegen
// TODO: dark mode is de enige mode
// FIXME: te weinig pizza bij events
//
// Wil je meehelpen? bestuur@svsit.nl
`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
