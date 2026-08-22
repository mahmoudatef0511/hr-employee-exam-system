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

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Axios |
| Backend | Node.js, Express, Sequelize ORM |
| Database | MySQL 8.0 |
| Auth | JSON Web Tokens (access + refresh), bcrypt password hashing |
| Infra | Docker & Docker Compose |

## Project Structure

```text
project/
├── docker-compose.yml       # Orchestrates db + backend + frontend
├── backend/                 # Express API (routes, controllers, services, models)
│   └── src/
└── frontend/                 # React SPA (pages, components, services)
    └── src/
```

See inline comments throughout the code for details on individual files — the codebase is organized by responsibility (`routes/` → `controllers/` → `services/` → `models/` on the backend; `pages/` → `components/` → `services/` on the frontend).

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

| Command | Purpose |
|---|---|
| `docker compose up` | Start (containers already built) |
| `docker compose up --build` | Rebuild images and start — use after installing a new npm package or editing a Dockerfile |
| `docker compose up -d` | Start in the background |
| `docker compose down` | Stop everything (database data is preserved) |
| `docker compose down -v` | Stop everything **and delete the database** — use only for a full reset |
| `docker compose logs -f backend` | Follow logs for one service (`backend`, `frontend`, or `db`) |
| `docker compose exec backend npm run migrate` | Run database migrations |
| `docker compose exec backend npm run seed` | Load sample data |

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

| Role | Email | Password |
|---|---|---|
| HR | `hr@example.com` | `password123` |
| Employee | `john@example.com` | `password123` |
| Employee | `sarah@example.com` | `password123` |

New employee accounts can also self-register from the login page. HR accounts are not self-registrable — they only come from the seed data (or would need to be added directly, e.g. via a future admin flow).

## Environment Variables

| File | Used for | Key variables |
|---|---|---|
| `.env` (root) | Docker Compose substitution | `DB_NAME`, `DB_ROOT_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |
| `backend/.env` | Running the backend without Docker | `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_*`, `CORS_ORIGIN` |
| `frontend/.env` | Running the frontend without Docker | `VITE_API_URL` |

None of the real `.env` files are committed — only `.env.example` templates are. Copy each example to a real `.env` before running the project.

## API Overview

All endpoints are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <accessToken>` header.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new employee account |
| POST | `/auth/login` | Public | Log in as HR or Employee |
| POST | `/auth/refresh` | Public | Exchange a refresh token for a new access token |
| POST | `/auth/logout` | Authenticated | Invalidate the current refresh token |
| GET | `/exams` | Authenticated | List all exams |
| GET | `/exams/:id` | Authenticated | Get a single exam |
| GET | `/exams/:id/questions` | Authenticated | Get an exam's questions |
| POST | `/exams` | HR only | Create an exam |
| POST | `/exams/:id/questions` | HR only | Add a question to an exam |
| GET | `/employee/submissions` | Employee only | List the current employee's own submissions |
| GET | `/employee/submissions/:id` | Employee only | View one of the current employee's own submissions |
| POST | `/employee/exams/:id/submit` | Employee only | Submit answers for an exam and get scored |
| GET | `/hr/submissions` | HR only | List every submission from all employees |
| GET | `/hr/submissions/:id` | HR only | View any submission's full detail |

Every response follows the same shape: `{ success: boolean, message: string, data | errors }`.

## Scoring Logic

Each answer is worth a fixed number of points regardless of the question:

| Answer | Points |
|---|---|
| Yes | 2 |
| Partial | 1 |
| No | 0 |

The raw score is normalized onto a **0–5 scale**, so exams with different numbers of questions remain comparable:

```text
score = round( (rawScore / (numberOfQuestions * 2)) * 5, 1 decimal place )
```

## License

Add your preferred license here (e.g. MIT) if you plan to make this repository public.
