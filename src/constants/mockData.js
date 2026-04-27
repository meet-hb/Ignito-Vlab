import { LABS, SUB_LABS_DATA } from './labs';

export const MOCK_USER = {
  id: 'user-admin-001',
  name: 'Meet Nayak',
  role: 'Super Admin',
  email: 'admin@ignito.com',
};

export const MOCK_LABS = LABS.map((lab) => ({
  ...lab,
  category: lab.category || 'Infrastructure',
}));

export const MOCK_SUB_LABS = SUB_LABS_DATA;

const ALL_SUB_LABS = Object.values(SUB_LABS_DATA).flat();

export const MOCK_LAB_DETAILS = Object.fromEntries(
  ALL_SUB_LABS.map((lab) => [
    lab.id,
    {
      id: lab.id,
      title: lab.title,
      subtitle: 'Enterprise Infrastructure Hub',
      logo: lab.logo,
      rating: lab.rating || 0,
      reviewCount: lab.rating ? 1 : 0,
      durationMinutes: Number.parseInt(lab.duration, 10) || 60,
      credits: lab.credits || 0,
      complexity: lab.level || 'Expert',
      category: lab.category || 'AWS Advanced',
      description: `Hands-on guided lab for ${lab.title}.`,
      status: 'ready',
    },
  ]),
);

export const MOCK_LAB_SESSION = {
  success: true,
  sessionId: 'sess_12345',
  labId: 'p1',
  status: 'running',
  message: 'Lab is ready',
  startedAt: '2026-04-25T10:00:00Z',
  expiresAt: '2026-04-25T12:00:00Z',
  estimatedReadyInSeconds: 120,
  credentials: {
    username: 'student',
    password: 'demo123',
    accountId: '177114680353',
    accessKey: 'XXXX',
    secretAccessKey: 'XXXX',
  },
  tools: {
    remoteDesktop: {
      enabled: true,
      url: '/admin/compute/rdp',
      token: 'rdp-token',
    },
    terminal: {
      enabled: true,
      url: '/admin/compute/terminals',
      token: 'terminal-token',
    },
    ide: {
      enabled: true,
      url: '/admin/compute/ide',
      token: 'ide-token',
    },
  },
};

export const MOCK_IDE_FILES = [
  {
    name: 'main.py',
    path: '/workspace/main.py',
    type: 'file',
    language: 'python',
    content: "print('Hello from Vlab Python')\n",
  },
  {
    name: 'App.java',
    path: '/workspace/App.java',
    type: 'file',
    language: 'java',
    content: 'class App {\n  public static void main(String[] args) {\n    System.out.println("Hello Java");\n  }\n}\n',
  },
  {
    name: 'query.sql',
    path: '/workspace/query.sql',
    type: 'file',
    language: 'sql',
    content: 'SELECT * FROM students;\n',
  },
];

export const MOCK_RUN_RESPONSE = {
  success: true,
  runId: 'run_123',
  message: 'Execution started',
};

export const MOCK_TERMINAL_EVENTS = [
  { type: 'stdout', runId: 'run_123', data: 'Program started...\n' },
  { type: 'stdout', runId: 'run_123', data: 'Loading dependencies...\n' },
  { type: 'stdout', runId: 'run_123', data: 'Execution completed successfully.\n' },
  { type: 'exit', runId: 'run_123', exitCode: 0, message: 'Execution completed' },
];

export const MOCK_INSTANCES = [
  {
    id: 'i-04f2d5e1',
    name: 'Production_Web_Server',
    os: 'Ubuntu 22.04 LTS',
    status: 'running',
    ip: '3.142.155.20',
    location: 'Ohio (us-east-2a)',
    plan: '2 GB RAM, 1 vCPU, 60 GB SSD',
    cost: '$10.00/mo',
    uptime: '14 days, 5 hours',
    cpu: 12,
    ram: 45,
  },
  {
    id: 'i-09a3b2c1',
    name: 'Dev_API_Gateway',
    os: 'Amazon Linux 2023',
    status: 'stopped',
    ip: '18.221.44.112',
    location: 'Mumbai (ap-south-1)',
    plan: '512 MB RAM, 1 vCPU, 20 GB SSD',
    cost: '$3.50/mo',
    uptime: '0 days',
    cpu: 0,
    ram: 0,
  },
  {
    id: 'i-0bb77f6a',
    name: 'Database_Replica_01',
    os: 'Debian 12',
    status: 'running',
    ip: '52.14.99.201',
    location: 'London (eu-west-2)',
    plan: '4 GB RAM, 2 vCPU, 80 GB SSD',
    cost: '$20.00/mo',
    uptime: '2 days, 11 hours',
    cpu: 68,
    ram: 72,
  },
];

export const MOCK_CREATE_INSTANCE_OPTIONS = {
  regions: [
    { id: 'us-east', name: 'US East (N. Virginia)', code: 'us-east-1' },
    { id: 'us-west', name: 'US West (Oregon)', code: 'us-west-2' },
    { id: 'ap-south', name: 'Asia Pacific (Mumbai)', code: 'ap-south-1' },
    { id: 'eu-west', name: 'Europe (London)', code: 'eu-west-2' },
  ],
  images: [
    { id: 'ubuntu', name: 'Ubuntu 22.04 LTS', badge: 'Linux' },
    { id: 'debian', name: 'Debian 12', badge: 'Linux' },
    { id: 'amazon-linux', name: 'Amazon Linux 2023', badge: 'AWS' },
    { id: 'windows', name: 'Windows Server 2022', badge: 'Windows' },
  ],
  plans: [
    { id: 'p1', price: '$3.50', ram: '512 MB', cpu: '1 vCPU', ssd: '20 GB', transfer: '1 TB' },
    { id: 'p2', price: '$5.00', ram: '1 GB', cpu: '1 vCPU', ssd: '40 GB', transfer: '2 TB', popular: true },
    { id: 'p3', price: '$10.00', ram: '2 GB', cpu: '1 vCPU', ssd: '60 GB', transfer: '3 TB' },
    { id: 'p4', price: '$20.00', ram: '4 GB', cpu: '2 vCPU', ssd: '80 GB', transfer: '4 TB' },
  ],
};
