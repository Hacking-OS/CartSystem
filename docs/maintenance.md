## CartSystem Maintenance Guide

Use this checklist to keep the demo environment healthy, reproducible, and ready for showcases. It focuses on configuration drift, database hygiene, seeds, and realtime verification.

### 1. Environment & Configuration
- **Backend `.env`** (create if missing):
  ```
  PORT=8080
  ACCESS_TOKEN=<jwt-access-secret>
  secretKey=<jwt-refresh-secret>
  EMAIL=<smtp-user>
  PASSWORD=<smtp-password>
  USER=user
  ```
- **Database config**: `backend/config/index.js` (consumed by `server.js`) must align with `.env`. Accounts need `CREATE DATABASE` to support automatic schema provisioning.
- **Frontend environment**: `client/src/environments/environment.ts` & `.prod.ts` `baseUrl` should match the backend origin and port.

### 2. Database Lifecycle
- **Auto-bootstrap**: On each backend start, `ensureDatabaseExists()` runs `CREATE DATABASE IF NOT EXISTS` and `sequelize.sync()`.
- **Seeding**: `seedDatabase()` executes automatically at startup, inserting:
  - Payment statuses (`Pending`, `Paid`)
  - Demo admin/user accounts
  - Showcase chat group + sample members/messages
  - Seed products/categories
- **Manual reseed**: Run `cd backend && node database/seed.js` if you drop tables or want deterministic demo data again.
- **Schema changes**: Update Sequelize models, re-run `npm run start`, and confirm the generated SQL matches expectations. For production, replace `sync()` with migrations (e.g., `sequelize-cli`).

### 3. Socket.IO Health Checks
1. Start backend (`npm run start`) and frontend (`npm start`).
2. Log in as `Demo Admin` (email `demo.admin@cartsystem.dev`, pass `admin123`) and `Alice Demo` in two browser windows.
3. Open Messenger → `Showcase Lounge`.
4. Verify:
   - Typing indicator pulses while one user types.
   - Messages appear instantly on both clients.
   - Approving Bob’s pending membership emits notifications to admins and Bob.
5. If sockets fail:
   - Confirm the browser devtools show a connected Socket.IO client (no CORS 403).
   - Check backend logs for `socket.auth` errors (missing/expired JWT).
   - Restart the frontend after clearing local storage if tokens desynchronize.

### 4. DTO & Contract Discipline
- **API DTOs** (`client/src/app/sharedModule/sharedServices/api.dto.ts`) and **Socket DTOs** (`socket.dto.ts`) enforce compile-time contracts.
- Whenever backend responses change, update DTOs first, then use the compiler errors as a to-do list for affected services/components.
- Avoid sprinkling `any`; integrate new structures into DTOs so template bindings remain safe.

### 5. Invoice & Email Pipeline
- Test `POST /bill/GenerateReport` through the Angular checkout or via Postman with the body captured from browser network logs.
- Confirm:
  - `backend/Generatedpdf/<uuid>.pdf` is created.
  - Database `bill` rows reference the generated `paymentStatusID`.
  - Nodemailer logs success/failure (even if using placeholder SMTP creds).
- Troubleshooting tips:
  - PhantomJS download errors → reinstall `phantomjs-prebuilt`.
  - Permission issues writing to `Generatedpdf` → adjust folder ACLs.
  - Email delivery → verify credentials or switch to Mailtrap.

### 6. Routine Cleanup
- **Generated PDFs**: prune `backend/Generatedpdf` periodically to keep the repo size manageable.
- **Logs**: Tail backend logs for `Sequelize` warnings; fix indexes or constraints before the next demo.
- **Dependencies**: Keep `npm install` parity between `client/` and `backend/`. If you upgrade Angular/Express, update both lockfiles in tandem.

### 7. Common Commands
```powershell
# Backend
cd backend
npm install
npm run start        # nodemon server.js
node database/seed.js

# Frontend
cd client
npm install
npm start            # ng serve
npm run build
```

Revisit this guide whenever you refresh demo environments, onboard teammates, or troubleshoot regressions. Update it alongside significant architectural or workflow changes.

