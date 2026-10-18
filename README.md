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

Service variables, declared in `.railway/railway.ts` (`railway config plan` / `railway config apply`):

| Variable      | Value                                                                          |
| ------------- | ------------------------------------------------------------------------------ |
| `PORT`        | `8080`, the port the public domains route to                                   |
| `BACKEND_URL` | `http://${{Gen-Air-Backend.RAILWAY_PRIVATE_DOMAIN}}:${{Gen-Air-Backend.PORT}}` |

`VITE_API_BASE_URL` keeps its `/api` default and is not set.
