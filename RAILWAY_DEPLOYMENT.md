# Railway Deployment Guide

## 🚀 Fixed Issues

Your deployment was failing due to these issues (now fixed):

1. ✅ **Build command** - Wasn't properly building the app
2. ✅ **NODE_ENV not set** - Server wasn't in production mode to serve static files
3. ✅ **Listening only on localhost** - Server needs to listen on 0.0.0.0 for Railway
4. ✅ **Missing error handling** - Better error messages for debugging

## 🔧 Railway Environment Variables (CRITICAL)

Set these in your Railway project dashboard:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/teamtaskmanager
JWT_SECRET=YourStrongSecretKeyHere
NODE_ENV=production
CLIENT_URL=https://your-railway-app-url.up.railway.app
```

### How to set them:
1. Go to your Railway project dashboard
2. Click **Variables** tab
3. Add each variable above

## 📝 Important Notes

### MONGO_URI
- Use **MongoDB Atlas** (free tier available at mongodb.com)
- Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`
- Keep the credentials secure!

### JWT_SECRET
- Use a strong, random secret
- Example: `openssl rand -base64 32` (on Mac/Linux)
- Or generate at: https://generate-random.org/

### CLIENT_URL
- This is your Railway deployment URL
- You'll get it after first deployment
- Format: `https://your-app-name.up.railway.app`
- Update this after deployment is successful

## 🔄 Deployment Steps

1. **Connect GitHub** (if not already)
   - Push this code to a GitHub repo
   
2. **Create Railway Project**
   - Go to railway.app
   - New project → GitHub repo
   
3. **Configure Variables**
   - Add MONGO_URI, JWT_SECRET, NODE_ENV, CLIENT_URL
   
4. **Deploy**
   - Railway will automatically build and deploy
   - Watch logs in the Railway dashboard

## ✅ Testing After Deploy

1. Check the Railway logs for errors
2. Visit your Railway URL to test login
3. Create a project to verify database connection
4. Check API endpoint: `https://your-app.up.railway.app/api/health`

## 🆘 Troubleshooting

**Build fails?**
- Check MongoDB URI is correct
- Ensure JWT_SECRET is set
- View Railway build logs for details

**App crashes after deploy?**
- Check railway dashboard logs
- Verify MONGO_URI is accessible from Railway servers
- Ensure NODE_ENV=production

**API calls 404?**
- Clear browser cache
- Verify CLIENT_URL in Railway variables
- Check CORS settings in server.js

## 📦 File Structure Reminder

```
Team_Task/
├── railway.json         (deployment config ✅ updated)
├── package.json         (root scripts)
├── .env                 (local only - NOT in git)
├── .env.example         (reference - commit this)
├── client/              (React frontend - builds to dist/)
│   ├── package.json
│   ├── vite.config.js
│   └── src/
├── server/              (Express backend)
│   ├── package.json
│   ├── server.js        (✅ updated for production)
│   ├── routes/
│   └── models/
```

## 🚨 What was fixed

### railway.json
```json
// BEFORE
"buildCommand": "cd client && npm install && npm run build && cd ../server && npm install"
"startCommand": "node server/server.js"

// AFTER
"buildCommand": "cd client && npm install && npm run build && cd ../server && npm install && cd .."
"startCommand": "NODE_ENV=production node server/server.js"
```

### server/server.js
```javascript
// BEFORE
app.listen(PORT, () => console.log(...))

// AFTER  
app.listen(PORT, "0.0.0.0", () => console.log(...))
// Listens on all network interfaces (required for Railway)
```
