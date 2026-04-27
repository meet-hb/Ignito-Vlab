import express from 'express';
const router = express.Router();

const SESSIONS = {};

// POST /api/lab-sessions
router.post('/', (req, res) => {
  const { labId, userId } = req.body;
  const sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
  
  SESSIONS[sessionId] = {
    sessionId,
    labId,
    status: "starting",
    message: "Lab provisioning started",
    estimatedReadyInSeconds: 60
  };

  res.json({ success: true, ...SESSIONS[sessionId] });
});

// GET /api/lab-sessions/:id
router.get('/:id', (req, res) => {
  const session = SESSIONS[req.params.id];
  if (session) {
    // Mocking progress: if it's starting, make it running on the first check
    if (session.status === 'starting') {
      session.status = 'running';
      session.message = 'Lab is ready';
      session.tools = {
        remoteDesktop: { enabled: true, url: "https://demo.ignito.com/rdp", token: "rdp-123" },
        terminal: { enabled: true, url: "https://demo.ignito.com/terminal", token: "term-123" }
      };
    }
    res.json(session);
  } else {
    res.status(404).json({ success: false, message: "Session not found" });
  }
});

// POST /api/lab-sessions/:id/stop
router.post('/:id/stop', (req, res) => {
  const session = SESSIONS[req.params.id];
  if (session) {
    session.status = 'stopped';
    session.message = 'Lab stopped successfully';
    res.json({ success: true, sessionId: req.params.id, status: 'stopped', message: 'Lab stopped successfully' });
  } else {
    res.status(404).json({ success: false, message: "Session not found" });
  }
});

export default router;
