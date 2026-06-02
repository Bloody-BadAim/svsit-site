# E2E Smoke Tests

Playwright smoke tests for public static routes. Not wired into CI or `npm run test`.

## Prerequisites

- Node.js + npm
- Playwright browsers installed: `npx playwright install chromium`

## Running

Always run against a local production build, never against svsit.nl.

```bash
# In the project root:
npm run build
npm run start

# In a separate terminal:
npx playwright test e2e/smoke.e2e.ts --config=e2e/playwright.config.ts
```

## What is tested

| Route      | Assertions                                     |
|------------|------------------------------------------------|
| `/`        | Has title, navbar visible, body non-empty, no console errors |
| `/faq`     | Has title, navbar visible                      |
| `/partners`| Has title, navbar visible                      |

## Notes

- Tests expect the server on `http://localhost:3000`.
- Change `BASE_URL` in `smoke.e2e.ts` if you use a different port.
- The file uses `.e2e.ts` extension so vitest does not pick it up during `npm run test`.
- The config lives in `e2e/playwright.config.ts` and is separate from any root-level playwright config.
