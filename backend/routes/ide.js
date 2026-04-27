import express from 'express';
const router = express.Router();

const FILES = [
  { name: 'main.py', path: '/workspace/main.py', type: 'file', content: "print('Hello from Ignito Vlab!')", language: 'python' },
  { name: 'utils.py', path: '/workspace/utils.py', type: 'file', content: "def help():\n    print('Helping...')", language: 'python' }
];

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
  const { path, content } = req.body;
  const file = FILES.find(f => f.path === path);
  if (file) {
    file.content = content;
    res.json({ success: true, message: "File saved successfully" });
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// POST /api/run
router.post('/run', (req, res) => {
  res.json({
    success: true,
    runId: "run_" + Math.random().toString(36).substr(2, 9),
    message: "Execution started"
  });
});

export default router;
