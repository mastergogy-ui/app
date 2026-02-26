# rentwala.vip

Full-stack marketplace inspired by OLX.

## Monorepo structure

- `frontend/` - Next.js app (Vercel ready)
- `backend/` - Express + MongoDB API (Render ready)

## Features

- Email/password auth
- Google sign-in via NextAuth + MongoDB adapter
- Location-first browsing
- Category + subcategory browsing
- Ad posting with Cloudinary image uploads
- Search, filters, and pagination
- Messaging between users
- Admin dashboard (owner email: `mastergogy@gmail.com`)

## Local setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Deployment

### Frontend (Vercel)
- Import `frontend` folder.
- Add all `.env.example` variables.
- Set `NEXT_PUBLIC_API_URL` to Render backend URL + `/api`.

### Backend (Render)
- Import `backend` folder.
- Build command: `npm install`
- Start command: `npm start`
- Add env vars from `.env.example`.
