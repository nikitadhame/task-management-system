# Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] MongoDB Atlas account created
- [ ] MongoDB URI obtained (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`)
- [ ] JWT_SECRET generated (strong random string)
- [ ] Code pushed to GitHub
- [ ] Railway project created and connected to GitHub repo

## ✅ Railway Environment Variables Set

Set these in Railway dashboard (Project Settings → Variables):

- [ ] `MONGO_URI` = your MongoDB Atlas connection string
- [ ] `JWT_SECRET` = your strong random secret
- [ ] `NODE_ENV` = `production`
- [ ] `CLIENT_URL` = (set after first deploy, format: `https://your-app-name.up.railway.app`)

## ✅ Files Updated

- [x] `railway.json` - Build and start commands fixed
- [x] `server/server.js` - Listening on 0.0.0.0 and better error handling
- [x] `.env.example` - Reference file created
- [x] `RAILWAY_DEPLOYMENT.md` - Full deployment guide

## 🚀 Deployment Process

1. **Commit and Push**
   ```bash
   git add .
   git commit -m "Fix: Railway deployment configuration"
   git push
   ```

2. **Go to Railway Dashboard**
   - Select your project
   - Go to **Variables** tab
   - Add the 4 environment variables listed above

3. **Trigger Deploy**
   - Railway should auto-deploy on push, OR
   - Click "Redeploy" button manually

4. **Wait for Build**
   - Watch the Deployments tab
   - Build should take 2-5 minutes
   - Check logs if there are errors

5. **After Successful Deploy**
   - Get your URL (shown in Railway dashboard)
   - Update `CLIENT_URL` variable to this URL
   - Trigger another deployment
   - Test the app!

## 🔗 Testing the Deployment

After deployment is live:

1. **Test Frontend**: Visit your Railway URL in browser
2. **Test Health Check**: `https://your-app.up.railway.app/api/health`
3. **Test Login**: Create an account and log in
4. **Test Database**: Create a project - should save to MongoDB
5. **Check Browser DevTools**: Network tab to ensure no 404s

## 📞 Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Build fails | Check MONGO_URI format is correct |
| App crashes after deploy | Verify MONGO_URI is accessible from Railway servers |
| Login page loads but can't submit | Check if MongoDB connection failed (see logs) |
| API calls return 404 | Clear browser cache, wait 1 minute, refresh |
| Blank white screen | Check browser console for JavaScript errors |
| Cannot connect to database | Test MongoDB URI directly in MongoDB Atlas |

## 📋 After Deployment Success

1. Update `CLIENT_URL` in Railway with your actual deployment URL
2. Test all features (login, create project, create task, etc.)
3. Check server logs for any warnings
4. Set up database backups if using MongoDB Atlas free tier
5. Keep JWT_SECRET safe - never commit it to git

## 📚 Useful Links

- [Railway Docs](https://docs.railway.app)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Node.js Deployment Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Need Help?**
- Check Railway logs: Dashboard → Deployments → View logs
- Check browser console: F12 → Console tab
- Verify MongoDB connection: MongoDB Atlas → Cluster → Check IP whitelist (should be 0.0.0.0)
