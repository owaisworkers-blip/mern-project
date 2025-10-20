import jwt from 'jsonwebtoken';
import User from '../backend/src/models/User.js';

export function authenticate(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Invalid token');
  }
}

export async function getCurrentUser(req) {
  const decoded = authenticate(req);
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
}

export function authorizeRoles(...allowedRoles) {
  return (req) => {
    const user = req.user;
    if (!user) {
      throw new Error('Authentication required');
    }
    
    if (!allowedRoles.includes(user.role)) {
      throw new Error('Insufficient permissions');
    }
    
    return user;
  };
}

export function checkRole(req, ...allowedRoles) {
  const user = req.user;
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }
  
  return user;
}