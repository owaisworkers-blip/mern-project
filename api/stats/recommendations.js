import { connectDB } from '../../../lib/db.js';
import { authenticate } from '../../../lib/auth.js';
import { recommendations } from '../../../backend/src/controllers/statsController.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    // Authenticate user
    const user = authenticate(req);
    req.user = user;
    
    // Call the existing controller function
    await recommendations(req, res);
  } catch (err) {
    if (err.message === 'Authentication required' || err.message === 'Invalid token') {
      res.status(401).json({ message: 'Authentication required' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
}