import express from 'express';
const router = express.Router();

const MOCK_INSTANCES = [
  { id: 'i-01', name: 'web-server-01', status: 'Running', type: 't3.medium', region: 'us-east-1' },
  { id: 'i-02', name: 'db-primary', status: 'Stopped', type: 't3.large', region: 'us-east-1' }
];

const CATALOG = {
  regions: [
    { id: "us-east", name: "US East (N. Virginia)", code: "us-east-1" },
    { id: "us-west", name: "US West (Oregon)", code: "us-west-2" }
  ],
  images: [
    { id: "ubuntu", name: "Ubuntu 22.04 LTS", badge: "Linux" },
    { id: "windows", name: "Windows Server 2022", badge: "Windows" }
  ],
  plans: [
    { id: "p1", price: "$5.00", ram: "1 GB", cpu: "1 vCPU", ssd: "40 GB" },
    { id: "p2", price: "$10.00", ram: "2 GB", cpu: "1 vCPU", ssd: "60 GB" }
  ]
};

// GET /api/compute/instances
router.get('/instances', (req, res) => {
  res.json(MOCK_INSTANCES);
});

// GET /api/compute/catalog
router.get('/catalog', (req, res) => {
  res.json(CATALOG);
});

// POST /api/compute/instances
router.post('/instances', (req, res) => {
  const newInstance = { 
    ...req.body, 
    id: `i-${Math.random().toString(16).slice(2, 10)}`,
    status: 'Pending'
  };
  MOCK_INSTANCES.push(newInstance);
  res.json({ success: true, instanceId: newInstance.id, request: req.body });
});

export default router;
