import { connectDB } from '../../../lib/db.js';
import { authenticate } from '../../../lib/auth.js';
import User from '../../../backend/src/models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const decoded = authenticate(req);
    // Remove refresh token from user
    await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(401).json({ message: 'Authentication required' });
  }
}