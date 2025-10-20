import { connectDB } from '../lib/db.js';
import Event from '../backend/src/models/Event.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  await connectDB();
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Try to fetch a few events to test the connection
    const events = await Event.find({}).limit(5);
    res.status(200).json({ 
      status: 'success',
      message: 'API is working correctly',
      events: events.map(e => ({ id: e._id, title: e.title })),
      count: events.length
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Failed to connect to database',
      error: error.message
    });
  }
}