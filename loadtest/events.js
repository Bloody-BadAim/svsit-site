/**
 * Load test for svsit-site — LOCAL server only.
 *
 * Run via npx (no installation needed):
 *   npx autocannon -c 50 -d 30 http://localhost:3000/events
 *
 * Or run this file directly for a multi-route sequence:
 *   node loadtest/events.js
 *
 * WARNING: NEVER point this at svsit.nl or any production URL.
 */

'use strict'

const autocannon = require('autocannon')

const BASE_URL = 'http://localhost:3000'

const ROUTES = [
  { title: 'Homepage       GET /', url: `${BASE_URL}/` },
  { title: 'Events page    GET /events', url: `${BASE_URL}/events` },
  { title: 'Events API     GET /api/events', url: `${BASE_URL}/api/events` },
]

// Safety guard — refuse to run against production hostnames.
for (const route of ROUTES) {
  if (/svsit\.nl|vercel\.app/.test(route.url)) {
    console.error('ERROR: Refusing to load-test a production URL:', route.url)
    process.exit(1)
  }
}

async function runRoute({ title, url }) {
  return new Promise((resolve, reject) => {
    console.log(`\n--- ${title} ---`)
    const instance = autocannon(
      {
        url,
        connections: 50,   // concurrent connections
        duration: 30,      // seconds
        pipelining: 1,
        method: 'GET',
      },
      (err, result) => {
        if (err) return reject(err)
        console.log(autocannon.printResult(result))
        resolve(result)
      },
    )
    autocannon.track(instance, { renderProgressBar: true })
  })
}

async function main() {
  console.log('svsit-site load test — LOCAL server only')
  console.log(`Target: ${BASE_URL}`)
  console.log('Connections: 50 | Duration: 30s per route\n')

  const results = []
  for (const route of ROUTES) {
    const result = await runRoute(route)
    results.push({ route: route.title, result })
  }

  console.log('\n=== Summary ===')
  for (const { route, result } of results) {
    const { requests, latency, errors } = result
    console.log(`${route}`)
    console.log(`  req/s     : ${requests.average.toFixed(1)}`)
    console.log(`  latency   : avg ${latency.average.toFixed(1)}ms  p99 ${latency.p99}ms`)
    console.log(`  errors    : ${errors}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
