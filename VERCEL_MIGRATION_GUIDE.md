# Migrating to Vercel Serverless Functions

This guide explains how to convert your existing backend to work with Vercel's serverless infrastructure while maintaining MongoDB connectivity and removing Express server dependencies.

## Overview of Changes Needed

1. Convert Express routes to Vercel API functions
2. Remove Express server setup
3. Remove Socket.IO dependencies
4. Maintain MongoDB Atlas connection
5. Adapt middleware for serverless environment

## Project Structure After Migration

```
.
├── api/                          # Vercel serverless functions
│   ├── auth/
│   │   ├── signup.js
│   │   ├── login.js
│   │   ├── me.js
│   │   └── [...].js
│   ├── events/
│   │   ├── list.js
│   │   ├── get.js
│   │   ├── create.js
│   │   └── [...].js
│   ├── registrations/
│   ├── reviews/
│   ├── admin/
│   ├── stats/
│   ├── sessions/
│   ├── feedback/
│   ├── exhibitors/
│   └── notifications/
├── lib/                          # Shared utilities
│   ├── db.js                    # Database connection
│   ├── auth.js                  # Authentication helpers
│   └── middleware.js            # Middleware adaptations
├── models/                       # Mongoose models (unchanged)
├── utils/                        # Utility functions (unchanged)
└── vercel.json                  # Vercel configuration
```

## Step-by-Step Migration Process

### 1. Create Vercel Configuration File

Create a `vercel.json` file in the project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ]
}
```

### 2. Adapt Database Connection for Serverless

Create `lib/db.js`:

```javascript
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

### 3. Adapt Authentication Middleware

Create `lib/auth.js`:

```javascript
import { verify } from 'jsonwebtoken';
import User from '../models/User.js';

export function authenticate(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Authentication required');
  }

  const token = authHeader.substring(7);
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const decoded = verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

export async function getCurrentUser(req) {
  const decoded = authenticate(req);
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}
```

### 4. Convert Route Files to Serverless Functions

#### Example: Auth Routes

Convert `backend/src/routes/authRoutes.js` to individual Vercel functions:

`api/auth/signup.js`:
```javascript
import { connectDB } from '../../lib/db.js';
import User from '../../models/User.js';
import { generateJwtToken, generateRefreshToken } from '../../utils/generateToken.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role });
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({ token, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
```

`api/auth/login.js`:
```javascript
import { connectDB } from '../../lib/db.js';
import User from '../../models/User.js';
import { generateJwtToken, generateRefreshToken } from '../../utils/generateToken.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ token, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
```

`api/auth/me.js`:
```javascript
import { connectDB } from '../../lib/db.js';
import { authenticate } from '../../lib/auth.js';
import User from '../../models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const decoded = authenticate(req);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points } });
  } catch (err) {
    res.status(401).json({ message: 'Authentication required' });
  }
}
```

### 5. Environment Variables

Set up your environment variables in Vercel:

```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://yourdomain.com
```

### 6. Remove Unused Files

Delete these files as they're no longer needed:
- `backend/src/server.js`
- `backend/src/services/socket.js`
- `backend/src/middleware/auth.js` (replaced by `lib/auth.js`)

## Deployment Steps

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

## API Endpoints After Migration

Your API endpoints will be accessible at:
- `https://your-vercel-app.vercel.app/api/auth/signup`
- `https://your-vercel-app.vercel.app/api/auth/login`
- `https://your-vercel-app.vercel.app/api/events`
- etc.

## Important Considerations

1. **Cold Starts**: Serverless functions may have cold starts. Consider this in your frontend implementation.

2. **Connection Management**: The database connection code includes connection pooling to minimize cold starts.

3. **Middleware Adaptation**: Express middleware needs to be adapted for serverless functions.

4. **Error Handling**: Each function should handle its own errors appropriately.

5. **CORS**: Vercel handles CORS differently than Express. You may need to configure this in `vercel.json`.

## Next Steps

1. Start by converting one route (e.g., auth routes) to test the setup
2. Verify database connectivity with MongoDB Atlas
3. Test authentication flow
4. Gradually convert all routes
5. Update frontend API calls to point to new Vercel endpoints