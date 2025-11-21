# CartSystem (Demo Build)
This repository is a **demo-only** snapshot of the CartSystem platform. It mirrors the production architecture but replaces sensitive configuration, data seeds, and several business flows with safe defaults so it can be shared publicly. Use it for reference, walkthroughs, or experimentation—not as a drop-in replacement for the original service. High-level architecture and day-two operations live under `docs/overview.md` and `docs/maintenance.md`.

- Secrets and SMTP credentials are placeholders.
- Database schema/data are expected to be recreated locally.
- Token lifetimes, checkout, and billing flows are tuned for short demo cycles.

CartSystem remains a full-stack shopping cart and billing platform: the backend is an Express/MySQL API covering authentication, catalog data, carts, checkout, invoicing, dashboards, and messaging, while the frontend is an Angular 17 SPA with dedicated modules for end users, admins, and shared UI. Bills are rendered with EJS templates, converted into PDFs with `html-pdf`, and emailed (if you wire credentials) via Nodemailer.

## Demo-Specific Flow Adjustments
- **Authentication**: Access tokens expire in minutes (`0.01h`) to force rapid refresh cycles during demos; refresh tokens inherit short lifetimes as well.
- **Checkout & Billing**: `/bill/GenerateReport` still writes PDFs to `backend/Generatedpdf`, but the email transport uses obvious placeholders (see `routes/bill.js`) and logs success/failure into the `emailSent` table instead of shipping real mail.
- **Shared Services**: Some Angular services (e.g., `SharedCoreService`) are intentionally scoped and wired manually for experimentation, so the DI pattern differs from the production build.
- **Real-time Messenger & Approvals**: Group chat, approval status, and typing indicators are powered by Socket.IO. Events are centralized through `backend/socket.js` (server) and `client/src/app/sharedModule/sharedServices/socket.service.ts` (client), with strict DTOs for every payload.
- **Environment Binding**: The backend binds to the host defined in `client/src/environments/enviroment.js`, making it easy to present the API on a LAN/IP chosen for demos.
- **Data Hygiene**: Debug/spec folders are included so you can stub or mock endpoints quickly without touching main modules.
- **Database Bootstrap**: `server.js` now creates the configured MySQL schema (if missing) and runs `backend/database/seed.js` on startup so demo accounts, payment statuses, showcase groups, and sample messages are always available.

## Tech Stack
- Node.js 18+ / Express 4 for the REST API (`backend/`)
- MySQL 5.7+/8.0 for persistence (`backend/connection.js`)
- Angular 17 + RxJS for the client (`client/`)
- jsonwebtoken for access/refresh tokens (`backend/services/authentication.js`, `routes/user.js`)
- Socket.IO 4 for bidirectional events (`backend/socket.js`, `client/src/app/sharedModule/sharedServices/socket.service.ts`)
- EJS + html-pdf + PhantomJS for invoice rendering (`backend/routes/bill.js`, `routes/report.ejs`)
- Nodemailer for transactional email (`backend/routes/user.js`, `routes/bill.js`)

## Repository Layout
- `backend/` – Express app, routes, JWT middleware, MySQL connection, PDF/email helpers, and generated invoices (`Generatedpdf/`).
  - `server.js` boots the API on `process.env.PORT` and binds to the host exported from `client/src/environments/enviroment.js`.
  - `index.js` wires all route modules (`users`, `category`, `product`, `cart`, `checkout`, `bill`, `dashboard`, `count`, `message`).
  - `routes/` contains feature-specific route handlers (category/product CRUD, billing, cart, checkout, dashboard metrics, messenger, etc.).
  - `services/authentication.js` and `services/checkRole.js` implement JWT validation and role-based authorization.
  - `socket.js` exposes `setIO`/`getIO` so any route can emit centralized Socket.IO events without circular dependencies.
- `client/` – Angular workspace split into feature modules:
  - `userModule` handles login, signup, forgot-password, and messenger UI.
  - `cartSystemModule` covers storefront browsing, cart, checkout, billing flows, and product/category screens.
  - `adminModule` exposes dashboards, approvals, and counts for administrators.
  - `sharedModule` contains layout (header/footer/sidebar), guards, interceptors, shared services, and UI utilities.
  - `sharedModule/guards` enforce JWT state, refresh tokens, and user presence before navigation.
- `client/src/app/sharedModule/sharedServices/api.dto.ts` & `socket.dto.ts` define all API and Socket.IO payload contracts consumed across modules.
- `README.md` – this document.

## Feature Highlights
- **Authentication & Authorization**: Username/password login with JWT access tokens and short-lived refresh tokens (`/users/login`, `/users/refresh-token`). Admin approval required before accounts become active.
- **Role enforcement**: `CheckRole` middleware blocks user-only accounts from calling admin endpoints; `process.env.USER` defines the non-admin role string.
- **Catalog Management**: `/category` and `/product` routes allow admins to add, update, list, and soft-remove inventory; Angular catalog module mirrors the workflow.
- **Cart & Checkout**: `/cart` endpoints let users manage `user_cart` entries, mark items for checkout, and proceed to payment confirmation.
- **Billing & Invoicing**: `/bill/GenerateReport` aggregates checkout items, persists a `bill` record, renders an EJS template to PDF (stored in `backend/Generatedpdf`), emails the invoice, and resets the cart. `/bill/getPdf` regenerates/downstreams invoices with role-aware access control.
- **Dashboard & Counts**: `/dashboard/details` and `/count` summarize total categories, products, bills, and other KPIs for the admin dashboard.
- **Messaging & Approvals in Real Time**: Socket.IO rooms broadcast group creation, join requests, approvals, new members, messages, and typing indicators (`messenger:*` + `approval:*` namespaces). Angular listens through `SocketService`, with DTOs guarding compile-time safety.
- **Type-Safe Angular DTOs**: Every Angular service/component imports shared DTOs instead of `any`, aligning UI expectations with backend responses and preventing template errors.
- **Angular SPA**: Routing and shared services wrap all API calls via module-specific `*-end-point.service.ts` files that reuse the base URL from `src/environments/environment.ts`.

## Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 17 (`npm install -g @angular/cli`)
- MySQL server with a database (default `mydb` as referenced in `backend/connection.js`)
- Optionally Nodemailer-compatible SMTP credentials (Gmail/app password, Mailtrap, etc.)

## Initial Setup
1. **Clone & Install**
   ```powershell
   git clone <repo>
   cd CartSystem

   cd backend
   npm install

   cd ..\client
   npm install
   ```
2. **Database**
   - Ensure the MySQL user in `backend/connection.js` (or `.env`) can create databases. `server.js` automatically issues `CREATE DATABASE IF NOT EXISTS <name>` based on `config/database`.
   - On first boot the server also runs `backend/database/seed.js`, inserting demo admins/users, categories, products, chat groups, sample messages, and `PaymentStatus` rows. Re-run manually anytime with `cd backend && node database/seed.js`.
3. **Backend environment**
   - Copy `.env.example` (create one if missing) into `backend/.env` with:
     ```
     PORT=8080
     ACCESS_TOKEN=<jwt-access-secret>
     secretKey=<jwt-refresh-secret>
     EMAIL=<smtp-user>
     PASSWORD=<smtp-password-or-app-pass>
     USER=user        # role string treated as “non-admin” in CheckRole
     ```
   - `server.js` also reads the binding host from `client/src/environments/enviroment.js` (`localhost` by default). Update if you want to expose a different IP.
4. **Frontend environment**
   - Update `client/src/environments/environment.ts` (and `environment.prod.ts`) to point `baseUrl` to your backend origin, e.g. `http://localhost:8080`.
   - The user module looks for `loginUrl`, so keep `/login` unless your reverse proxy rewrites auth routes.

## Running Locally
1. **Backend**
   ```powershell
   cd backend
   npm run start    # runs nodemon server.js
   ```
   The API listens on `http://<enviroment.baseUrl>:<PORT>` (default `http://localhost:8080`). CORS is enabled for `http://localhost:4200` and `http://localhost:8081`.
2. **Frontend**
   ```powershell
   cd client
   npm start        # ng serve (default http://localhost:4200)
   ```
3. Sign up a new user via the Angular UI or via `POST /users/signup`, approve it as an admin, then log in to explore the cart, checkout, and billing flows.

## Useful npm Scripts
- Backend
  - `npm run start` – start Express with nodemon.
- Frontend
  - `npm start` – run Angular dev server with live reload.
  - `npm run build` – create a production build.
  - `npm test` – execute Angular/Karma unit tests (spec files live under each module’s `debug/` folder).

## API Overview (non-exhaustive)
| Area | Method & Path | Description | Auth |
|------|---------------|-------------|------|
| Users | `POST /users/signup` | Register a new account (status defaults to pending) | Public |
| Users | `POST /users/login` | Issue access + refresh tokens | Public |
| Users | `POST /users/refresh-token` | Exchange refresh token for new access token | Public (requires token body) |
| Users | `PATCH /users/update` | Admin toggles `status` for a user | Admin |
| Category | `POST /category/add` | Create category | Admin |
| Product | `POST /product/add` | Create product | Admin |
| Cart | `GET /cart/get` | Fetch active cart items (status=1 products) | Authenticated |
| Cart | `POST /cart/remove` | Remove line from `user_cart` | Authenticated |
| Cart | `POST /cart/checkout` | Mark all items for checkout | Authenticated |
| Bill | `POST /bill/GenerateReport` | Insert bill, render PDF, email invoice | Authenticated |
| Bill | `POST /bill/getPdf` | Stream an invoice PDF (regenerates if missing) | Authenticated |
| Bill | `GET /bill/getBills` | List all bills (admin view) | Authenticated |
| Dashboard | `GET /dashboard/details` | Return counts for categories/products/bills | Authenticated |
| Messenger | `POST /message/send` | Persist a support/user message | Authenticated |
| Messenger | `GET /message/get` | Admin fetches latest user messages | Authenticated |

All routes rely on the shared MySQL connection exported from `backend/connection.js`, so pool sizing and credentials are centralized there.

## Invoice & Email Flow
1. Frontend checkout calls `POST /bill/GenerateReport` with `paymentType`, user ID, and a summary of product totals.
2. The route:
   - Reads authoritative totals from `user_cart` for the user.
   - Inserts into the `bill` table (including serialized `productData`).
   - Renders `routes/report.ejs` with product details and uses `html-pdf` to save `Generatedpdf/<uuid>.pdf`.
   - Emails the PDF via Nodemailer (configure sender/recipient in `mailingOptions`).
   - Moves cart rows through `userCheckOut` statuses and deletes them once fulfilled.
3. `/bill/getPdf` rehydrates the invoice for users/admins, regenerates the PDF if it was deleted, and increments `PDFGeneratedTimes` on each download.

## Frontend Modules at a Glance
- `userModule`: login/signup/forgot-password flows, messenger chat, and associated services (`login.service.ts`, `messenger.service.ts`). Guards ensure anonymous vs. authenticated routing.
- `cartSystemModule`: cart, checkout, billing, category, and product components. Services under `HttpServices/` coordinate with backend endpoints. Includes unit-test stubs inside `debug/` for faster iteration.
- `adminModule`: dashboard screen, count service, admin-specific configuration. Connects to `/dashboard`, `/count`, and admin CRUD APIs.
- `sharedModule`: headers, sidebars, footers, error pages, alert services, HTTP interceptors (auth & refresh), reusable directives (`nounce.directive.ts`), and shared domain models.

## Troubleshooting & Tips
- **Database connectivity**: Update `backend/connection.js` with your host/user/password. The current file uses `root/admin` against `localhost/mydb`.
- **JWT errors (401/403)**: Ensure `ACCESS_TOKEN` and `secretKey` env vars are set and match the tokens issued during login. `/users/validToken/:token` helps verify signatures.
- **PDF generation**: `html-pdf` depends on PhantomJS binaries (`phantomjs-prebuilt`). Install build tools if you see PhantomJS download failures. Confirm that `backend/Generatedpdf/` is writable.
- **Email delivery**: Replace placeholder strings in `backend/routes/bill.js` with real sender/recipient addresses or use a test inbox (Mailtrap). Gmail requires an app password when 2FA is enabled.
- **CORS issues**: Allowed origins live in `backend/index.js` (`cors` middleware). Add additional URLs if you serve the Angular app from another host.
- **Binding IP**: `backend/server.js` imports `client/src/environments/enviroment.js` for the host name. Set `enviroment.baseUrl` to `127.0.0.1` or an external IP when deploying.
- **Angular base URL**: All HTTP services rely on `environment.baseUrl`. Keep it synchronized with the backend host/port to avoid network mismatches.

## Documentation
- `docs/overview.md` – architecture map, module interactions, and primary workflows.
- `docs/maintenance.md` – day-two operations: seeding, environment rotation, Socket.IO troubleshooting, and verification checklists.

## Contributing
1. Fork and create a feature branch.
2. Run `npm run start` (backend) and `npm start` (frontend) to verify local changes.
3. Ensure lint/tests pass (`ng test`, `npm run build`) before opening a PR.
4. Include database migrations or schema notes if your change relies on new MySQL columns/tables.

---
Have fun hacking on CartSystem! Open an issue or start a discussion if you plan larger refactors (e.g., email/PDF service extraction, Docker support, or schema changes). 
