import { connectDB } from '../../../lib/db.js';
import { listEvents } from '../../../backend/src/controllers/eventController.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    // Pass the request and response objects to the controller
    await listEvents(req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}