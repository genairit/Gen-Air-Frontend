# Gen-Air-Frontend

the UI part of the gen air app

## Environments

| Environment | Branch | URL                                                 |
| ----------- | ------ | --------------------------------------------------- |
| development | `dev`  | https://gen-air-frontend-development.up.railway.app |
| test        | `test` | https://gen-air-frontend-test.up.railway.app        |
| production  | `main` | https://www.gen-air.org (`gen-air.org` forwards)    |

Each environment is a Railway environment that deploys on push from its branch, with its own
backend and Supabase database.

## Local development

Copy `.env.example` to `.env`. `npm run dev` serves the app and proxies `/api` to
`VITE_BACKEND_URL` (the local Gen-Air-Backend).

## Deployment

Railway builds the `Dockerfile` (see `.railway/railway.ts`): the app is built with `npm run build` and
`dist/` is served by Caddy (`Caddyfile`), which falls back to `index.html` for client routes and
proxies `/api` to the backend over Railway's private network, exactly like the Vite dev proxy.
The backend is never exposed publicly and needs no CORS.

The service's variables live in `.railway/railway.ts` (apply with `railway config plan` and
`railway config apply`): `BACKEND_URL` points Caddy at the backend's private Railway domain.

`VITE_API_BASE_URL` keeps its `/api` default and is not set.

## Release integration checks

The QA agent runs targeted feature tests followed by the full suite before feature PRs. Feature →
`dev` has no duplicate GitHub Actions run. Before merge, verify its QA report still matches the
current frontend candidate/base, latest backend dev after dependencies merge, and Automation
revision. Changed revisions require renewed QA verification.

GitHub runs full integration only for frontend `dev` → `test` and `test` → `main`, paired with the
matching backend destination. It tests the frontend candidate merge using a pinned Automation
revision. Unsupported promotion directions fail before browser execution. Backend/Automation PRs
do not start a GitHub browser suite.

Backend test/main changes invalidate prior frontend promotion results. Wait for backend promotion
and notifier completion; rerun active/stale promotion checks if needed. Require `End-to-end /
Playwright` and `Backend compatibility` only on test/main. Do not require missing GitHub contexts
on dev. See Gen-Air-Automation `docs/release-gate-rollout.md` for coordinated activation.
