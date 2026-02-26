# RentWala - Full Stack Marketplace

Production-ready marketplace app for renting friends, bikes, cars, and properties.

## Tech Stack
- **Frontend:** Next.js 14 App Router, TypeScript, Tailwind CSS, Axios, React Hook Form
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT cookies, Google OAuth 2.0, Multer + Cloudinary
- **Security:** Helmet, CORS, auth rate limiting, NoSQL sanitize, XSS clean, HPP

## Folder Structure

```
rentwala/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   └── .env.example
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   └── .env.example
├── render.yaml
└── vercel.json
```

## Local Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 3) Run development servers
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## Backend Environment Variables
See `backend/.env.example`:
- `NODE_ENV`, `PORT`
- `MONGO_URI`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `CLIENT_URL` (comma-separated allowed origins)
- `GOOGLE_CLIENT_ID`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

## Frontend Environment Variables
See `frontend/.env.example`:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## API Documentation
Base URL: `/api`

### Auth
- `POST /auth/register` - Register with `name`, `password`, and either `email` or `phone`
- `POST /auth/login` - Login with `identifier` (email/phone) + `password`
- `POST /auth/google` - Google OAuth login with `idToken`
- `GET /auth/me` - Current authenticated user
- `POST /auth/logout` - Clear auth cookie

### Ads
- `GET /ads` - List ads with filters: `category`, `location`, `q`, `page`
- `GET /ads/:id` - Single ad details
- `POST /ads` - Protected, create ad (multipart form with max 5 images)
- `PUT /ads/:id` - Protected, update own ad
- `DELETE /ads/:id` - Protected, delete own ad
- `GET /ads/mine` - Protected, current user ads

### Users
- `PUT /users/profile` - Protected profile update

## Deployment

### Deploy Backend to Render
1. Push repository to GitHub.
2. In Render, create **Blueprint** and point to this repo.
3. Render reads `render.yaml` and provisions `rentwala-api` service.
4. Set all `sync: false` env vars in Render dashboard.
5. Ensure `CLIENT_URL` points to your Vercel domain.

### Deploy Frontend to Vercel
1. Import repository in Vercel.
2. Set root directory to `frontend` (or keep monorepo with provided `vercel.json`).
3. Add `NEXT_PUBLIC_API_URL` to Vercel environment variables.
4. Deploy.

## Production Notes
- JWT tokens are stored in HTTP-only cookies.
- CORS allows configured client origins and credentials.
- MongoDB indexes are configured on ads for search/filter performance.
- Next.js `Image` is used for optimization and lazy loading.
- API list endpoint has short cache-control for improved response time.
