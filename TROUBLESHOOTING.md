# Railway Deployment Troubleshooting Guide

## 🚀 Deployment Status Overview

### Current Status
- ✅ **Source Files**: Pushed to GitHub (42 files)
- ⏳ **Railway Build**: Check Dashboard → Deployments
- ⏳ **Database**: Needs MONGO_URI environment variable
- ⏳ **Authentication**: Needs JWT_SECRET environment variable

---

## 🔍 Diagnosis Flowchart

```
Is Railway building?
    ├─ NO → Check GitHub push succeeded
    │   └─ Run: git log --oneline -1
    │   └─ Should show: chore: initial commit of source files for Railway
    │
    └─ YES → Check build logs in Railway dashboard
        ├─ Build FAILED?
        │   ├─ "Cannot find module"? → Missing npm install
        │   ├─ "MONGO_URI not found"? → Add env variable (optional for build)
        │   └─ "Vite build failed"? → Check client/src for errors
        │
        └─ Build SUCCESSFUL?
            ├─ App CRASHED?
            │   ├─ Check MONGO_URI is set (required at runtime)
            │   ├─ Check JWT_SECRET is set
            │   └─ Check PORT is 5000 or Railway PORT variable
            │
            └─ App RUNNING?
                ├─ Test /api/health endpoint
                ├─ Check browser console for errors
                └─ Verify database connection
```

---

## 📋 Required Environment Variables

### Critical for Runtime (Set BEFORE deploy):
```
NODE_ENV=production              (tells app to serve static frontend)
MONGO_URI=mongodb+srv://...      (database connection - CRITICAL)
JWT_SECRET=your-secret-key       (authentication - CRITICAL)
```

### After First Deploy:
```
CLIENT_URL=https://your-app.railway.app   (for CORS - update after deploy)
```

---

## 🐛 Common Build Failures & Fixes

### Failure 1: Build Succeeds but App Immediately Crashes

**Error in Railway logs**:
```
MongoError: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause**: MONGO_URI not set or invalid

**Fix**:
1. Go to Railway Dashboard → Variables
2. Add/verify `MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teamtaskmanager`
3. Click **Redeploy**

---

### Failure 2: Build Shows "Cannot find module"

**Error**:
```
Error: Cannot find module 'express'
```

**Cause**: Dependencies not installed properly

**Fix**:
1. Check `root/package.json` has express in dependencies
2. Check `server/package.json` has all server dependencies
3. Verify `.gitignore` doesn't exclude package.json files
4. Run locally: `npm install && cd server && npm install`
5. Commit and push changes

---

### Failure 3: Vite Build Fails During Railway Build

**Error**:
```
error during build:
  RollupError: src/pages/X.jsx: Unknown role "..."
```

**Cause**: Syntax error in React component

**Fix**:
1. Check the file mentioned in error
2. Fix syntax/imports
3. Test locally: `cd client && npm run build`
4. Commit and push
5. Trigger new build on Railway

---

### Failure 4: App Runs but Blank Page

**What you see**: White page with no errors in console

**Cause**: Frontend build not being served (NODE_ENV not set)

**Fix**:
1. Railway Variables → add `NODE_ENV=production`
2. Verify `client/dist` folder is created during build
3. Check server.js serving static files correctly
4. Redeploy

---

## 🧪 Testing During Development

### Before Pushing to GitHub:

```bash
# 1. Test backend locally
cd server
npm install
npm start
# Should see: "✅ MongoDB Connected" and "🚀 Server running on port 5000"

# 2. Test frontend build
cd ../client
npm install
npm run build
# Should create client/dist directory with index.html and js/css

# 3. Test serving built frontend with backend
# Modify NODE_ENV to production and restart server
# Visit localhost:5000 - should see login page
```

---

## 🔍 Reading Railway Build Logs

### Where to Find Logs:
1. **Railway Dashboard** → Click your project
2. **Deployments** tab → Click the failed/running deployment
3. **Logs** tab → Shows full build and runtime logs

### What to Look For:

```
✅ GOOD: "Build successful"
✅ GOOD: "✅ MongoDB Connected"
✅ GOOD: "🚀 Server running on port 5000"

❌ BAD: "fatal: not a git repository"
❌ BAD: "Cannot find module"
❌ BAD: "MongoServerError: connect ECONNREFUSED"
❌ BAD: "RollupError" or "Vite error"
```

---

## 🌐 Testing After Deploy

### Test 1: Health Check
```bash
curl https://your-app.railway.app/api/health
# Should return: {"status":"OK","timestamp":"..."}
```

### Test 2: Frontend Loads
```bash
# In browser, go to:
https://your-app.railway.app
# Should see login page with styles loaded
```

### Test 3: Register New User
```bash
# 1. Click Register
# 2. Fill: Email, Password, Confirm Password, Role
# 3. Submit
# Should see dashboard or redirect
```

### Test 4: Check Database
```bash
# 1. Go to MongoDB Atlas
# 2. Click your cluster → Collections
# 3. Look for 'users', 'projects', 'tasks' collections
# 4. Should see newly created documents
```

### Test 5: Browser DevTools
```bash
# 1. Press F12 → Console tab
# 2. Should see NO red errors
# 3. Should see API calls like:
#    GET /api/tasks
#    POST /api/projects
#    etc.
```

---

## 📊 Deployment Checklist

### Before Deploy:
- [ ] All source files committed to GitHub
- [ ] `.env` file NOT committed (only `.env.example`)
- [ ] `node_modules/` NOT committed
- [ ] `client/dist/` NOT committed

### Railway Setup:
- [ ] Project created and connected to GitHub
- [ ] `NODE_ENV=production` variable set
- [ ] `MONGO_URI` variable set (valid MongoDB Atlas URI)
- [ ] `JWT_SECRET` variable set (strong random string)

### After Deploy Succeeds:
- [ ] `/api/health` returns OK
- [ ] Frontend loads at root URL
- [ ] Can register new user
- [ ] Can log in
- [ ] Can create project/task
- [ ] MongoDB shows new documents
- [ ] Browser console has no errors

---

## 🆘 Emergency Troubleshooting

### If Build is Stuck:
1. Go to Railway Dashboard
2. Click the stuck deployment
3. Click **Cancel** button
4. Make a small change to code (e.g., add comment to server.js)
5. Commit and push: `git commit -am "fix: trigger rebuild" && git push`
6. Monitor new deployment

### If All Deploys Fail:
1. Check Git push succeeded: `git log --oneline -1`
2. Verify remote: `git remote -v`
3. Check all environment variables are set in Railway
4. Try manual deploy from Railway dashboard (Redeploy button)

### If App Crashes Immediately:
1. Check Railway logs for exact error
2. Most common: MONGO_URI issue
3. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0`
4. Restart deployment from Railway dashboard

---

## 📞 Getting Help

### 1. Check Logs First
- Railway Dashboard → Deployments → View Logs
- Look for specific error message

### 2. Google the Error
- Copy exact error message
- Search: "railway nodejs" + error message

### 3. Verify Environment Variables
- Railway Dashboard → Variables tab
- Ensure all 4 variables are present and correct

### 4. Test Locally First
- Run `npm install && npm start` locally
- Verify app works with same `.env` file
- Check browser console for errors

---

## ✨ Success Indicators

When deployment succeeds, you should see:

1. ✅ **Railway Dashboard**: "Active" status (green)
2. ✅ **Deployment Logs**: "Successfully deployed" message
3. ✅ **Health Check**: `/api/health` returns `{"status":"OK"}`
4. ✅ **Frontend**: Login page loads with CSS/styling
5. ✅ **Network Tab**: API calls to `/api/*` return 200 status
6. ✅ **MongoDB**: New documents appear in collections
7. ✅ **No Errors**: Console tab shows no red errors

---

**Last Updated**: 2026-05-21  
**Status**: Source files pushed, awaiting Railway build
