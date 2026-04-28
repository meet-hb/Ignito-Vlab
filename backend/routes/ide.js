import express from 'express';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { SESSIONS } from './sessions.js';

const router = express.Router();
const FILES = [];

// Helper to get session by ID from request (usually passed in headers or query)
const getSession = (req) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId;
  return SESSIONS[sessionId];
};

// GET /api/files
router.get('/', (req, res) => {
  res.json({
    success: true,
    files: FILES.map(({ content, language, ...file }) => file)
  });
});

// GET /api/files/content
router.get('/content', (req, res) => {
  const file = FILES.find(f => f.path === req.query.path);
  if (file) {
    res.json({ success: true, path: file.path, content: file.content, language: file.language });
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// POST /api/save
router.post('/save', (req, res) => {
  const { path: filePath, content, name, language } = req.body;
  const fileIndex = FILES.findIndex(f => f.path === filePath);

  if (fileIndex !== -1) {
    FILES[fileIndex].content = content;
    res.json({ success: true, message: "File saved successfully" });
  } else {
    // Create new file
    FILES.push({
      name: name || filePath.split('/').pop(),
      path: filePath,
      type: 'file',
      content: content || '',
      language: language || 'python'
    });
    res.json({ success: true, message: "File created and saved successfully" });
  }
});

// POST /api/run
router.post('/run', async (req, res) => {
  const session = getSession(req);
  
  // If we have an active session with a public IP, we should proxy the run command to the container
  if (session && session.publicIp) {
    try {
      const response = await fetch(`http://${session.publicIp}:8888/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.json(data);
    } catch (error) {
      console.error("IDE Proxy Error (Run):", error);
      // Fallback to local execution if proxy fails
    }
  }

  // Local execution fallback
  const { path: filePath, language } = req.body;
  const file = FILES.find(f => f.path === filePath);

  if (!file) return res.status(404).json({ success: false, message: "File not found" });

  if (language === 'python') {
    const tempFile = path.join(os.tmpdir(), `vlab_${Date.now()}.py`);
    fs.writeFileSync(tempFile, file.content);

    // Commands to try in order
    const commands = process.platform === 'win32' ? ['python', 'py', 'python3'] : ['python3', 'python'];

    const tryExecute = (index) => {
      if (index >= commands.length) {
        return res.json({
          success: true,
          output: "",
          error: "Python not found. Please install Python and add it to PATH.",
          runId: "run_" + Math.random().toString(36).substr(2, 9)
        });
      }

      const cmd = commands[index];
      exec(`${cmd} "${tempFile}"`, { timeout: 10000 }, (error, stdout, stderr) => {
        // If command not found, try next one
        if (error && (error.message.includes('not recognized') || error.message.includes('not found') || error.code === 127 || error.code === 'ENOENT')) {
          return tryExecute(index + 1);
        }

        // Clean up
        try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (e) { }

        res.json({
          success: true,
          output: stdout,
          error: stderr || (error ? (error.killed ? "Execution timed out (10s)" : error.message) : null),
          runId: "run_" + Math.random().toString(36).substr(2, 9)
        });
      });
    };

    tryExecute(0);
  } else {
    res.json({
      success: true,
      runId: "run_" + Math.random().toString(36).substr(2, 9),
      message: "Execution started locally"
    });
  }
});

export default router;
