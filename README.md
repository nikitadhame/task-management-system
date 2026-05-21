# Team Task Manager

A full-stack MERN application for managing team projects and tasks with role-based access control.

## 🚀 Features
- JWT Authentication (Register/Login)
- Role-Based Access Control (Admin / Member)
- Projects CRUD with team member assignment
- Tasks Kanban Board (Pending / In Progress / Completed)
- Dashboard with live statistics & overdue tracking
- Admin panel for user management

## 🛠️ Tech Stack
- **Frontend**: React 18 + Vite + React Router v6
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcryptjs

## 📦 Local Development

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the backend
```bash
cd server && npm run dev
# Runs on http://localhost:5000
```

### 3. Start the frontend
```bash
cd client && npm run dev
# Runs on http://localhost:5173
```

### 4. Open browser
Visit: **http://localhost:5173**

## 🌐 Deployment (Railway)

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app)
3. Add environment variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong secret key
   - `NODE_ENV` = production
4. Railway will auto-detect and build using `railway.json`

## 🔑 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/projects | ✅ | List projects |
| POST | /api/projects | Admin | Create project |
| PUT | /api/projects/:id | Admin | Update project |
| DELETE | /api/projects/:id | Admin | Delete project |
| GET | /api/tasks | ✅ | List tasks |
| GET | /api/tasks/stats | ✅ | Dashboard stats |
| POST | /api/tasks | Admin | Create task |
| PUT | /api/tasks/:id | ✅ | Update task |
| DELETE | /api/tasks/:id | Admin | Delete task |
| GET | /api/users | Admin | List users |
| PUT | /api/users/:id/role | Admin | Change role |
| DELETE | /api/users/:id | Admin | Delete user |
