## CartSystem Overview

CartSystem is a full-stack demo of a production commerce platform. The repository intentionally mirrors the prod topology—Express + Sequelize on the backend, Angular on the frontend—while swapping sensitive integrations for safe defaults. This document orients new contributors before they dive into the source.

### High-Level Architecture
- **Backend (`backend/`)**
  - `server.js` boots Express, ensures the database exists, runs Sequelize migrations/`sync`, seeds demo data, and binds Socket.IO.
  - `routes/` namespace contains feature routers (auth/users, catalog, cart, checkout, billing, dashboard, counts, messenger).
  - `database/models/` define Sequelize models and associations. `database/seed.js` populates demo users, inventory, chat groups, and payment statuses.
  - `services/` houses cross-cutting helpers: auth (JWT), role checks, email, PDF.
  - `socket.js` exports `setIO`/`getIO`, allowing any route or service to emit Socket.IO events without circular imports.
- **Frontend (`client/`)**
  - Angular workspace split into `userModule`, `cartSystemModule`, `adminModule`, and `sharedModule`.
  - `sharedModule/sharedServices` centralizes HTTP clients, interceptors, alert services, and the new `SocketService`.
  - DTOs for HTTP and Socket payloads live in `sharedServices/api.dto.ts` and `sharedServices/socket.dto.ts`, respectively.

### Data Flow Cheatsheet
1. **Authentication**
   - `POST /users/login` issues access + refresh tokens.
   - Tokens are stored in local storage; interceptors attach them to subsequent calls.
   - Admin approval (`status === true`) gates dashboard routes and even login success.
2. **Catalog & Cart**
   - `category` and `product` routers provide CRUD, with Angular services mirroring each endpoint.
   - Cart operations (`/cart/*`) manipulate the `user_cart` table. Checkout normalizes totals on the server before billing.
3. **Checkout to Invoice**
   - `POST /bill/GenerateReport` reads the authoritative cart, creates a `bill`, renders `routes/report.ejs` into `backend/Generatedpdf`, and (optionally) emails via Nodemailer.
   - `PaymentStatus` rows are seed-driven; the route looks up IDs dynamically, preventing FK mismatches.
4. **Real-Time Messaging & Approvals**
   - Socket.IO authenticates via the same access token header.
   - Rooms follow `group:<groupId>` naming. Events include:
     - `messenger:groupCreated`, `messenger:joinRequest`, `messenger:joinApproved`, `messenger:newMessage`
     - `messenger:typingStart` / `messenger:typingStop`
     - `approval:statusChanged` (user notified), `admin:userStatusChanged` (admin dashboards refresh)
   - Angular `SocketService` exposes typed observables for each event, and components subscribe/unsubscribe in `ngOnInit`/`ngOnDestroy`.

### Shared Contracts (DTOs)
- **API DTOs (`api.dto.ts`)**: Align Angular expectations with backend responses (users, products, categories, carts, checkout, bills).
- **Socket DTOs (`socket.dto.ts`)**: Enforce strong typing across messenger and approval events, reducing runtime shape mismatches.
- Whenever you add/modify a backend response or event payload, update the relevant DTO and adjust call sites. The TypeScript compiler will surface incomplete refactors.

### Module Responsibilities
- `userModule`: Entry flows (login/signup/forgot) + Messenger UI, including typing indicators and join requests.
- `cartSystemModule`: Catalog browsing, cart management, checkout, billing history.
- `adminModule`: Approvals, counts, dashboards, and admin notifications.
- `sharedModule`: Layout, guards, interceptors, alerts, shared components, and global services.

### Build & Runtime
- **Backend**: `npm run start` → nodemon `server.js`. Exposes REST + Socket.IO on `http://<enviroment.baseUrl>:<PORT>`.
- **Frontend**: `npm start` → `ng serve` on `http://localhost:4200`.
- **PDFs**: Generated files land in `backend/Generatedpdf`. Clean up older PDFs manually or via cron if disk usage matters.

### Deployment Notes
- Update `client/src/environments/environment*.ts` with the deployed backend origin.
- Configure `.env` (or `connection.js`) with production MySQL credentials and JWT secrets.
- Provide SMTP credentials in `routes/bill.js` (or refactor to read from env) for invoice delivery.
- Consider replacing `sequelize.sync()` with migrations before targeting production; the demo opts for convenience over strict schema control.

Refer back to this document when onboarding teammates, reasoning about cross-module dependencies, or planning architectural changes.

