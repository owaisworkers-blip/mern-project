import { connectDB } from '../../../lib/db.js';
import { authenticate } from '../../../lib/auth.js';
import User from '../../../backend/src/models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const decoded = authenticate(req);
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        points: user.points 
      } 
    });
  } catch (err) {
    res.status(401).json({ message: 'Authentication required' });
  }
}