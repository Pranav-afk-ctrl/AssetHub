# AssetHub — Asset Management System

AssetHub is a full-stack asset booking and allocation platform. Employees browse available company assets, request bookings, and track their reservations. Administrators manage inventory, approve requests, issue and return items, and monitor system activity through an analytics dashboard.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite 7 |
| Routing / SSR | TanStack Router, TanStack Start |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Backend / DB | Supabase (PostgreSQL, Auth, RLS) |
| Charts | Recharts |
| QR Codes | qrcode.react, html-to-image |
| Forms / Validation | React Hook Form, Zod |
| Tooling | ESLint, Prettier, Docker |

## Prerequisites

- **Node.js** 22.12+ (recommended; TanStack Start requires Node 22+)
- **npm** 10+
- A **Supabase** project with migrations applied
- **Docker** and **Docker Compose** (optional, for containerized local dev)

## Setup

### 1. Clone and install

```bash
git clone <repository-url>
cd mindful-deploy
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Get your project URL and anon key from the [Supabase dashboard](https://supabase.com/dashboard) → Project Settings → API.

### 3. Apply database migrations

If using the Supabase CLI locally:

```bash
supabase db push
```

Or run the SQL files in `supabase/migrations/` against your project via the Supabase SQL editor.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Run with Docker (optional)

```bash
docker compose up
```

The Vite dev server is exposed on port **5173**.

### 6. Create an admin user

After signing up, promote a user to admin in the Supabase SQL editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<your-user-uuid>', 'admin');
```

## Features

### Core

- **Authentication** — Email/password sign-up and sign-in via Supabase Auth
- **Role-based access** — Separate user and admin experiences with RLS policies
- **Asset catalog** — Browse active assets with search and category filters
- **Booking requests** — Users request assets with quantity, dates, and purpose
- **Pending approvals** — Admins approve or reject booking requests
- **Atomic approval** — `approve_booking` RPC decrements inventory and logs audit entries in one transaction
- **Allocations** — Issue approved bookings and mark returns with inventory restoration
- **Overdue detection** — Issued bookings past due date are highlighted in the allocations table
- **Admin asset CRUD** — Create, edit, and delete assets with quantity tracking
- **User dashboard** — Personal booking summary and history
- **My bookings** — Users view and cancel pending requests
- **Audit log** — Admin activity feed backed by `audit_logs` and `log_audit` RPC

### Bonus

- **Analytics dashboard** — Stats row, top assets chart, booking status pie, 30-day trend line, overdue returns table
- **QR code generation** — Per-asset QR codes (JSON payload) with PNG download on the admin assets page
- **Status badges** — Color-coded booking and asset status indicators
- **Docker Compose** — One-command local development environment
- **SSR-ready** — TanStack Start with server-side Supabase client support

## Screenshots

| Dashboard | Admin Analytics |
| --- | --- |
| _Add screenshot: `docs/screenshots/user-dashboard.png`_ | _Add screenshot: `docs/screenshots/admin-dashboard.png`_ |

| Asset Catalog | Allocations |
| --- | --- |
| _Add screenshot: `docs/screenshots/asset-catalog.png`_ | _Add screenshot: `docs/screenshots/allocations.png`_ |

| QR Code Modal | Pending Approvals |
| --- | --- |
| _Add screenshot: `docs/screenshots/qr-modal.png`_ | _Add screenshot: `docs/screenshots/pending-approvals.png`_ |

## Project Structure

```
src/
  components/          # UI components (dashboard charts, QR dialog, etc.)
  routes/              # TanStack Router file-based routes
  integrations/        # Supabase client and auth middleware
  lib/                 # Utilities (audit, bookings, utils)
supabase/
  migrations/          # PostgreSQL schema and RPC functions
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |

## License

MIT License

Copyright (c) 2026 AssetHub contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
