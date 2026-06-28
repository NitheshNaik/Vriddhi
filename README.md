# Vriddhi - Smart Hyper-Local Business Ledger

Vriddhi is a clean, hyper-optimized progressive web application tailored for local retail, craft assembly, and custom repair workshops. It eliminates heavy structural enterprise taxonomy constraints, giving shopkeepers a friction-free billing ecosystem that operates beautifully on low-tier mobile networks.

## Core System Architecture Features

*   **Zero-Config Flat List Catalog:** Completely removes product categorization layers. Products map directly into a lightweight flat-list index grid for speed.
*   **Inline Data Modification:** Enables real-time price adjustment and catalog additions directly from the checkout interaction stream.
*   **Network-Independent Asset Pipeline:** Transcodes product and profile images directly into compressed base64 data URI string arrays inside MongoDB cluster schemas, eliminating cross-device network loading crashes.
*   **Periodic Analytics Breakdown Viewports:** Includes dedicated sub-routes tracking weekly and monthly transactional histories with timestamp logging and separate payment method audits (UPI vs. Cash).
*   **Secure Access Protection:** Features strict alpha-numeric client validation alongside secure transactional email 6-digit OTP confirmation streams via Nodemailer.

## Operational Environment Variables Configuration

To run the platform securely in a production state, construct a `.env` file within the root backend layout module tracking the parameter keys below:

```env
PORT=5000
MONGODB_URI=your_mongodb_cluster_connection_string
JWT_SECRET=your_cryptographic_signing_key_token
EMAIL_USER=your_verified_gmail_account_address
EMAIL_PASS=your_16_character_generated_google_app_password
FRONTEND_URL=https://your-production-app-domain.com
```

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19, Vite 8, Bootstrap 5, TanStack Query |
| Backend   | Node.js, Express 4, MongoDB + Mongoose  |
| Auth      | JWT (7d expiry) + OTP email verification|
| Email     | Nodemailer (Gmail SMTP)                 |
| Security  | Helmet, express-rate-limit, bcryptjs    |
| Images    | Multer memory storage → base64 data URI |

## Project Structure

```
tracker/
├── frontend/          # Vite + React SPA
│   ├── src/
│   │   ├── api/       # Axios client
│   │   ├── components/# Layout, Toast
│   │   ├── context/   # AuthContext (JWT state)
│   │   └── pages/     # Route-level page components
│   └── index.html
└── backend/           # Express REST API
    ├── models/        # Mongoose schemas (User, Item, Sale, EmailVerification)
    ├── routes/        # auth, items, sales, analytics
    ├── middleware/    # JWT auth guard
    └── utils/         # Nodemailer transactional templates
```

## Running Locally

```bash
# Backend
cd backend
npm install
npm run dev         # starts on http://localhost:5000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

## Production Deployment Notes

- Set `FRONTEND_URL` in the backend `.env` to your live frontend domain so password-reset email links route correctly.
- The CORS allow-list dynamically includes `FRONTEND_URL` alongside localhost origins for local development.
- The rate limiter caps each IP at **100 API requests per 15 minutes** to prevent brute-force and OTP spam attacks.
- All profile and product images are stored as base64 data URIs inside MongoDB — no separate object storage bucket is required.
