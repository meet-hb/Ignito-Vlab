import express from 'express';
import { SESSIONS } from './sessions.js';
// Using built-in fetch (available in Node.js 18+)
// If on older Node version, you'll need to 'npm install node-fetch'

const router = express.Router();

// Helper to get session by ID from request (usually passed in headers or query)
const getSession = (req) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  return SESSIONS[sessionId];
};

// POST /api/run
router.post('/run', async (req, res) => {
  const session = getSession(req);
  if (!session || !session.publicIp) {
    return res.status(400).json({ success: false, message: "Active session required" });
  }

  try {
    const response = await fetch(`http://${session.publicIp}:8888/api/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("IDE Proxy Error (Run):", error);
    res.status(502).json({ success: false, message: "Failed to execute code in container" });
  }
});

export default router;
