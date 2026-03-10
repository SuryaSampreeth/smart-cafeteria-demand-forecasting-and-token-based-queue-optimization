# E2E tests (Playwright)

This folder contains end-to-end tests for the Expo Web build (React Native Web).

## Install

From `frontend/`:

```bash
npm install
npx playwright install
```

## Run (UI-only smoke)

Starts from the login/register screens and validates basic UX (no backend required).

```bash
npm run e2e:ui
```

> Ensure the web app is running at `http://localhost:8081` (Expo web).  
> If you run `npm run web` first, Playwright will reuse it.

## Run (full E2E)

Requires:
- Backend running at `http://localhost:5000`
- MongoDB running and backend `.env` configured

```bash
npm run e2e:full
```

Optional env overrides:
- `E2E_WEB_BASE_URL` (default: `http://localhost:8081`)
- `E2E_API_BASE_URL` (default: `http://localhost:5000/api`)

