import { connectDB } from '../../../../lib/db.js';
import { authenticate, checkRole } from '../../../../lib/auth.js';
import { participantsForEvent } from '../../../../backend/src/controllers/registrationController.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    // Authenticate user
    const user = authenticate(req);
    req.user = user;
    
    // Check roles (organizer or admin)
    checkRole(req, 'organizer', 'admin');
    
    // Call the existing controller function
    await participantsForEvent(req, res);
  } catch (err) {
    if (err.message === 'Authentication required' || err.message === 'Invalid token') {
      res.status(401).json({ message: 'Authentication required' });
    } else if (err.message === 'Insufficient permissions') {
      res.status(403).json({ message: 'Access denied' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
}