import { connectDB } from '../lib/db.js';
import { authenticate } from '../lib/auth.js';
import { signup, login, logout, me as getProfile, updateProfile, changePassword, refresh } from '../backend/src/controllers/authController.js';

export default async function handler(req, res) {
  await connectDB();
  
  const { method } = req;
  
  // Authentication required for protected endpoints
  const protectedEndpoints = [
    'logout', 
    'change-password', 
    'me', 
    'profile',
    'refresh'
  ];
  
  const action = req.query.action;
  
  if (protectedEndpoints.includes(action) || (method === 'PUT' && action === 'profile')) {
    try {
      const user = authenticate(req);
      req.user = user;
    } catch (err) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  }
  
  switch (method) {
    case 'POST':
      switch (action) {
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
      if (action === 'me') {
        return getProfile(req, res);
      }
      return res.status(404).json({ message: 'Action not found' });
    case 'PUT':
      if (action === 'profile') {
        return updateProfile(req, res);
      }
      return res.status(404).json({ message: 'Action not found' });
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).json({ message: `Method ${method} not allowed` });
  }
}