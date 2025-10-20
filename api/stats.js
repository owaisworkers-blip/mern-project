import { connectDB } from '../lib/db.js';
import { authenticate } from '../lib/auth.js';
import { 
  dashboardStats as getDashboardStats,
  analytics as getAnalytics,
  recommendations as getRecommendations,
  trending as getTrendingEvents,
  leaderboard as getLeaderboard,
  summary as getSummary
} from '../backend/src/controllers/statsController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${method} not allowed` });
  }
  
  // Authentication required for most endpoints
  const protectedEndpoints = ['dashboard', 'analytics', 'recommendations'];
  
  if (protectedEndpoints.includes(req.query.action)) {
    try {
      const user = authenticate(req);
      req.user = user;
    } catch (err) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  }
  
  switch (req.query.action) {
    case 'dashboard':
      return getDashboardStats(req, res);
    case 'analytics':
      return getAnalytics(req, res);
    case 'recommendations':
      return getRecommendations(req, res);
    case 'trending':
      return getTrendingEvents(req, res);
    case 'leaderboard':
      return getLeaderboard(req, res);
    case 'summary':
      return getSummary(req, res);
    default:
      return res.status(404).json({ message: 'Action not found' });
  }
}