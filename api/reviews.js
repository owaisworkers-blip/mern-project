import { connectDB } from '../lib/db.js';
import { authenticate } from '../lib/auth.js';
import { 
  addReview,
  listReviews as getReviews,
  updateReview,
  deleteReview,
  getUserReviews as getMyReviews
} from '../backend/src/controllers/reviewController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
  // Authentication required for all endpoints
  try {
    const user = authenticate(req);
    req.user = user;
  } catch (err) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  switch (method) {
    case 'POST':
      if (req.query.action === 'add' && req.query.id) {
        req.params = { id: req.query.id };
        return addReview(req, res);
      }
      return res.status(400).json({ message: 'Event ID required' });
    case 'GET':
      if (req.query.action === 'my') {
        return getMyReviews(req, res);
      } else if (req.query.id) {
        req.params = { id: req.query.id };
        return getReviews(req, res);
      }
      return res.status(400).json({ message: 'Event ID required' });
    case 'PUT':
      if (req.query.action === 'update' && req.query.id) {
        req.params = { id: req.query.id };
        return updateReview(req, res);
      }
      return res.status(400).json({ message: 'Review ID required' });
    case 'DELETE':
      if (req.query.action === 'delete' && req.query.id) {
        req.params = { id: req.query.id };
        return deleteReview(req, res);
      }
      return res.status(400).json({ message: 'Review ID required' });
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}