import { connectDB } from '../../../lib/db.js';
import User from '../../../backend/src/models/User.js';
import { generateJwtToken, generateRefreshToken } from '../../../backend/src/utils/generateToken.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = await User.create({ name, email, password, role });
    const token = generateJwtToken({ id: user._id, role: user.role, name: user.name });
    const refreshToken = generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save();
    res.status(201).json({ 
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