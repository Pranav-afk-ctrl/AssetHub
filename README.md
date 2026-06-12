# AssetHub — Smart Asset Management and Resource Allocation Platform

> Built for the Cultural Council of IIT Roorkee · Cult Open Projects 2026 · PS-1

AssetHub is a full-stack web application that enables organizations to manage shared resources — from DSLR cameras and audio systems to stage props and event infrastructure — through a centralized, role-based digital platform.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Feature List](#feature-list)
- [Setup Instructions](#setup-instructions)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Docker (Optional)](#docker-optional)
- [Team](#team)

---

## Project Overview

The Cultural Council of IIT Roorkee manages a large pool of shared resources across multiple sections and events. Currently, coordination relies on spreadsheets, manual registers, and fragmented communication. AssetHub replaces this with:

- A centralized inventory for administrators to manage assets
- A booking system for users to request resources for specific durations
- An approval workflow for administrators to review, approve, or reject requests
- An issue and return management system with due date tracking
- An analytics dashboard with real-time utilization insights
- QR code generation for quick asset identification

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI Components | shadcn/ui, Tailwind CSS |
| Charts | Recharts |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (JWT) |
| Authorization | Row Level Security (RLS) |
| QR Codes | qrcode.react, html-to-image |
| Deployment | Lovable (hosted), Docker (local) |

---

## Feature List

### Core Features (Mandatory)

**Authentication**
- User registration and login
- Role-based access: `admin` and `user`
- Secure JWT sessions via Supabase Auth

**Inventory Management (Admin)**
- Add, edit, delete assets
- Categorize assets (Camera, Audio, Lighting, Costume, Props, etc.)
- Manage available quantities
- Asset status tracking (Available, Low Stock, Unavailable)

**Asset Discovery and Booking (User)**
- Browse and search all available assets
- Filter by category and availability
- Request assets for a specific date range
- Overbooking prevention — system blocks requests exceeding available stock

**Approval Workflow (Admin)**
- Review all pending booking requests
- Approve or reject with optional admin notes
- View all active allocations

**Issue and Return Management (Admin)**
- Mark approved bookings as issued
- Record asset returns
- Overdue tracking with visual highlighting
- Inventory counts update automatically at each stage

**Analytics Dashboard (Admin)**
- Summary cards: active bookings, available inventory, overdue returns
- Bar chart: most frequently utilized assets
- Pie chart: booking status distribution
- Line graph: 30-day booking trend

**Borrowing History**
- Users: view personal booking history with status badges
- Admin: system-wide activity log

### Bonus Features

- **QR Code Generation** — Generate and download QR codes for each asset (contains asset ID, name, category)
- **Audit Logs** — All key actions logged (asset creation, approvals, returns)
- **Docker Support** — `docker-compose.yml` for reproducible local setup

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- A Supabase account (free tier works)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/assethub.git
cd assethub
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the migration script:

```bash
# All migrations are in /supabase/migrations/
# Run them in order in the Supabase SQL Editor
```

3. Copy your project credentials:
   - Go to Project Settings → API
   - Copy the **Project URL** and **anon public key**

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Supabase credentials (see [Environment Variables](#environment-variables)).

---

## Running the Application

### Development

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

### Default Admin Setup

After running migrations, create an admin account:

1. Register a new account through the app
2. In Supabase → Table Editor → `user_roles`, set `role = admin` for your user

---

## Database Setup

All migration SQL files are located in `/supabase/migrations/`. Run them in order in the Supabase SQL Editor.

Key tables:
- `profiles` — Extended user information
- `user_roles` — Role assignments (admin/user)
- `assets` — Asset inventory
- `bookings` — Booking requests and lifecycle state
- `audit_logs` — System-wide activity log

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Never commit your `.env` file. The `.env.example` file shows the required variable names.

---

## Docker (Optional)

To run locally with Docker:

```bash
docker compose up
```

This starts the React frontend on port `5173`. Supabase runs as a cloud service; only the frontend is containerized.

```bash
# Stop containers
docker compose down
```

---

## Evaluation Criteria Addressed

| Criterion | Coverage |
|---|---|
| Functionality & Feature Completeness (30%) | All mandatory features implemented |
| System Design & Architecture (20%) | See Design Document |
| Database Design & Backend Logic (15%) | Supabase PostgreSQL with RLS, atomic RPCs |
| User Experience & Interface Design (15%) | shadcn/ui + Tailwind, responsive layout |
| Code Quality & Documentation (10%) | TypeScript, modular components, this README |
| Innovation & Additional Features (10%) | QR codes, audit logs, Docker |

---

## Team

Built for Cult Open Projects 2026, IIT Roorkee.