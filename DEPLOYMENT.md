# DEPLOYMENT GUIDE: College Alumni Management System (ALM)

This guide provides end-to-end instructions for deploying the **AlmaConnect** system to production using **MongoDB Atlas**, **Render (Backend)**, and **Vercel (Frontend)**.

---

## 1. MongoDB Atlas Setup (Cloud Database)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User:
   - Navigate to **Security** > **Database Access** > **Add New Database User**.
   - Authentication Method: **Password**.
   - Role: **Read and write to any database**.
   - Note down username and password.
3. Network Access:
   - Navigate to **Security** > **Network Access** > **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** so Render can connect.
4. Get Connection String:
   - Click **Connect** on your cluster > **Drivers** (Node.js).
   - Copy URI: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/alm_production?retryWrites=true&w=majority`

---

## 2. Deploy Backend to Render

### Option A: Using Git Repository (Recommended)
1. Push your project to GitHub or GitLab.
2. Sign in to [Render](https://render.com).
3. Click **New +** > **Web Service**.
4. Connect your Git repository.
5. Set the following settings:
   - **Name:** `alm-backend-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Health Check Path:** `/api/health`

6. Configure Environment Variables in Render:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Production environment mode |
   | `PORT` | `10000` | Render listening port |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection URI |
   | `JWT_SECRET` | `your_generated_random_64_char_secret` | Strong secret key for signing JWTs |
   | `JWT_EXPIRE` | `7d` | Token expiry duration |
   | `CLIENT_URL` | `https://your-frontend-app.vercel.app` | Vercel domain (update after Vercel deploy) |

7. Click **Deploy Web Service**.
8. Note down the deployed URL: `https://alm-backend-api.onrender.com`.

### Test Backend Health Check:
```bash
curl https://alm-backend-api.onrender.com/api/health
```
Expected response:
```json
{
  "status": "success",
  "message": "College Alumni Management System (ALM) Backend is operational"
}
```

---

## 3. Deploy Frontend to Vercel

### Option A: Using Vercel CLI

1. Install Vercel CLI globally if not already installed:
```bash
npm install -g vercel
```

2. Update `frontend/src/environments/environment.ts` with your live Render backend URL:
```typescript
// frontend/src/environments/environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://alm-backend-api.onrender.com/api'
};
```

3. Rebuild and deploy:
```bash
cd frontend
vercel login
vercel --prod
```

### Option B: Using Vercel Web Dashboard (Git Integration)
1. Import your Git repository in [Vercel](https://vercel.com).
2. Configure Project:
   - **Framework Preset:** Angular
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/frontend/browser`
3. Click **Deploy**.

---

## 4. Local Quickstart Testing

### Terminal 1: Backend
```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:5000
```

### Terminal 2: Frontend
```bash
cd frontend
npm install
npm start
# Client runs at http://localhost:4200
```

---

## 5. Creating Initial Admin Account

You can register an initial administrator account using `curl` or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Administrator",
    "email": "admin@college.edu",
    "password": "Password123!",
    "role": "admin",
    "graduationYear": 2018,
    "degree": "M.S. Computer Science",
    "currentCompany": "College Alma Mater",
    "jobTitle": "Director of Alumni Relations"
  }'
```

Once logged in with `admin@college.edu`, the **Admin Dashboard** tab will automatically unlock in the sidebar navigation.
