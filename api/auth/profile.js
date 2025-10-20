import { connectDB } from '../../../lib/db.js';
import { authenticate } from '../../../lib/auth.js';
import User from '../../../backend/src/models/User.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    const decoded = authenticate(req);
    const { name, email, interests, avatarUrl } = req.body;
    
    // Prepare update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (interests) updateData.interests = interests;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    
    // Check if email is being updated and if it's already taken
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: decoded.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }
    
    const user = await User.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (err) {
    res.status(401).json({ message: 'Authentication required' });
  }
}