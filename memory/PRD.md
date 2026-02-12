# RENT WALA - Product Requirements Document

## Original Problem Statement
Build a full-stack marketplace rental platform where users can list items/property for rent and earn money per day.

## Core Features

### Authentication
- Email/Password registration and login
- Google OAuth integration (Emergent-managed)
- Session-based auth with cookies

### Gogo Points System (NEW - Feb 2025)
- Users receive 1000 points on registration
- 1 point deducted when posting an ad
- Users can transfer points to each other
- Points displayed in header, dashboard, and profile
- Transaction history in profile page
- Special accounts have 1 billion points

### Ad System
- Multi-image upload (max 5)
- Categories: Real Estate, Cars, Bikes, Scooters, Clothing, Appliances, Rent a Friend
- Location-based filtering
- Price per day

### Chat System
- In-app messaging between users
- Image sharing in chat
- Send Gogo Points in chat
- Known WebSocket issue (environmental)

### User Dashboard
- View own ads
- Saved ads
- Stats (views, earnings estimate)
- Gogo Points balance

## Tech Stack
- Frontend: React, Tailwind CSS, Shadcn UI
- Backend: FastAPI (Python)
- Database: MongoDB
- Auth: JWT sessions + Google OAuth

## What's Implemented
- [x] User authentication (email/password + Google)
- [x] Ad upload with images
- [x] Category browsing
- [x] Location detection
- [x] User dashboard
- [x] Profile management
- [x] Chat system (HTTP polling)
- [x] Gogo Points system

## Backlog
- [ ] Logo update (waiting for image)
- [ ] Time-based points deduction
- [ ] Push notifications
- [ ] Admin panel
- [ ] Payment integration for points
- [ ] Message status (seen/delivered)

## Key Files
- `/app/backend/server.py` - All API endpoints
- `/app/frontend/src/contexts/AuthContext.js` - Auth + points state
- `/app/frontend/src/pages/` - All page components
