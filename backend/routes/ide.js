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
const FILES = [];

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
  const { path, content, name, language } = req.body;
  const fileIndex = FILES.findIndex(f => f.path === path);
  
  if (fileIndex !== -1) {
    FILES[fileIndex].content = content;
    res.json({ success: true, message: "File saved successfully" });
  } else {
    // Create new file
    FILES.push({
      name: name || path.split('/').pop(),
      path: path,
      type: 'file',
      content: content || '',
      language: language || 'python'
    });
    res.json({ success: true, message: "File created and saved successfully" });
  }
});

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
