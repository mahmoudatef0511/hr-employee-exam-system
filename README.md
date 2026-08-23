# HR Exam Evaluation System

A full-stack web app where HR can create exams and review employee results, and employees can take exams and view their own scores. Built with a React frontend, an Express/MySQL backend, and a Docker setup so the whole thing runs with one command.

## Features

- **Two roles, one login form** — HR and Employee accounts log in through the same form; the backend figures out which type of account it is.
- **Exam creation (HR)** — create exams and add questions.
- **Exam taking (Employee)** — answer every question with `Yes` / `Partial` / `No`.
- **Automatic scoring** — each answer is worth points (Yes = 2, Partial = 1, No = 0), normalized to a fixed 0–5 scale so exams of different lengths are directly comparable.
- **Submission history** — employees see their own past submissions; HR sees everyone's.
- **JWT authentication** — short-lived access tokens with automatic silent refresh, plus server-side refresh-token invalidation on logout.
- **Dockerized** — one command spins up the database, backend, and frontend together.

## Live Deployment

| Service     | URL                                                                                            | Hosted on |
| ----------- | ---------------------------------------------------------------------------------------------- | --------- |
| Frontend    | [hr-employee-exam-system-client.vercel.app](https://hr-employee-exam-system-client.vercel.app) | Vercel    |
| Backend API | [hr-employee-exam-system-server.vercel.app](https://hr-employee-exam-system-server.vercel.app) | Vercel    |
| Database    | Aiven for MySQL (external, managed)                                                            | Aiven     |

The frontend and backend are deployed as **two separate Vercel projects** from the same GitHub repository — one with its root directory set to `frontend/`, the other to `backend/`. Each redeploys automatically on every push to the main branch. See [Deployment](#deployment) for the full setup.

## Tech Stack

| Layer       | Technology                                                            |
| ----------- | --------------------------------------------------------------------- |
| Frontend    | React 19, Vite, React Router, Axios                                   |
| Backend     | Node.js, Express, Sequelize ORM                                       |
| Database    | MySQL 8.0 (Docker locally, Aiven for MySQL in production)             |
| Auth        | JSON Web Tokens (access + refresh), bcrypt password hashing           |
| Local Infra | Docker & Docker Compose (development only — not used in production)   |
| Hosting     | Vercel (frontend as a static build, backend as a serverless function) |

## Project Structure

```text
project/
├── docker-compose.yml       # Orchestrates db + backend + frontend (local dev only)
├── backend/                 # Express API (routes, controllers, services, models)
│   ├── api/
│   │   └── index.js         # Vercel serverless entry point — exports the Express app
│   ├── vercel.json          # Routes all requests into api/index.js on Vercel
│   └── src/
│       ├── app.js           # Express app definition (routes, CORS, middleware)
│       ├── server.js        # Local/Docker entry point (app.listen) — not used by Vercel
│       ├── config/          # Sequelize runtime config + sequelize-cli config
│       ├── controllers/ · services/ · models/ · routes/ · middleware/
│       ├── migrations/ · seeders/
│       └── utils/
└── frontend/                 # React SPA (pages, components, services)
    └── src/
```

See inline comments throughout the code for details on individual files — the codebase is organized by responsibility (`routes/` → `controllers/` → `services/` → `models/` on the backend; `pages/` → `components/` → `services/` on the frontend).

**Two backend entry points, two purposes:**

- `backend/src/server.js` — used locally and in Docker. Calls `app.listen()` to run a persistent server.
- `backend/api/index.js` — used only by Vercel. Exports the same Express app (`app.js`) without calling `.listen()`, since Vercel invokes it as a serverless function per-request instead of running a long-lived process.

Both entry points share the exact same `app.js`, routes, controllers, and business logic — nothing is duplicated or diverges between local and production.

## Getting Started (Docker — recommended)

**Requirements:** Docker Desktop (or Docker Engine + Compose) installed.

1. **Clone the repo**

   ```bash
   git clone https://github.com/YOUR-USERNAME/hr-exam-evaluation-system.git
   cd hr-exam-evaluation-system
   ```

2. **Create your root `.env` file** (used by `docker-compose.yml`)

   ```bash
   cp .env.example .env
   ```

   The defaults work fine for local development. Change `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` to random strings if you want to be safe by habit.

3. **Start everything**

   ```bash
   docker compose up --build
   ```

   This starts three containers: MySQL, the backend API (port `5000`), and the frontend dev server (port `5173`).

4. **Set up the database** (first time only — in a second terminal, while the containers are running)

   ```bash
   docker compose exec backend npm run migrate
   docker compose exec backend npm run seed
   ```

   This creates the tables and adds sample data (see [Seed accounts](#seed-accounts) below).

5. **Open the app**
   Go to [http://localhost:5173](http://localhost:5173).

### Everyday Docker commands

| Command                                       | Purpose                                                                                   |
| --------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `docker compose up`                           | Start (containers already built)                                                          |
| `docker compose up --build`                   | Rebuild images and start — use after installing a new npm package or editing a Dockerfile |
| `docker compose up -d`                        | Start in the background                                                                   |
| `docker compose down`                         | Stop everything (database data is preserved)                                              |
| `docker compose down -v`                      | Stop everything **and delete the database** — use only for a full reset                   |
| `docker compose logs -f backend`              | Follow logs for one service (`backend`, `frontend`, or `db`)                              |
| `docker compose exec backend npm run migrate` | Run database migrations                                                                   |
| `docker compose exec backend npm run seed`    | Load sample data                                                                          |

You don't need to rebuild after editing frontend or backend source code — both containers watch the mounted source folders and reload automatically. A rebuild is only needed after installing a new dependency or changing a `Dockerfile`.

## Getting Started (Without Docker)

**Requirements:** Node.js 20+, a running MySQL 8 instance.

**Backend:**

```bash
cd backend
cp .env.example .env
# edit .env: set DB_HOST=127.0.0.1, DB_PASSWORD=<your local MySQL password>, etc.
npm install
npm run migrate
npm run seed
npm run dev        # starts on http://localhost:5000
```

**Frontend** (in a separate terminal):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # starts on http://localhost:5173
```

## Seed Accounts

After running the seed command, these accounts are available:

| Role     | Email               | Password      |
| -------- | ------------------- | ------------- |
| HR       | `hr@example.com`    | `password123` |
| Employee | `john@example.com`  | `password123` |
| Employee | `sarah@example.com` | `password123` |

New employee accounts can also self-register from the login page. HR accounts are not self-registrable — they only come from the seed data (or would need to be added directly, e.g. via a future admin flow).

## Environment Variables

None of the real `.env` files are committed — only `.env.example` templates are. Copy each example to a real `.env` locally, and configure the equivalents directly in each Vercel project's dashboard for production (**Settings → Environment Variables**).

### Backend

| Variable                 | Used for                                                         | Local (Docker/`.env`)        | Production (Vercel)                                                    |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| `PORT`                   | Port the server listens on (local only — Vercel ignores this)    | `5000`                       | not needed                                                             |
| `DB_HOST`                | Database host                                                    | `db` (Docker) or `127.0.0.1` | `YOUR_AIVEN_HOST`                                                      |
| `DB_PORT`                | Database port                                                    | `3306`                       | `YOUR_AIVEN_PORT`                                                      |
| `DB_NAME`                | Database name                                                    | your local DB name           | `YOUR_DATABASE_NAME`                                                   |
| `DB_USER`                | Database user                                                    | `root` (Docker default)      | `YOUR_DATABASE_USER`                                                   |
| `DB_PASSWORD`            | Database password                                                | your local password          | `YOUR_DATABASE_PASSWORD`                                               |
| `DB_SSL`                 | Enables TLS for the MySQL connection (see [Database](#database)) | unset / `false`              | `true`                                                                 |
| `JWT_ACCESS_SECRET`      | Signs access tokens                                              | `YOUR_JWT_SECRET`            | `YOUR_JWT_SECRET` (use a different, strong random value in production) |
| `JWT_REFRESH_SECRET`     | Signs refresh tokens                                             | `YOUR_JWT_SECRET`            | `YOUR_JWT_SECRET` (different from the access secret)                   |
| `JWT_ACCESS_EXPIRES_IN`  | Access token lifetime                                            | `15m`                        | `15m`                                                                  |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime                                           | `7d`                         | `7d`                                                                   |
| `CORS_ORIGIN`            | Which frontend origin may call the API                           | `http://localhost:5173`      | your deployed frontend URL, e.g. `https://your-frontend.vercel.app`    |

### Frontend

| Variable       | Used for                                | Local                       | Production (Vercel)                                                            |
| -------------- | --------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ |
| `VITE_API_URL` | Base URL the frontend calls for the API | `http://localhost:5000/api` | your deployed backend URL + `/api`, e.g. `https://your-backend.vercel.app/api` |

Vite env vars are baked into the build at **build time** — changing `VITE_API_URL` in Vercel requires a redeploy to take effect, not just saving the value.

### Root (`.env`, Docker Compose only)

| Variable                                           | Used for                                         |
| -------------------------------------------------- | ------------------------------------------------ |
| `DB_NAME`                                          | Substituted into the `db` and `backend` services |
| `DB_ROOT_PASSWORD`                                 | MySQL root password inside the `db` container    |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`         | Substituted into the `backend` service           |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Substituted into the `backend` service           |

This file is only read by `docker-compose.yml` and has no effect on the Vercel deployment.

## API Overview

All endpoints are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <accessToken>` header.

| Method | Endpoint                     | Access        | Description                                        |
| ------ | ---------------------------- | ------------- | -------------------------------------------------- |
| POST   | `/auth/register`             | Public        | Register a new employee account                    |
| POST   | `/auth/login`                | Public        | Log in as HR or Employee                           |
| POST   | `/auth/refresh`              | Public        | Exchange a refresh token for a new access token    |
| POST   | `/auth/logout`               | Authenticated | Invalidate the current refresh token               |
| GET    | `/exams`                     | Authenticated | List all exams                                     |
| GET    | `/exams/:id`                 | Authenticated | Get a single exam                                  |
| GET    | `/exams/:id/questions`       | Authenticated | Get an exam's questions                            |
| POST   | `/exams`                     | HR only       | Create an exam                                     |
| POST   | `/exams/:id/questions`       | HR only       | Add a question to an exam                          |
| GET    | `/employee/submissions`      | Employee only | List the current employee's own submissions        |
| GET    | `/employee/submissions/:id`  | Employee only | View one of the current employee's own submissions |
| POST   | `/employee/exams/:id/submit` | Employee only | Submit answers for an exam and get scored          |
| GET    | `/hr/submissions`            | HR only       | List every submission from all employees           |
| GET    | `/hr/submissions/:id`        | HR only       | View any submission's full detail                  |

Every response follows the same shape: `{ success: boolean, message: string, data | errors }`.

## Scoring Logic

Each answer is worth a fixed number of points regardless of the question:

| Answer  | Points |
| ------- | ------ |
| Yes     | 2      |
| Partial | 1      |
| No      | 0      |

The raw score is normalized onto a **0–5 scale**, so exams with different numbers of questions remain comparable:

```text
score = round( (rawScore / (numberOfQuestions * 2)) * 5, 1 decimal place )
```

## Database

**Local development:** MySQL 8.0 runs in a Docker container (see `docker-compose.yml`), with no TLS required — `DB_SSL` is left unset.

**Production:** the local Docker database only exists on your machine and is not reachable once the backend is deployed, so production uses an external, managed MySQL instance (this project uses **Aiven for MySQL**). Aiven requires a TLS connection, which is why `backend/src/config/database.js` and `backend/src/config/config.js` both conditionally add:

```js
dialectOptions: process.env.DB_SSL === "true"
  ? { ssl: { require: true, rejectUnauthorized: false } }
  : {};
```

Set `DB_SSL=true` in the backend's Vercel environment variables to enable this. Leave it unset for local Docker use.

**Running migrations/seeders against production:** `sequelize-cli` (used by `npm run migrate` / `npm run seed`) always runs from your local machine — Vercel does not run migrations automatically on deploy. To apply them to the production database, temporarily point `backend/.env` at your production `DB_*` values (with `DB_SSL=true`), run the commands, then restore your local `.env` afterward.

## Frontend ↔ Backend Communication

The frontend never hardcodes an API URL — it always reads `import.meta.env.VITE_API_URL` (see `frontend/src/services/api.js`), which is set differently per environment:

```text
Local:       Frontend → http://localhost:5000/api      → Backend
Production:  Frontend → https://your-backend.vercel.app/api → Backend
```

All requests go through a shared Axios instance that automatically attaches the access token (`Authorization: Bearer <token>`) and transparently retries once with a refreshed token on a `401`, before redirecting to `/login` if the refresh also fails.

## Deployment

The frontend and backend are deployed as **two independent Vercel projects**, both built from this same GitHub repository, with the database hosted separately on Aiven. Vercel does not use `docker-compose.yml` or either `Dockerfile` — those exist for local development only.

```text
                         USER (browser)
                              │
                              ↓
                 ┌────────────────────────┐
                 │  Vercel: Frontend       │  (static Vite build)
                 └────────────┬────────────┘
                              │  VITE_API_URL
                              ↓
                 ┌────────────────────────┐
                 │  Vercel: Backend        │  (Express as a serverless function)
                 └────────────┬────────────┘
                              │  Sequelize / mysql2 (TLS)
                              ↓
                 ┌────────────────────────┐
                 │  Aiven for MySQL        │
                 └────────────────────────┘
```

### Frontend project

| Setting               | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| Root Directory        | `frontend`                                                           |
| Framework Preset      | Vite (auto-detected)                                                 |
| Build Command         | `vite build` (default)                                               |
| Output Directory      | `dist` (default)                                                     |
| Install Command       | `npm install` (default)                                              |
| Environment Variables | `VITE_API_URL` (see [Environment Variables](#environment-variables)) |

### Backend project

| Setting               | Value                                                                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root Directory        | `backend`                                                                                                                                                                        |
| Framework Preset      | Other                                                                                                                                                                            |
| Build Command         | none                                                                                                                                                                             |
| Entry point           | `backend/api/index.js`, routed via `backend/vercel.json`                                                                                                                         |
| Environment Variables | `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `CORS_ORIGIN` |

`backend/vercel.json` routes every incoming request to the serverless function:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/api/index" }]
}
```

### Deploying updates

Both projects are connected to the same GitHub repository, so any push to the main branch triggers an automatic rebuild and redeploy of both — no manual steps needed for code changes:

```text
git add .
git commit -m "your change"
git push origin main
   │
   ├──→ Vercel rebuilds the frontend project (if frontend/ changed)
   └──→ Vercel rebuilds the backend project  (if backend/ changed)
```

If you only change an **environment variable** (not code) in the Vercel dashboard, you must trigger a manual redeploy — Vercel does not automatically rebuild for env var changes alone.

### Health check

```
GET https://hr-employee-exam-system-server.vercel.app/api/health
```

Returns `{ "success": true, "message": "API is running." }` and does not touch the database — useful for confirming the backend function itself is up before debugging a database or auth issue.

## Troubleshooting

| Symptom                                                  | Check                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend build fails on Vercel                           | Vercel build logs on the frontend project — usually a missing/misnamed import                                                                                                                                                                                                               |
| Backend returns `FUNCTION_INVOCATION_FAILED` / crashes   | Vercel **Logs** tab on the backend project for the actual stack trace                                                                                                                                                                                                                       |
| `Please install mysql2 package manually` in backend logs | Ensure `require("mysql2")` is present near the top of `backend/src/config/database.js` and `config.js` — Vercel's dependency tracer can't detect Sequelize's internal dynamic `require` of the MySQL driver, so this explicit require is required for it to bundle mysql2 into the function |
| Database connection fails only in production             | Confirm `DB_SSL=true` is set on the backend Vercel project, and that `DB_HOST`/`DB_PORT`/credentials match Aiven's current connection info                                                                                                                                                  |
| CORS error in the browser console                        | `CORS_ORIGIN` on the backend must exactly match the deployed frontend's URL (correct protocol, no trailing slash)                                                                                                                                                                           |
| Frontend shows a network error calling the API           | Check `VITE_API_URL` is set correctly on the frontend project, and that you **redeployed** after changing it (env var changes don't rebuild automatically)                                                                                                                                  |
| Env var change has no effect                             | Env vars only apply to new builds — trigger a manual redeploy from the Deployments tab                                                                                                                                                                                                      |
| Works locally, fails on Vercel                           | Compare against the differences documented in [Environment Variables](#environment-variables) — most local/production gaps come down to `DB_SSL`, `CORS_ORIGIN`, or `VITE_API_URL`                                                                                                          |

## License

Add your preferred license here (e.g. MIT) if you plan to make this repository public.
