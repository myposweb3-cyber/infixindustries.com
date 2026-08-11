# Backend (Express API)

Quick start:

1. Copy `backend/.env.example` to `backend/.env` and set credentials.
2. Run Postgres and apply `backend/sql/schema.sql` (docker-compose included).
3. Start backend:

```
cd backend
npm install
npm run dev
```

API endpoints:
- `POST /api/auth/register` {name,email,password}
- `POST /api/auth/login` {email,password}
- `GET /api/products`
