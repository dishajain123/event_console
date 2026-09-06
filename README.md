# Event Console

Operations and finance web console for the Event Platform. The console is a Next.js 16 application and uses the Event Platform Backend as its only source of truth for events, registrations, payments, tickets, check-ins, feedback, sponsorships, volunteers, users, staff assignments, reports, and configuration.

## Prerequisites

- Node.js 20.9 or newer
- npm
- A running instance of `event-platform-backend`
- A console-eligible account with a global Operations, Super Admin, or Finance role, or an event-scoped Event Manager role

## Install

```bash
cd /Users/dishajain/Desktop/event-console
npm install
cp .env.local.example .env.local
```

Set the backend URL in `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001/api/v1
```

Use the actual reachable backend URL when the backend runs on another machine or port. Do not put secrets in `NEXT_PUBLIC_*` variables.

## Run Locally

Start the backend first, then run the console:

```bash
npm run dev
```

Open `http://localhost:3000`.

The login flow uses the backend mobile-number OTP endpoints. In development, use the OTP printed by the backend's configured development SMS behavior. After authentication, the console loads role assignments from the backend and redirects the user to the appropriate Operations or Finance area.

## Production Build

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

Run `start` only after a successful `build`. Configure `NEXT_PUBLIC_API_BASE_URL` to the production API before building.

## Authentication and Authorization

- Access tokens are attached by `src/api/client.ts`.
- Refresh tokens are stored in the `console_refresh_token` HTTP-only cookie through the Next.js `/api/auth/*` routes.
- The Next.js proxy prevents unauthenticated page rendering, but it is not the security boundary.
- Every protected API request is authorized by the backend.
- Operations and Super Admin users can access authorized global Operations surfaces.
- Finance roles access finance and refund surfaces according to backend permissions.
- Event Managers are limited to their active assigned event IDs. Changing an event ID in a URL, query string, filter, pagination request, or direct resource request must still be rejected by the backend.

Do not implement permission decisions by adding frontend-only filters. If a screen needs a new scope, add or reuse the corresponding backend authorization rule first.

## Main Areas

- Operations: events, categories/subcategories, event configuration, registrations, teams, feedback, sponsors, volunteers, staff, communications, reports, audit logs, and accounts.
- Finance: transactions, refunds, reconciliation, accounts, and financial reports.
- Event-scoped operations: event detail, registration operations, event configuration, feedback, staff, volunteers, check-ins, sponsors, and operational reports.

## Data and API Conventions

- All API calls use the versioned backend prefix configured by `NEXT_PUBLIC_API_BASE_URL`.
- IDs are backend UUIDs; do not generate event, registration, payment, ticket, or user IDs in the browser.
- Statuses and enums in `src/types` mirror backend response schemas.
- Registration, payment, ticket, refund, and check-in status must be rendered from backend responses and refreshed after mutations.
- Error responses are normalized by the shared API client from `{ error_code, message }`.

## Troubleshooting

### API requests fail with connection errors

Confirm the backend is running, confirm the URL in `.env.local`, and verify that the browser can reach that host and port. Restart the Next.js dev server after changing environment variables.

### The user is redirected to `/no-access`

The mobile number is authenticated but has no console role assignment. Assign the appropriate backend role and sign in again.

### Data is missing for an Event Manager

Confirm the user has an active Event Manager assignment for the event. The console intentionally cannot broaden backend scope through filters or direct IDs.

### CORS or cookie problems

Check backend CORS settings and use the same browser origin consistently. The console refresh cookie is issued by the console origin; access tokens are sent to the configured backend API.

## Repository Structure

```text
src/api/          Typed backend API clients
src/hooks/        React Query queries and mutations
src/types/        Backend-aligned TypeScript models and enums
src/app/ops/      Operations pages
src/app/finance/  Finance pages
src/app/api/auth/ Next.js auth proxy routes
src/components/   Shared UI and authorization guards
```

## Validation Checklist

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Then manually verify login, role-based navigation, event-scoped filtering, registration/payment/ticket/check-in views, refunds, feedback, sponsorships, and volunteer management against a running backend.
