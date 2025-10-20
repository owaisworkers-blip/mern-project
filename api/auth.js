import { connectDB } from '../lib/db.js';
import { signup, login, logout, getProfile, updateProfile, changePassword, refresh } from '../backend/src/controllers/authController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
  switch (method) {
    case 'POST':
      switch (req.query.action) {
        case 'signup':
          return signup(req, res);
        case 'login':
          return login(req, res);
        case 'logout':
          return logout(req, res);
        case 'refresh':
          return refresh(req, res);
        case 'change-password':
          return changePassword(req, res);
        default:
          return res.status(404).json({ message: 'Action not found' });
      }
    case 'GET':
      if (req.query.action === 'me') {
        return getProfile(req, res);
      }
      return res.status(404).json({ message: 'Action not found' });
    case 'PUT':
      if (req.query.action === 'profile') {
        return updateProfile(req, res);
      }
      return res.status(404).json({ message: 'Action not found' });
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}