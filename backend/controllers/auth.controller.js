import { getOrCreateUser } from '../../database/repositories/user.repository.js';

export async function syncUser(req, res) {
  try {
    if (!req.user || !req.user.uid) {
      res.status(401).json({ error: 'Invalid user token' });
      return;
    }
    const userRecord = await getOrCreateUser(req.user.uid, req.user.email || '');
    res.json(userRecord);
  } catch (error) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
}
