import express from 'express';
const router = express.Router();

const LABS = [
  {
    id: "python-lab",
    title: "Python Programming Lab",
    subtitle: "Master Python Basics to Advanced",
    logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/python/python.png",
    rating: 4.9,
    reviewCount: 210,
    durationMinutes: 90,
    credits: 30,
    complexity: "Beginner",
    category: "Programming",
    description: "Hands-on Python environment for learning syntax, data structures, and algorithms.",
    status: "ready",
    taskDefinition: "vlab-dev-python-task"
  },
  {
    id: "java-lab",
    title: "Java Development Lab",
    subtitle: "Object-Oriented Programming",
    logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/java/java.png",
    rating: 4.7,
    reviewCount: 155,
    durationMinutes: 120,
    credits: 40,
    complexity: "Intermediate",
    category: "Programming",
    description: "Build and compile Java applications in a pre-configured JDK environment.",
    status: "ready",
    taskDefinition: "vlab-dev-java-task"
  },
  {
    id: "linux-lab",
    title: "Linux Administration Lab",
    subtitle: "Bash Scripting & SysAdmin",
    logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/linux/linux.png",
    rating: 4.8,
    reviewCount: 180,
    durationMinutes: 60,
    credits: 25,
    complexity: "Beginner",
    category: "SysAdmin",
    description: "Practice Linux commands, file systems, and shell scripting in a secure Ubuntu environment.",
    status: "ready",
    taskDefinition: "vlab-dev-linux-task"
  },
  {
    id: "dbms-lab",
    title: "DBMS & SQL Lab",
    subtitle: "Database Management Systems",
    logo: "https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/sql/sql.png",
    rating: 4.6,
    reviewCount: 120,
    durationMinutes: 75,
    credits: 35,
    complexity: "Intermediate",
    category: "Databases",
    description: "Learn SQL queries and database design with MySQL/PostgreSQL pre-installed.",
    status: "ready",
    taskDefinition: "vlab-dev-dbms-task"
  }
];

const SUB_LABS = {
  "Python Programming Lab": [
    { id: "s1", title: "Variables & Types", duration: "15m", difficulty: "Beginner" },
    { id: "s2", title: "Control Flow", duration: "25m", difficulty: "Beginner" }
  ],
  "Java Development Lab": [
    { id: "s3", title: "Classes & Objects", duration: "30m", difficulty: "Intermediate" }
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

export { LABS };
export default router;
