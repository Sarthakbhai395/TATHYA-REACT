# TATHYA Fullstack Setup (Local)

This note explains how to run the backend and frontend locally and verify the REST API integration using fetch (no Axios).

## Backend (tathya-backend)

1. Install dependencies

   npm install

2. Make sure MongoDB is running locally or set `MONGO_URI` in `tathya-backend/.env`.

3. Start backend

   npm run dev

The backend listens on `http://localhost:5000` by default. CORS allows `http://localhost:3000`.

Available endpoints used by the frontend:
- POST /api/auth/signup
- POST /api/auth/login
- GET/PUT /api/auth/profile (requires Authorization: Bearer <token>)
- POST /chat (no /api prefix) — receives { messages: [...] } and returns { reply, chatId }

## Frontend (TATHYA-REACT-main)

1. Install dependencies

   npm install

2. Frontend env is in `TATHYA-REACT-main/.env`. `VITE_API_BASE` is set to `http://localhost:5000/api`.

3. Start frontend

   npm run dev

## Quick tests

Signup via curl (example)

PowerShell:

```powershell
curl -Method POST -Uri "http://localhost:5000/api/auth/signup" -ContentType "application/json" -Body (ConvertTo-Json @{ firstName = 'Test'; lastName = 'User'; email = 'test@example.com'; password = 'password123' })
```

Chat test (no auth required):

```powershell
curl -Method POST -Uri "http://localhost:5000/chat" -ContentType "application/json" -Body (ConvertTo-Json @{ messages = @(@{ role = 'user'; content = 'Hello' }) })
```

If you want me to run the server and verify requests from here, say so and I'll run the checks.
