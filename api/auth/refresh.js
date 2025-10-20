import { connectDB } from '../../../lib/db.js';
import User from '../../../backend/src/models/User.js';
import { generateJwtToken, generateRefreshToken } from '../../../backend/src/utils/generateToken.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    
    const user = await User.findOne({ refreshToken }).select('+refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new tokens
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const newRefreshToken = generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();
    
    res.status(200).json({ token, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}