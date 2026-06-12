# Asset Management

A React + Supabase application for tracking physical assets, managing booking requests, and maintaining an auditable inventory ledger. Administrators approve bookings through atomic database transactions, generate QR labels for assets, and rely on scheduled jobs to flag overdue returns.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, React Router |
| Backend | Supabase (Postgres RPC, Edge Functions) |
| Database | PostgreSQL (Supabase Postgres image locally) |
| Auth | Supabase Auth |
| DevOps | Docker Compose, Supabase CLI migrations |

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) and Docker Compose
- [Supabase CLI](https://supabase.com/docs/guides/cli) (for migrations and Edge Functions)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd asset-management
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your Supabase project URL and keys. When using the Supabase CLI locally, run `supabase start` and copy the printed `anon` and `service_role` keys into `.env`.

### 3. Start local services

```bash
docker compose up --build
```

This starts:

- **Frontend** at [http://localhost:5173](http://localhost:5173) with hot reload via volume mounts
- **Postgres** on port `54322` using the `supabase/postgres` image

For the full Supabase stack (Auth, REST, Edge Functions, cron), run in a separate terminal:

```bash
supabase start
supabase functions deploy detect-overdue
```

### 4. Apply database migrations

```bash
supabase db reset
# or, against a linked remote project:
supabase db push
```

Migrations create the `assets`, `bookings`, and `audit_logs` tables plus the `approve_booking` RPC function.

### 5. Install frontend dependencies (optional, outside Docker)

```bash
cd frontend
npm install
npm run dev
```

## Features

### Core Features

- Asset inventory with available quantity tracking
- Booking request workflow (pending → approved → issued → returned)
- **Atomic booking approval** via `approve_booking` RPC — rechecks inventory, decrements stock, updates status, and writes audit logs in one transaction
- Admin pages at `/admin/assets` and `/admin/bookings`
- Supabase Auth integration

### Bonus Features

- **Overdue detection** — daily Edge Function cron job logs `overdue_detected` audit entries for issued bookings past their end date
- **QR code generation** — per-asset QR modal with JSON payload (`asset_id`, `asset_name`, `category`) and PNG download via `html-to-image`
- Docker Compose local development with env-file configuration and hot reload

## Screenshots

<!-- Replace with actual screenshots -->
| Page | Preview |
| --- | --- |
| Admin Assets | _Screenshot placeholder_ |
| QR Code Modal | _Screenshot placeholder_ |
| Bookings Approval | _Screenshot placeholder_ |

## Project Structure

```
asset-management/
├── docker-compose.yml
├── .env.example
├── frontend/                 # Vite + React app
│   └── src/
│       ├── lib/supabase.ts   # Client + approveBooking RPC call
│       ├── pages/admin/      # Assets & Bookings admin UI
│       └── components/       # QrCodeModal
└── supabase/
    ├── migrations/           # Schema + approve_booking RPC
    └── functions/
        └── detect-overdue/   # Cron Edge Function
```

## License

MIT
