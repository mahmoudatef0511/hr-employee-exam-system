# HR Exam Evaluation System

A full-stack web app where HR can create exams, assign them to specific employees, and review results, while employees take the exams they've been assigned and view their own scores. Built with a React frontend, an Express/MySQL backend, and a Docker setup so the whole thing runs with one command.

## Features

- **Two roles, one login form** — HR and Employee accounts log in through the same form; the backend figures out which type of account it is.
- **Exam creation (HR)** — create exams and add questions.
- **Exam assignment (HR)** — assign a specific exam to a specific employee, view all currently-open assignments, and unassign one if needed. An employee can only see/take an exam if HR has assigned it to them.
- **Exam taking (Employee)** — answer every question on an assigned exam with `Yes` / `Partial` / `No`. Each assignment can be taken exactly once; once submitted, HR must create a new assignment for the employee to retake it.
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
| Backend     | Node.js, Express, Sequelize ORM (`sequelize-cli` for migrations/seeders) |
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
│   ├── reset-aiven-db.js    # One-off script to drop every table in the configured DB
│   └── src/
│       ├── app.js           # Express app definition (routes, CORS, middleware)
│       ├── server.js        # Local/Docker entry point (app.listen) — not used by Vercel
│       ├── .sequelizerc     # Points sequelize-cli at src/config, src/models, src/migrations, src/seeders
│       ├── config/          # Sequelize runtime config (database.js) + sequelize-cli config (config.js)
│       ├── controllers/     # authController, examController, employeeController, hrController
│       ├── services/        # authService (tokens/login), scoreService (scoring math)
│       ├── models/           # Sequelize models + associations (index.js)
│       ├── routes/           # authRoutes, examRoutes, employeeRoutes, hrRoutes
│       ├── middleware/       # auth (JWT verification), authorize (role check), errorHandler, notFound
│       ├── migrations/       # 10 migration files — see Database Schema below
│       ├── seeders/          # 5 seeder files — see Seeding the Database below
│       └── utils/
└── frontend/                 # React SPA (pages, components, services)
    └── src/
        ├── pages/            # Login, Register, EmployeeDashboard, ExamTaking, HRDashboard, ...
        ├── components/       # Reusable UI pieces (Exam, Submission, ScoreValue, Navbar, ...)
        ├── context/          # AuthContext (holds the logged-in user + tokens)
        └── services/         # api.js (Axios instance), authService.js, examService.js
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

   This creates the tables and adds sample data (see [Seed Accounts](#seed-accounts) below).

5. **Open the app**
   Go to [http://localhost:5173](http://localhost:5173).

### Everyday Docker commands

| Command                                       | Purpose                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `docker compose up`                           | Start (containers already built)                                                          |
| `docker compose up --build`                   | Rebuild images and start — use after installing a new npm package or editing a Dockerfile |
| `docker compose up -d`                        | Start in the background                                                                   |
| `docker compose down`                         | Stop everything (database data is preserved)                                              |
| `docker compose down -v`                      | Stop everything **and delete the database** — use only for a full reset                   |
| `docker compose logs -f backend`              | Follow logs for one service (`backend`, `frontend`, or `db`)                              |
| `docker compose exec backend npm run migrate` | Run pending database migrations                                                           |
| `docker compose exec backend npm run seed`    | Load sample data                                                                          |
| `docker compose exec backend npm run db:reset`| Undo all migrations, re-run them, and reseed — full local reset (see [Migrations](#migrations)) |

You don't need to rebuild after editing frontend or backend source code — both containers watch the mounted source folders and reload automatically. A rebuild is only needed after installing a new dependency or changing a `Dockerfile`.

## Getting Started (Without Docker)

**Requirements:** Node.js 20+, a running MySQL 8 instance.

**Backend:**

```bash
cd backend
cp .env.example .env
# edit .env: set DB_HOST=127.0.0.1, DB_PASSWORD=<your local MySQL password>, etc.
npm install
npm run db:create  # creates the database itself, if it doesn't exist yet
npm run migrate
npm run seed
npm run dev         # starts on http://localhost:5000
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

The seed data also creates sample exams, questions, submissions/answers, and exam assignments — see [Seeding the Database](#seeding-the-database) for exactly what each seeder inserts.

## Environment Variables

None of the real `.env` files are committed — only `.env.example` templates are. Copy each example to a real `.env` locally, and configure the equivalents directly in each Vercel project's dashboard for production (**Settings → Environment Variables**).

### Backend (`backend/.env`)

| Variable                 | Used for                                                         | Local (Docker/`.env`)        | Production (Vercel)                                                    |
| ------------------------ | ---------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `PORT`                   | Port the server listens on (local only — Vercel ignores this)    | `5000`                        | not needed                                                                |
| `DB_HOST`                | Database host                                                    | `db` (Docker) or `127.0.0.1`  | `YOUR_DATABASE_HOST`                                                      |
| `DB_PORT`                | Database port                                                    | `3306`                        | `YOUR_DATABASE_PORT`                                                      |
| `DB_NAME`                | Database name                                                    | your local DB name            | `YOUR_DATABASE_NAME`                                                      |
| `DB_USER`                | Database user                                                    | `root` (Docker default)       | `YOUR_DATABASE_USER`                                                      |
| `DB_PASSWORD`            | Database password                                                | your local password           | `YOUR_DATABASE_PASSWORD`                                                  |
| `DB_SSL`                 | Enables TLS for the MySQL connection (see [Database](#database)) | unset / `false`               | `true`                                                                    |
| `JWT_ACCESS_SECRET`      | Signs access tokens                                              | `YOUR_JWT_SECRET`             | `YOUR_JWT_SECRET` (use a different, strong random value in production)    |
| `JWT_REFRESH_SECRET`     | Signs refresh tokens                                              | `YOUR_JWT_SECRET`             | `YOUR_JWT_SECRET` (different from the access secret)                      |
| `JWT_ACCESS_EXPIRES_IN`  | Access token lifetime                                             | `15m`                          | `15m`                                                                      |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime                                            | `7d`                           | `7d`                                                                       |
| `CORS_ORIGIN`            | Which frontend origin may call the API                            | `http://localhost:5173`        | your deployed frontend URL, e.g. `https://your-frontend.vercel.app`       |

### Frontend (`frontend/.env`)

| Variable       | Used for                                | Local                       | Production (Vercel)                                                            |
| -------------- | ---------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| `VITE_API_URL` | Base URL the frontend calls for the API  | `http://localhost:5000/api`   | your deployed backend URL + `/api`, e.g. `https://your-backend.vercel.app/api`     |

Vite env vars are baked into the build at **build time** — changing `VITE_API_URL` in Vercel requires a redeploy to take effect, not just saving the value.

### Root (`.env`, Docker Compose only)

| Variable                                           | Used for                                         |
| --------------------------------------------------- | --------------------------------------------------- |
| `DB_NAME`                                           | Substituted into the `db` and `backend` services     |
| `DB_ROOT_PASSWORD`                                  | MySQL root password inside the `db` container         |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`          | Substituted into the `backend` service                 |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN`  | Substituted into the `backend` service                 |

This file is only read by `docker-compose.yml` and has no effect on the Vercel deployment.

## API Overview

All endpoints are prefixed with `/api`. Protected endpoints require an `Authorization: Bearer <accessToken>` header.

| Method | Endpoint                     | Access        | Description                                                    |
| ------ | ----------------------------- | -------------- | ------------------------------------------------------------------ |
| GET    | `/health`                     | Public         | Health check — doesn't touch the database                          |
| POST   | `/auth/register`              | Public         | Register a new employee account                                    |
| POST   | `/auth/login`                 | Public         | Log in as HR or Employee                                            |
| POST   | `/auth/refresh`               | Public         | Exchange a refresh token for a new access token                     |
| POST   | `/auth/logout`                | Authenticated  | Invalidate the current refresh token                                 |
| GET    | `/exams`                      | Authenticated  | List exams (HR sees all; employees see only exams currently assigned to them) |
| GET    | `/exams/:id`                  | Authenticated  | Get a single exam (employees only if currently assigned to it)       |
| GET    | `/exams/:id/questions`        | Authenticated  | Get an exam's questions (employees only if currently assigned to it) |
| POST   | `/exams`                      | HR only        | Create an exam                                                       |
| POST   | `/exams/:id/questions`        | HR only        | Add a question to an exam                                             |
| GET    | `/employee/submissions`       | Employee only  | List the current employee's own submissions                          |
| GET    | `/employee/submissions/:id`   | Employee only  | View one of the current employee's own submissions                    |
| POST   | `/employee/exams/:id/submit`  | Employee only  | Submit answers for an assigned exam and get scored                    |
| GET    | `/hr/submissions`             | HR only        | List every submission from all employees                              |
| GET    | `/hr/submissions/:id`         | HR only        | View any submission's full detail                                     |
| GET    | `/hr/employees`               | HR only        | List employees (used to populate the "assign exam" form)              |
| GET    | `/hr/assignments`             | HR only        | List currently-open exam assignments (not yet completed)              |
| POST   | `/hr/assignments`             | HR only        | Assign an exam to an employee (body: `{ employeeId, examId }`)         |
| DELETE | `/hr/assignments/:id`         | HR only        | Remove an exam assignment                                              |

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

**Dropping every table on a remote database:** `backend/reset-aiven-db.js` is a one-off standalone script (not part of the app, and not a migration) that connects using the same `.env` values and drops every table it finds in the configured database. Run it with `node reset-aiven-db.js` from inside `backend/` when you need to wipe a remote (e.g. Aiven) database from scratch before re-running migrations. It is unrelated to `sequelize-cli` and does not touch the local Docker database unless your `.env` is pointed at it.

### Database Schema

The schema is defined entirely through the migrations in `backend/src/migrations/` (see [Migrations](#migrations)) and mirrored by the Sequelize models in `backend/src/models/`. All tables use an auto-incrementing integer `id` as their primary key, plus Sequelize-managed `createdAt` / `updatedAt` timestamps unless noted otherwise.

**`hrs`** — HR user accounts

| Column          | Type         | Notes                              |
| ---------------- | ------------- | ------------------------------------- |
| `id`             | INTEGER, PK   | Auto-increment                        |
| `name`           | STRING        | Not null                              |
| `email`          | STRING        | Not null, unique                      |
| `password`       | STRING        | Not null; bcrypt hash                 |
| `refresh_token`  | STRING        | Nullable; current valid refresh token |

**`employees`** — Employee accounts

| Column          | Type         | Notes                              |
| ---------------- | ------------- | ------------------------------------- |
| `id`             | INTEGER, PK   | Auto-increment                        |
| `name`           | STRING        | Not null                              |
| `email`          | STRING        | Not null, unique                      |
| `password`       | STRING        | Not null; bcrypt hash                 |
| `refresh_token`  | STRING        | Nullable; current valid refresh token |

**`exams`**

| Column        | Type     | Notes            |
| -------------- | --------- | ------------------- |
| `id`           | INTEGER, PK | Auto-increment  |
| `title`        | STRING    | Not null            |
| `description`  | TEXT      | Nullable            |

**`questions`**

| Column           | Type     | Notes                                                                 |
| ----------------- | --------- | --------------------------------------------------------------------------- |
| `id`              | INTEGER, PK | Auto-increment                                                          |
| `exam_id`         | INTEGER   | FK → `exams.id`, not null, `ON DELETE CASCADE`, `ON UPDATE CASCADE`         |
| `question_text`   | TEXT      | Not null                                                                     |

There is intentionally no `correct_answer` column — questions are scored via the employee's own three-level `Yes` / `Partial` / `No` selection rather than an exact-match answer.

**`exam_assignments`** — join table representing "HR assigned this exam to this employee"; an employee can only see/take an exam if a row exists here for them

| Column         | Type     | Notes                                                                              |
| --------------- | --------- | ------------------------------------------------------------------------------------- |
| `id`            | INTEGER, PK | Auto-increment                                                                    |
| `employee_id`   | INTEGER   | FK → `employees.id`, not null, `ON DELETE CASCADE`, `ON UPDATE CASCADE`, indexed      |
| `exam_id`       | INTEGER   | FK → `exams.id`, not null, `ON DELETE CASCADE`, `ON UPDATE CASCADE`, indexed          |
| `assigned_by`   | INTEGER   | FK → `hrs.id`, nullable, `ON DELETE SET NULL`, `ON UPDATE CASCADE` (audit trail; survives HR account deletion) |
| `assigned_at`   | DATE      | Not null, defaults to now                                                              |
| `completed_at`  | DATE      | Nullable. `NULL` = assignment is still open; set to a timestamp the moment the employee submits it |

Indexes: `idx_exam_assignments_employee_id`, `idx_exam_assignments_exam_id`, and a composite `idx_exam_assignments_employee_exam_completed` on `(employee_id, exam_id, completed_at)`, which backs the "does this employee have an active assignment for this exam" lookup used throughout the app.

There is **no** unique constraint on `(employee_id, exam_id)` — an exam can be assigned to the same employee more than once over time (e.g. reassigned after completion), as long as at most one of those assignments is open (`completed_at IS NULL`) at a time. That single-open-assignment rule is enforced at the application level (in `hrController.assignExam`), not by a database constraint.

**`submissions`** — one row per completed exam attempt

| Column           | Type            | Notes                                                                                       |
| ----------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `id`              | INTEGER, PK      | Auto-increment                                                                                 |
| `employee_id`     | INTEGER          | FK → `employees.id`, not null, `ON DELETE CASCADE`, `ON UPDATE CASCADE`                            |
| `exam_id`         | INTEGER          | FK → `exams.id`, not null, `ON DELETE CASCADE`, `ON UPDATE CASCADE`                                |
| `assignment_id`   | INTEGER          | FK → `exam_assignments.id`, nullable, `ON DELETE SET NULL`, `ON UPDATE CASCADE`, unique. Links a submission to the exact assignment it was an attempt for. Nullable only for pre-existing/backfilled rows whose assignment may since have been removed — every new submission always sets it |
| `submitted_at`    | DATE             | Not null, defaults to now                                                                          |
| `score`           | DECIMAL(3,1)     | Not null, default `0`. Normalized final score on a 0–5 scale (e.g. `3.5`); can be fractional        |
| `total_questions` | INTEGER          | Not null, default `0`                                                                              |

The unique constraint on `assignment_id` (`unique_submission_per_assignment`) is the database-level backstop for "one assignment = at most one attempt", in addition to the application-level check in `employeeController.submitExam`. MySQL allows multiple `NULL`s through a unique index, so this doesn't affect legacy rows that aren't linked to an assignment.

`score` was originally an `INTEGER`; a later migration widened it to `DECIMAL(3,1)` once scoring was normalized onto a 0–5 scale that can produce fractional values (e.g. 3.3, 3.8). The Sequelize model exposes it as a JS number via a custom getter, since Sequelize returns `DECIMAL` columns as strings by default.

**`answers`** — one row per question answered within a submission

| Column           | Type                              | Notes                                                                    |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| `id`              | INTEGER, PK                         | Auto-increment                                                              |
| `submission_id`   | INTEGER                             | FK → `submissions.id`, not null, `ON DELETE CASCADE`, `ON UPDATE CASCADE`   |
| `question_id`     | INTEGER                             | FK → `questions.id`, not null, `ON DELETE CASCADE`, `ON UPDATE CASCADE`     |
| `answer`          | ENUM(`'Yes'`, `'Partial'`, `'No'`)  | Not null. `Yes` = 2 points, `Partial` = 1 point, `No` = 0 points             |

### Models and Relationships

Associations are defined centrally in `backend/src/models/index.js`:

- **Exam 1:N Question** — `Exam.hasMany(Question, { as: 'questions' })`, cascades on delete.
- **Employee 1:N Submission** — `Employee.hasMany(Submission, { as: 'submissions' })`, cascades on delete.
- **Exam 1:N Submission** — `Exam.hasMany(Submission, { as: 'submissions' })`, cascades on delete.
- **Submission 1:N Answer** — `Submission.hasMany(Answer, { as: 'answers' })`, cascades on delete.
- **Question 1:N Answer** — `Question.hasMany(Answer, { as: 'answers' })`, cascades on delete.
- **Employee N:M Exam**, through `ExamAssignment` — `Employee.belongsToMany(Exam, { as: 'assignedExams' })` / `Exam.belongsToMany(Employee, { as: 'assignedEmployees' })`. The through model is also exposed directly so controllers can query/create individual assignment rows (list assignments, check access, unassign).
- **Employee 1:N ExamAssignment** and **Exam 1:N ExamAssignment** — direct associations to the join table itself, both cascading on delete.
- **HR 1:N ExamAssignment** (`as: 'assignmentsMade'`, foreign key `assignedBy`) — no cascade; an assignment survives if the HR account that created it is later removed (`ON DELETE SET NULL` at the DB level).
- **ExamAssignment 1:1 Submission** (`as: 'submission'`) — one assignment has at most one submission, enforced by the unique constraint on `submissions.assignment_id`.

## Migrations

Migrations live in `backend/src/migrations/` and run in filename order (each is timestamp-prefixed). `backend/.sequelizerc` points `sequelize-cli` at `src/config/config.js`, `src/models`, `src/migrations`, and `src/seeders`, so all `sequelize-cli` / `npm run migrate*` commands below must be run from inside `backend/`.

| # | File                                                        | What it does                                                                                          |
| - | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| 1 | `20260101000001-create-hrs.js`                                | Creates `hrs`                                                                                            |
| 2 | `20260101000002-create-employees.js`                          | Creates `employees`                                                                                      |
| 3 | `20260101000003-create-exams.js`                               | Creates `exams`                                                                                          |
| 4 | `20260101000004-create-questions.js`                           | Creates `questions`, FK to `exams`                                                                       |
| 5 | `20260101000005-create-submissions.js`                         | Creates `submissions`, FKs to `employees` and `exams`, `score` starts as `INTEGER`                        |
| 6 | `20260101000006-create-answers.js`                             | Creates `answers`, FKs to `submissions` and `questions`, `answer` as an ENUM                             |
| 7 | `20260101000007-alter-submissions-score-precision.js`          | Widens `submissions.score` from `INTEGER` to `DECIMAL(3,1)` for the normalized 0–5 scale                 |
| 8 | `20260101000008-create-exam-assignments.js`                    | Creates `exam_assignments`, FKs to `employees`/`exams`/`hrs`, plus a (later-removed) unique constraint on `(employee_id, exam_id)` |
| 9 | `20260101000009-alter-exam-assignments-add-completed-at.js`    | Adds dedicated single-column indexes on `employee_id`/`exam_id` (needed before the drop below, since MySQL won't drop an index still backing a FK), drops the old unique `(employee_id, exam_id)` constraint, adds `completed_at`, and adds the composite `(employee_id, exam_id, completed_at)` index |
| 10 | `20260101000010-alter-submissions-add-assignment-id.js`        | Adds `submissions.assignment_id` (FK → `exam_assignments.id`, unique), then backfills it by matching each pre-existing submission to its `(employee_id, exam_id)` assignment and marking that assignment completed |

Migrations 7–10 reflect the two most recent schema changes: normalizing scores onto a 0–5 decimal scale, and introducing the exam-assignment workflow (an employee must be assigned an exam by HR before taking it, and each assignment can be completed at most once).

### Commands

All commands below are defined in `backend/package.json` and run from inside `backend/`:

| Command               | Runs                                              | Purpose                                                                 |
| ---------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- |
| `npm run db:create`    | `sequelize-cli db:create`                            | Creates the database itself (using `DB_NAME` from `.env`), if it doesn't exist yet |
| `npm run migrate`      | `sequelize-cli db:migrate`                           | Runs all pending migrations, in order                                        |
| `npm run migrate:undo` | `sequelize-cli db:migrate:undo:all`                  | Reverts **every** migration, in reverse order                                |
| `npm run seed`         | `sequelize-cli db:seed:all`                          | Runs all seeders, in order                                                   |
| `npm run seed:undo`    | `sequelize-cli db:seed:undo:all`                     | Reverts all seeders                                                          |
| `npm run db:reset`     | `migrate:undo` → `migrate` → `seed`                  | Full local reset: drops all tables' data structure, rebuilds it, and reseeds |

To undo just the **most recent** migration or seeder instead of all of them, call `sequelize-cli` directly (there's no dedicated npm script for this):

```bash
npx sequelize-cli db:migrate:undo        # reverts only the last-applied migration
npx sequelize-cli db:seed:undo           # reverts only the last-applied seeder
```

### Seeding the Database

Seeders live in `backend/src/seeders/` and also run in filename order:

| File                                          | Inserts                                                                                                   |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `20260101000010-seed-hrs.js`                    | One HR account: `hr@example.com`                                                                                 |
| `20260101000011-seed-employees.js`              | Two employee accounts: `john@example.com`, `sarah@example.com`                                                    |
| `20260101000012-seed-exams-and-questions.js`    | Two exams ("JavaScript Basics", "Node.js Basics") with their questions                                            |
| `20260101000013-seed-submissions-and-answers.js`| One sample submission + its answers for each of the two seeded employees, demonstrating the normalized 0–5 scoring |
| `20260101000014-seed-exam-assignments.js`       | Three exam assignments: John → JS Basics (matches his existing submission), Sarah → Node.js Basics (matches her existing submission), and John → Node.js Basics (left open, so the dashboard shows both a completed submission and an available exam at once) |

All seeded passwords are `password123` (bcrypt-hashed before insert). See [Seed Accounts](#seed-accounts) for login credentials.

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

**Database changes:** Vercel deploys never run migrations. After pushing a new migration, apply it to the production database yourself as described in [Database](#database) before (or right after) the code that depends on it goes live.

### Health check

```
GET https://hr-employee-exam-system-server.vercel.app/api/health
```

Returns `{ "success": true, "message": "API is running." }` and does not touch the database — useful for confirming the backend function itself is up before debugging a database or auth issue.

## Troubleshooting

| Symptom                                                  | Check                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend build fails on Vercel                            | Vercel build logs on the frontend project — usually a missing/misnamed import                                                                                                                                                                                                               |
| Backend returns `FUNCTION_INVOCATION_FAILED` / crashes    | Vercel **Logs** tab on the backend project for the actual stack trace                                                                                                                                                                                                                       |
| `Please install mysql2 package manually` in backend logs  | Ensure `require("mysql2")` is present near the top of `backend/src/config/database.js` and `config.js` — Vercel's dependency tracer can't detect Sequelize's internal dynamic `require` of the MySQL driver, so this explicit require is required for it to bundle mysql2 into the function |
| Database connection fails only in production              | Confirm `DB_SSL=true` is set on the backend Vercel project, and that `DB_HOST`/`DB_PORT`/credentials match Aiven's current connection info                                                                                                                                                  |
| CORS error in the browser console                         | `CORS_ORIGIN` on the backend must exactly match the deployed frontend's URL (correct protocol, no trailing slash)                                                                                                                                                                           |
| Frontend shows a network error calling the API            | Check `VITE_API_URL` is set correctly on the frontend project, and that you **redeployed** after changing it (env var changes don't rebuild automatically)                                                                                                                                  |
| Env var change has no effect                               | Env vars only apply to new builds — trigger a manual redeploy from the Deployments tab                                                                                                                                                                                                      |
| `MySQL error: needed in a foreign key constraint` when migrating manually | If writing a new migration that drops an index on `exam_assignments`, add dedicated single-column indexes on the FK columns first, the same way `20260101000009-alter-exam-assignments-add-completed-at.js` does — MySQL refuses to drop an index still backing a FK |
| Employee can't see/take an exam they expect to             | Confirm HR has an **open** assignment for them (`GET /hr/assignments`) — access is driven entirely by `exam_assignments` rows with `completed_at IS NULL`, not just exam existence                                                                                                          |
| "This exam is already currently assigned to this employee" on reassignment | An open (`completed_at IS NULL`) assignment for that employee/exam pair already exists; either wait for it to be completed or remove it via `DELETE /hr/assignments/:id` first                                                                                                              |
| Works locally, fails on Vercel                              | Compare against the differences documented in [Environment Variables](#environment-variables) — most local/production gaps come down to `DB_SSL`, `CORS_ORIGIN`, or `VITE_API_URL`                                                                                                          |

## License

Add your preferred license here (e.g. MIT) if you plan to make this repository public.
