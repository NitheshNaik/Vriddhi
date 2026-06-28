# Vriddhi — Profile Photos, Security Hardening & Operational Files

Transition the app from local-dev to a secure production-ready baseline.
Four major work areas: profile image pipeline, security hardening, git/env guardrails, and README documentation.

## Key Findings

- `FRONTEND_URL` is **already in `.env`** and already used in `auth.js` for the reset link — the reset link fix is **already done correctly**.
- `multer` is already a dependency — no install needed for that.
- `helmet` and `express-rate-limit` are **not** installed — need `npm install`.
- The CORS `origin` in `server.js` is hardcoded to localhost array — needs to be replaced with the env-based dynamic version.
- `profilePhoto` field does not exist in the User schema yet.
- Profile page already has an avatar area (initials div) — will replace with photo-aware avatar + camera trigger.
- Layout navbar uses a generic `account_circle` icon — will replace with a photo-aware round avatar.
- No `.gitignore` files exist anywhere in the project.

## Proposed Changes

---

### Backend — Security Packages

#### [INSTALL] `helmet` + `express-rate-limit`
```
npm install helmet express-rate-limit
```

---

### Backend — Data Model

#### [MODIFY] [User.js](file:///d:/Downloads/myCodes/projects/tracker/backend/models/User.js)
- Add `profilePhoto: { type: String, default: null }` to the Mongoose schema.

---

### Backend — Auth Routes

#### [MODIFY] [auth.js](file:///d:/Downloads/myCodes/projects/tracker/backend/routes/auth.js)
- Import `multer` configured with `memoryStorage()`.
- Add a new `POST /api/auth/profile/photo` route protected by `authMiddleware` that:
  - Runs the multer `single('photo')` middleware.
  - Converts `req.file.buffer` → base64 data URI string.
  - Saves it to `user.profilePhoto`.
  - Returns the updated user object.
- Update `GET /api/auth/profile` to include `profilePhoto` in the response (currently excluded by `-passwordHash` select, so it will be included automatically).
- Update `PUT /api/auth/profile` response to also return `profilePhoto`.

---

### Backend — Server Config

#### [MODIFY] [server.js](file:///d:/Downloads/myCodes/projects/tracker/backend/server.js)
- `require('helmet')` and apply as middleware (`app.use(helmet())`).
- `require('express-rate-limit')` and configure a 100 req/15 min limiter on `/api`.
- Replace hardcoded CORS origin array with:
  ```js
  cors({ origin: process.env.FRONTEND_URL, credentials: true })
  ```

---

### Backend — Env File

#### [MODIFY] [.env](file:///d:/Downloads/myCodes/projects/tracker/backend/.env)
- `FRONTEND_URL` already exists. No changes needed — already correct.

---

### Frontend — Profile Page

#### [MODIFY] [Profile.jsx](file:///d:/Downloads/myCodes/projects/tracker/frontend/src/pages/Profile.jsx)
- Replace the static `profile-avatar` initials div with a photo-aware component:
  - If `profile.profilePhoto` exists → show `<img>` in a circular mask.
  - Otherwise → show initials fallback.
  - Overlay a `photo_camera` icon button on hover that triggers a hidden `<input type="file" accept="image/*">`.
- Add a `uploadMutation` (useMutation) that:
  - Creates a `FormData` with the selected file.
  - POSTs to `/auth/profile/photo` with `Content-Type: multipart/form-data`.
  - On success, calls `updateLocalUser({ profilePhoto: data.profilePhoto })` and invalidates the `profile` query.

---

### Frontend — Layout Navbar

#### [MODIFY] [Layout.jsx](file:///d:/Downloads/myCodes/projects/tracker/frontend/src/components/Layout.jsx)
- Import `useQuery` and `apiClient`.
- Fetch profile data (`/auth/profile`) inside the Layout component.
- Replace the `account_circle` icon button with a conditional:
  - If `profilePhoto` → render a 32px round `<img>` avatar.
  - Else → render the initials letters in a styled circle.
- Keep the `onClick → navigate('/profile')` behavior.

---

### Operational Files

#### [NEW] [.gitignore](file:///d:/Downloads/myCodes/projects/tracker/.gitignore)
Root-level gitignore covering both frontend and backend.

#### [NEW] [backend/.gitignore](file:///d:/Downloads/myCodes/projects/tracker/backend/.gitignore)
Backend-scoped gitignore.

#### [NEW] [README.md](file:///d:/Downloads/myCodes/projects/tracker/README.md)
Full README with exact copy strings from the specification.

---

## Verification Plan

### Automated
- `npm install helmet express-rate-limit` in backend directory.

### Manual Verification
1. Upload a photo in Profile → confirm circular avatar renders in navbar.
2. Hit `localhost:5173/random-url` → 404 page still works.
3. Request password reset → email link uses `FRONTEND_URL`, not localhost (check `.env`).
4. Open DevTools Network → confirm response headers include `X-Frame-Options`, `X-Content-Type-Options` (helmet).
5. Verify `.gitignore` causes `node_modules/` and `.env` to be untracked.
