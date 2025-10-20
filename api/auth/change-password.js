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
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check current password
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Check new password length
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(401).json({ message: 'Authentication required' });
  }
}