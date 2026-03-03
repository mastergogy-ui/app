# GoGo Fantasy Points

GoGo Fantasy Points is a **prediction game** where users spend and earn **virtual points** on match outcomes.

> **Disclaimer:** This platform uses virtual points only. No real money involved.

## Folder Restructure

As requested, the project is now restructured under a **`mahalakshmi/`** folder instead of the previous layout.

## Can this be deployed on Vercel + Render?

**Yes.**
- Deploy the **frontend** (Next.js) on **Vercel** from `mahalakshmi/frontend`.
- Deploy the **backend** (Express + MongoDB) on **Render** from `mahalakshmi/backend`.

## Tech Stack

- Frontend: Next.js (React) + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB (Mongoose)
- Authentication: JWT (user/admin roles)

## Project Structure

```text
mahalakshmi/
  backend/
    src/
      app.js
      server.js
      config/db.js
      controllers/
      middlewares/
      models/
      routes/
      scripts/
    .env.example

  frontend/
    app/
    components/
    lib/
    .env.example

render.yaml
vercel.json
README.md
```

## Local Setup

### 1) Install dependencies

```bash
cd mahalakshmi/backend && npm install
cd ../frontend && npm install
```

### 2) Configure env files

```bash
cp mahalakshmi/backend/.env.example mahalakshmi/backend/.env
cp mahalakshmi/frontend/.env.example mahalakshmi/frontend/.env.local
```

### 3) Seed dummy data

```bash
cd mahalakshmi/backend
npm run seed
```

Dummy credentials:
- Admin: `superadmin` / `Admin@123`
- User: `alex@gogo.com` / `Pass@123`

### 4) Run apps

```bash
# backend
cd mahalakshmi/backend
npm run dev

# frontend
cd mahalakshmi/frontend
npm run dev
```

## Production Deployment

### Frontend on Vercel

1. Import repo in Vercel.
2. Set Root Directory to `mahalakshmi/frontend`.
3. Add env var:
   - `NEXT_PUBLIC_API_URL=https://<your-render-service>.onrender.com/api`
4. Deploy.

### Backend on Render

1. Create a Render Web Service.
2. Set Root Directory to `mahalakshmi/backend`.
3. Add env vars:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL=https://<your-vercel-domain>`
4. Deploy.
