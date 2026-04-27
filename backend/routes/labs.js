import express from 'express';
const router = express.Router();

const LABS = [
  {
    id: "p1",
    title: "Building with Amazon Bedrock",
    subtitle: "Enterprise Infrastructure Hub",
    logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/aws/aws.png",
    rating: 4.8,
    reviewCount: 150,
    durationMinutes: 120,
    credits: 50,
    complexity: "Expert",
    category: "AWS Advanced",
    description: "Hands-on guided lab for building with Amazon Bedrock generative AI applications.",
    status: "ready"
  }
];

const SUB_LABS = {
  "Building with Amazon Bedrock": [
    { id: "s1", title: "Intro to Bedrock", duration: "30m", difficulty: "Beginner" },
    { id: "s2", title: "Model Customization", duration: "45m", difficulty: "Intermediate" }
  ]
};

// GET /api/labs
router.get('/', (req, res) => {
  res.json(LABS);
});

// GET /api/labs/sub-labs
router.get('/sub-labs', (req, res) => {
  res.json(SUB_LABS);
});

// GET /api/labs/:id
router.get('/:id', (req, res) => {
  const lab = LABS.find(l => l.id === req.params.id);
  if (lab) {
    res.json({ success: true, lab });
  } else {
    res.status(404).json({ success: false, message: "Lab not found" });
  }
});

export default router;
