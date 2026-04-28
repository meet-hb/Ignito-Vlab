import express from 'express';
const router = express.Router();

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

// POST /api/run
router.post('/run', (req, res) => {
  res.json({
    success: true,
    runId: "run_" + Math.random().toString(36).substr(2, 9),
    message: "Execution started"
  });
});

export default router;
