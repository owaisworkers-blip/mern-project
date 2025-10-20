import { connectDB } from '../lib/db.js';
import { authenticate } from '../lib/auth.js';
import { 
  registerForEvent,
  myRegistrations as getMyRegistrations,
  getPendingRegistrations,
  approveRegistration,
  denyRegistration,
  checkInParticipant,
  getEventParticipants
} from '../backend/src/controllers/registrationController.js';

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
      switch (req.query.action) {
        case 'register':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return registerForEvent(req, res);
          }
          return res.status(400).json({ message: 'Event ID required' });
        case 'approve':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return approveRegistration(req, res);
          }
          return res.status(400).json({ message: 'Registration ID required' });
        case 'deny':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return denyRegistration(req, res);
          }
          return res.status(400).json({ message: 'Registration ID required' });
        case 'checkin':
          if (req.query.id) {
            req.params = { id: req.query.id };
            return checkInParticipant(req, res);
          }
          return res.status(400).json({ message: 'Registration ID required' });
        default:
          return res.status(404).json({ message: 'Action not found' });
      }
    case 'GET':
      if (req.query.action === 'my') {
        return getMyRegistrations(req, res);
      } else if (req.query.action === 'pending') {
        return getPendingRegistrations(req, res);
      } else if (req.query.action === 'participants' && req.query.id) {
        req.params = { id: req.query.id };
        return getEventParticipants(req, res);
      }
      return res.status(404).json({ message: 'Action not found' });
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}