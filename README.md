# DocuChat

AI-powered document Q&A  Chat

## Technology
API built with Express, TypeScript, Prisma, Redis, BullMQ, Axios and PostgreSQL.

## Prerequisites

- Node.js 20 or later
- npm
- Docker (recommended for PostgreSQL) or a local Postgres instance
- Git

## 1. Clone

```bash
git clone https://github.com/peculiaruc/Docuchat-1.git
cd Docuchat-1
```

## 2. Install

```bash
npm install
```

`postinstall` runs `prisma generate` so the Prisma Client is created automatically.

## 3. PostgreSQL

Start a local database (one-time):

```bash
docker run --name docuchat-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=capstone \
  -p 5432:5432 \
  -d postgres:16
```

If port `5432` is already in use, map another host port (for example `5433:5432`) and use that port in `DATABASE_URL`.

Start an existing container later with:

```bash
docker start docuchat-pg
```

## 4. Environment

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | Postgres URL, e.g. `postgresql://postgres:postgres@127.0.0.1:5432/capstone` |
| `JWT_SECRET` | At least 32 characters |
| `JWT_ACCESS_SECRET` | At least 32 characters; different from the refresh secret |
| `JWT_REFRESH_SECRET` | At least 32 characters; different from the access secret |

`PORT` defaults to `3000`.

## 5. Migrate

Apply the Prisma schema to your database:

```bash
npx prisma migrate dev
```

If you only need to sync the schema locally and do not want a new migration file:

```bash
npx prisma db push
```

## 6. Seed

```bash
npx prisma db seed
```

This creates a demo account you can use immediately:

- **Email:** `demo@docuchat.dev`
- **Password:** `DemoPass1!`

Re-running seed updates that user and does not duplicate it.

## 7. Run

```bash
npm run dev
```

The server listens on `http://localhost:3000`.

| URL | Purpose |
| --- | --- |
| [http://localhost:3000/health](http://localhost:3000/health) | Health check |
| [http://localhost:3000/api-docs](http://localhost:3000/api-docs) | Swagger UI |
| [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json) | OpenAPI JSON |
| `/api/v1/auth` | Register, login, refresh, logout |
| `/api/v1/documents` | Documents (JWT required) |
| `/api/v1/conversations` | Conversations (JWT required) |

Example login:

```bash
curl.exe --% -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" -d "{\"email\":\"demo@docuchat.dev\",\"password\":\"DemoPass1!\"}"
```

## Tests

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Start Postgres first (`docker start docuchat-pg`). Tests use the `capstone_test` database from `.env.test`.

## Project layout

```
src/           API server, routes, services, middleware
prisma/        Schema, migrations, seed
tests/         Integration tests and helpers
src/docs/      OpenAPI spec
```
