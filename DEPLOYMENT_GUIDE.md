# Deployment Guide

## Prerequisites
1. Vercel account (https://vercel.com)
2. MongoDB Atlas account (https://cloud.mongodb.com)
3. GitHub account with the repository pushed

## Step-by-Step Deployment

### 1. Create MongoDB Atlas Cluster
1. Go to https://cloud.mongodb.com
2. Create a new cluster or use an existing one
3. Create a new database user with read/write permissions
4. Add your IP address to the IP whitelist (or allow access from anywhere for testing)
5. Get your MongoDB connection string:
   - Click "Connect" button
   - Choose "Connect your application"
   - Copy the connection string and replace `<password>` with your user's password

### 2. Configure Vercel Project
1. Go to https://vercel.com
2. Sign up or log in
3. Click "New Project"
4. Import your GitHub repository (`owaisworkers-blip/mern-project`)
5. Configure project settings:
   - Framework: Other
   - Root Directory: Leave empty
   - Build Command: Leave empty (Vercel will automatically detect the vercel.json)
   - Output Directory: Leave empty

### 3. Set Environment Variables
In the Vercel project settings, add these environment variables:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_key
CLIENT_URL=https://your-vercel-app.vercel.app
```

### 4. Deploy
1. Click "Deploy"
2. Wait for the deployment to complete
3. Your API will be available at `https://your-vercel-app.vercel.app/api/`

## API Endpoints

After deployment, your API will be available at:

- Auth: `https://your-vercel-app.vercel.app/api/auth/*`
- Events: `https://your-vercel-app.vercel.app/api/events/*`
- Registrations: `https://your-vercel-app.vercel.app/api/registrations/*`
- Reviews: `https://your-vercel-app.vercel.app/api/reviews/*`
- Admin: `https://your-vercel-app.vercel.app/api/admin/*`
- Stats: `https://your-vercel-app.vercel.app/api/stats/*`

## Health Check

You can verify your deployment is working by visiting:
`https://your-vercel-app.vercel.app/api/health`

## Troubleshooting

1. **Deployment fails**: Check the build logs in the Vercel dashboard
2. **API returns 500 errors**: Verify your MongoDB connection string and credentials
3. **CORS errors**: Ensure CLIENT_URL is set correctly in environment variables
4. **Authentication issues**: Check that JWT_SECRET is set correctly

## Next Steps

1. Update your frontend to point to the new Vercel API URL
2. Test all API endpoints
3. Monitor the Vercel logs for any issues
4. Set up custom domain if needed