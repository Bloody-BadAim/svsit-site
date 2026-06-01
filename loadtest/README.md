# Load Testing — svsit-site

> WARNING: Run these scripts against a LOCAL server only. Never point them at svsit.nl or any staging/production URL. Doing so could degrade the site for real users and violate hosting terms.

## Prerequisites

- Node.js 18+
- A production build of the site running locally

## Setup

Build and start the local server:

```bash
cd /mnt/c/Users/matin/Desktop/PROJECTS/svsit-site
npm run build
npx next start
# Server listens on http://localhost:3000
```

## Quick single-route test (recommended starting point)

```bash
npx autocannon -c 50 -d 30 http://localhost:3000/events
```

Flags:
- `-c 50` — 50 concurrent connections
- `-d 30` — run for 30 seconds

## Multi-route test

Runs /, /events, and /api/events in sequence:

```bash
node loadtest/events.js
```

Requires autocannon to be importable. Install it once locally if needed:

```bash
npm install --no-save autocannon
```

## What to watch

| Metric | Healthy target | Investigate if |
|---|---|---|
| req/s | > 200 | < 100 |
| Latency avg | < 100 ms | > 300 ms |
| Latency p99 | < 500 ms | > 1000 ms |
| Errors | 0 | Any non-zero value |

- **req/s (requests per second)** — throughput; low values indicate a bottleneck (slow DB query, blocking middleware, cold cache).
- **Latency p99** — worst-case response time for 99% of requests; spikes here expose slow outliers.
- **Errors** — any HTTP 5xx, connection reset, or timeout. Even 1 error in 30 seconds is worth investigating.

## Typical findings

- High p99 on `/api/events` often means a missing database index on the events table (check `created_at`, `is_published`).
- High latency on `/events` (SSR page) may point to a slow `fetch` inside `generateMetadata` or `page.tsx`.
- Error spikes under 50 concurrent connections suggest a connection-pool limit in Supabase or Prisma.

## Baseline workflow

1. Run before and after a performance change to compare numbers.
2. Save output to a file for diffing: `node loadtest/events.js 2>&1 | tee loadtest/baseline-$(date +%Y%m%d).txt`
3. A 10% drop in req/s or 20% increase in p99 is a regression worth investigating before deploying.
