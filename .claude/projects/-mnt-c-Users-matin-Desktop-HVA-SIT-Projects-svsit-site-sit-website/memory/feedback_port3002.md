---
name: dev-server-port-3002
description: Dit project draait lokaal op port 3002, niet 3000. Port 3000 is bezet door een ander project.
type: feedback
---

Gebruik altijd port 3002 voor de dev server van dit project.

**Why:** Port 3000 is bezet door een ander project dat per ongeluk lokaal is gedeployed.

**How to apply:** Bij NEXTAUTH_URL altijd `http://localhost:3002` gebruiken. Dev server starten met `npm run dev -- --port 3002`.
