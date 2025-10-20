import { connectDB } from '../lib/db.js';
import { 
  getDashboardStats,
  getAnalytics,
  getRecommendations,
  getTrendingEvents,
  getLeaderboard,
  getSummary
} from '../backend/src/controllers/statsController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${method} not allowed` });
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