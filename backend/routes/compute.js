import express from 'express';
import {
  ECSClient,
  ListTasksCommand,
  DescribeTasksCommand,
  RunTaskCommand
} from "@aws-sdk/client-ecs";
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const MOCK_INSTANCES = [
  { id: 'i-01', name: 'web-server-01', status: 'Running', type: 't3.medium', region: 'us-east-1' },
  { id: 'i-02', name: 'db-primary', status: 'Stopped', type: 't3.large', region: 'us-east-1' }
];

const CATALOG = {
  regions: [
    { id: "ap-south-1", name: "Asia Pacific (Mumbai)", code: "ap-south-1" },
    { id: "us-east", name: "US East (N. Virginia)", code: "us-east-1" }
  ],
  images: [
    { id: "vlab-base", name: "Standard VLab Environment", badge: "Fargate" },
    { id: "ubuntu", name: "Ubuntu 22.04 LTS", badge: "Linux" }
  ],
  plans: [
    { id: "fargate-1", price: "$0.04/hr", ram: "0.5 GB", cpu: "0.25 vCPU" },
    { id: "fargate-2", price: "$0.09/hr", ram: "2 GB", cpu: "1 vCPU" },
    { id: "fargate-3", price: "$0.18/hr", ram: "4 GB", cpu: "2 vCPU" }
  ]
};

// GET /api/compute/instances
router.get('/instances', async (req, res) => {
  try {
    const listTasks = await ecsClient.send(new ListTasksCommand({
      cluster: process.env.ECS_CLUSTER,
    }));

    if (!listTasks.taskArns || listTasks.taskArns.length === 0) {
      return res.json(MOCK_INSTANCES); // Fallback to mocks if no tasks found
    }

    const describeTasks = await ecsClient.send(new DescribeTasksCommand({
      cluster: process.env.ECS_CLUSTER,
      tasks: listTasks.taskArns,
    }));

    const tasks = describeTasks.tasks.map(t => ({
      id: t.taskArn.split('/').pop(),
      name: t.taskDefinitionArn.split('/').pop().split(':')[0],
      status: t.lastStatus,
      type: 'Fargate',
      region: process.env.AWS_REGION,
      createdAt: t.createdAt
    }));

    res.json([...MOCK_INSTANCES, ...tasks]);
  } catch (error) {
    console.error("Error listing Fargate tasks:", error);
    res.json(MOCK_INSTANCES); // Fallback to mocks on error
  }
});

// GET /api/compute/catalog
router.get('/catalog', (req, res) => {
  res.json(CATALOG);
});

// POST /api/compute/instances
router.post('/instances', async (req, res) => {
  const { taskDefinition } = req.body;

  if (!process.env.ECS_CLUSTER) {
    // Fallback logic for mock instance creation
    const newInstance = {
      ...req.body,
      id: `i-${Math.random().toString(16).slice(2, 10)}`,
      status: 'Pending'
    };
    MOCK_INSTANCES.push(newInstance);
    return res.json({ success: true, instanceId: newInstance.id, request: req.body });
  }

  try {
    const command = new RunTaskCommand({
      cluster: process.env.ECS_CLUSTER,
      taskDefinition: taskDefinition || process.env.ECS_TASK_DEFINITION_FAMILY,
      launchType: "FARGATE",
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: process.env.ECS_SUBNETS.split(','),
          securityGroups: process.env.ECS_SECURITY_GROUPS.split(','),
          assignPublicIp: "ENABLED",
        },
      },
    });

    const response = await ecsClient.send(command);
    const task = response.tasks[0];

    res.json({
      success: true,
      instanceId: task.taskArn.split('/').pop(),
      status: 'Pending',
      message: 'Fargate task provisioning started'
    });
  } catch (error) {
    console.error("Error starting Fargate task:", error);
    res.status(500).json({ success: false, message: "Failed to provision compute resource" });
  }
});

export default router;
