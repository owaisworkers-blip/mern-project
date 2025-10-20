import { connectDB } from '../lib/db.js';
import { authenticate } from '../lib/auth.js';
import { 
  createEvent, 
  listEvents as getEvents, 
  getEvent as getEventById, 
  updateEvent, 
  deleteEvent 
} from '../backend/src/controllers/eventController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
  // Authentication required for POST, PUT, DELETE
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    try {
      const user = authenticate(req);
      req.user = user;
    } catch (err) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  }
  
  switch (method) {
    case 'POST':
      return createEvent(req, res);
    case 'GET':
      if (req.query.id) {
        req.params = { id: req.query.id };
        return getEventById(req, res);
      }
      return getEvents(req, res);
    case 'PUT':
      if (req.query.id) {
        req.params = { id: req.query.id };
        return updateEvent(req, res);
      }
      return res.status(400).json({ message: 'Event ID required' });
    case 'DELETE':
      if (req.query.id) {
        req.params = { id: req.query.id };
        return deleteEvent(req, res);
      }
      return res.status(400).json({ message: 'Event ID required' });
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}