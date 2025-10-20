import { connectDB } from '../lib/db.js';
import { authenticate } from '../lib/auth.js';
import { 
  createEvent, 
  getEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent 
} from '../backend/src/controllers/eventController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
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