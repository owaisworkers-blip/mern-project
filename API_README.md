# Vercel Serverless API Functions

This directory contains the converted backend routes as Vercel serverless functions.

## Directory Structure

```
api/
├── auth/
│   ├── signup.js
│   ├── login.js
│   ├── me.js
│   ├── profile.js
│   ├── change-password.js
│   ├── refresh.js
│   └── logout.js
├── events/
│   ├── index.js
│   ├── [id].js
│   ├── create.js
│   └── [id]/
│       ├── update.js
│       └── delete.js
├── registrations/
│   ├── [id]/
│   │   ├── register.js
│   │   ├── approve.js
│   │   ├── deny.js
│   │   ├── participants.js
│   │   └── checkin.js
│   ├── me.js
│   └── pending.js
├── reviews/
│   ├── [id]/
│   │   ├── index.js
│   │   ├── add.js
│   │   ├── update.js
│   │   └── delete.js
│   └── user/
│       └── me.js
├── admin/
│   ├── events/
│   │   ├── pending.js
│   │   └── [id]/
│   │       ├── approve.js
│   │       └── reject.js
│   └── users/
│       └── [id]/
│           ├── block.js
│           └── unblock.js
├── stats/
│   ├── leaderboard.js
│   ├── recommendations.js
│   ├── summary.js
│   ├── trending.js
│   ├── dashboard.js
│   └── analytics.js
└── ...
```

## How It Works

Each file in the `api/` directory represents a serverless function that can be deployed to Vercel. The file path determines the API endpoint:

- `api/auth/signup.js` → `/api/auth/signup`
- `api/events/[id].js` → `/api/events/:id`
- `api/registrations/[id]/approve.js` → `/api/registrations/:id/approve`

## Environment Variables

Make sure to set the following environment variables in your Vercel project:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-frontend-domain.com
```

## Deployment

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Set the environment variables in the Vercel dashboard
4. Deploy!

## API Endpoints

After deployment, your API will be available at:

- Auth: `https://your-vercel-app.vercel.app/api/auth/*`
- Events: `https://your-vercel-app.vercel.app/api/events/*`
- Registrations: `https://your-vercel-app.vercel.app/api/registrations/*`
- Reviews: `https://your-vercel-app.vercel.app/api/reviews/*`
- Admin: `https://your-vercel-app.vercel.app/api/admin/*`
- Stats: `https://your-vercel-app.vercel.app/api/stats/*`

## Notes

- All functions use the shared database connection from `lib/db.js` to minimize cold starts
- Authentication is handled by `lib/auth.js`
- The original controller functions from `backend/src/controllers/` are reused to maintain consistency
- File uploads are not yet implemented in this serverless version and would need additional handling