# College Alumni Management System (ALM) — "AlmaConnect"

A production-ready Full-Stack MEAN application designed for universities and colleges to connect alumni, share career opportunities, coordinate reunions and events, and organize endowment campaigns.

---

## 🛠 Tech Stack

- **Database:** MongoDB with Mongoose v8+
- **Backend:** Node.js (v20+), Express.js (v4+), JWT, bcryptjs, CORS
- **Frontend:** Angular (v18+), Standalone Components, Angular Signals, `@if` / `@for` Control Flow, RxJS
- **Styling:** Tailwind CSS + Angular Material (tables, cards, dialogs, forms)
- **Deployment:** Render (Backend API), Vercel (SPA Frontend), MongoDB Atlas (Cloud DB)

---

## 📁 Repository Structure

```
alm/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, GetMe
│   │   ├── userController.js     # Directory search, filters, profile update
│   │   ├── eventController.js    # Events CRUD & RSVP logic
│   │   ├── jobController.js      # Job board & application logic
│   │   └── donationController.js # Giving & campaign aggregates
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization
│   │   └── errorHandler.js       # Central error & Mongoose error handling
│   ├── models/
│   │   ├── User.js               # Alumni & Admin schema
│   │   ├── Event.js              # Campus & virtual events schema
│   │   ├── Job.js                # Career board schema
│   │   └── Donation.js           # Donations & campaign gifts schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── jobRoutes.js
│   │   └── donationRoutes.js
│   ├── .env.example
│   ├── package.json
│   ├── render.yaml               # Render Cloud deployment blueprint
│   └── server.js                 # Express application entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── guards/       # authGuard, adminGuard
│   │   │   │   ├── interceptors/ # authInterceptor, errorInterceptor
│   │   │   │   ├── models/       # user, event, job, donation interfaces
│   │   │   │   └── services/     # AuthService (Signals), ApiService
│   │   │   ├── features/
│   │   │   │   ├── admin/        # AdminDashboardComponent
│   │   │   │   ├── auth/         # LoginComponent, RegisterComponent
│   │   │   │   ├── directory/    # AlumniDirectoryComponent (Grid/Table)
│   │   │   │   ├── donations/    # DonationsComponent (Campaigns & giving)
│   │   │   │   ├── events/       # EventsComponent (List, RSVP, Host)
│   │   │   │   ├── jobs/         # JobsComponent (List, Apply, Post)
│   │   │   │   └── profile/      # ProfileComponent (View & Edit)
│   │   │   ├── layout/
│   │   │   │   └── main-layout/  # Sidebar + Top Navbar shell
│   │   │   ├── app.config.ts     # Standalone app providers & interceptors
│   │   │   └── app.routes.ts     # Lazy-loaded routes with guards
│   │   ├── environments/         # environment.ts & environment.development.ts
│   │   ├── index.html
│   │   └── styles.scss           # Tailwind directives & theme overrides
│   ├── angular.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── vercel.json               # Vercel SPA routing configuration
│
├── DEPLOYMENT.md                 # Step-by-step production deployment guide
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v20+)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Run Backend
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### 2. Run Frontend
```bash
cd frontend
npm install
npm start
# Running on http://localhost:4200
```

---

## 🔒 API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new alumni / admin account |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Protected | Get current user's profile |
| `GET` | `/api/users` | Protected | Search alumni directory (`?search=&year=&company=`) |
| `GET` | `/api/users/:id` | Protected | Get single alumni member details |
| `PUT` | `/api/users/:id` | Protected | Update profile (Owner or Admin) |
| `GET` | `/api/events` | Public/Protected | List upcoming and past reunions |
| `POST` | `/api/events` | Protected | Host a new event |
| `POST` | `/api/events/:id/rsvp` | Protected | RSVP / cancel RSVP for an event |
| `GET` | `/api/jobs` | Protected | List career openings (`?jobType=&search=`) |
| `POST` | `/api/jobs` | Protected | Post a new job opportunity |
| `POST` | `/api/jobs/:id/apply` | Protected | Submit application for a job |
| `GET` | `/api/donations` | Protected | List campaign funds & recent gifts |
| `POST` | `/api/donations` | Protected | Make a contribution to a campaign |
