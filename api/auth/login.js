import { connectDB } from '../../../lib/db.js';
import User from '../../../backend/src/models/User.js';
import { generateJwtToken, generateRefreshToken } from '../../../backend/src/utils/generateToken.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    if (user.isBlocked) return res.status(403).json({ message: 'User is blocked' });
    const valid = await user.comparePassword(password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    res.status(200).json({ 
      token, 
      refreshToken, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}