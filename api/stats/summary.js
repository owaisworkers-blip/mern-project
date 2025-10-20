import { connectDB } from '../../../lib/db.js';
import { summary } from '../../../backend/src/controllers/statsController.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  await connectDB();

  try {
    // Call the existing controller function
    await summary(req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}