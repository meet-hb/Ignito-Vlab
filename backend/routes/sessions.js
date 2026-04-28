import express from 'express';
import { 
  ECSClient, 
  RunTaskCommand, 
  DescribeTasksCommand, 
  StopTaskCommand 
} from "@aws-sdk/client-ecs";
import { 
  EC2Client, 
  DescribeNetworkInterfacesCommand 
} from "@aws-sdk/client-ec2";
import { LABS } from './labs.js';
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

const ec2Client = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const SESSIONS = {}; // Exported for use in ide.js

// Helper: Get Public IP from ECS Task (Uses EC2 DescribeNetworkInterfaces)
async function getTaskPublicIp(taskArn) {
  try {
    console.log(`Searching Public IP for task: ${taskArn}`);
    const taskDetails = await ecsClient.send(new DescribeTasksCommand({
      cluster: process.env.ECS_CLUSTER,
      tasks: [taskArn],
    }));

    const task = taskDetails.tasks[0];
    const attachment = task.attachments.find(a => a.type === 'ElasticNetworkInterface');
    if (!attachment) {
      console.warn("No ElasticNetworkInterface attachment found for task yet.");
      return null;
    }

    const eniId = attachment.details.find(d => d.name === 'networkInterfaceId')?.value;
    if (!eniId) {
      console.warn("No Network Interface ID found in attachment.");
      return null;
    }

    console.log(`Found ENI ID: ${eniId}. Fetching Public IP...`);
    const eniDetails = await ec2Client.send(new DescribeNetworkInterfacesCommand({
      NetworkInterfaceIds: [eniId],
    }));

    const publicIp = eniDetails.NetworkInterfaces[0]?.Association?.PublicIp;
    if (publicIp) {
      console.log(`Successfully found Public IP: ${publicIp}`);
    } else {
      console.warn(`No Public IP associated with ENI ${eniId} yet.`);
    }
    return publicIp;
  } catch (error) {
    console.error("Error in getTaskPublicIp:", error);
    return null;
  }
}

// POST /api/lab-sessions
router.post('/', async (req, res) => {
  const { labId, userId } = req.body;
  console.log(`Starting lab session: labId=${labId}, userId=${userId}`);

  // Check if user already has an active session
  const existingSessionId = Object.keys(SESSIONS).find(sid => 
    SESSIONS[sid].userId === userId && SESSIONS[sid].status !== 'failed'
  );

  if (existingSessionId) {
    console.log(`User ${userId} already has an active session: ${existingSessionId}`);
    return res.json({ success: true, ...SESSIONS[existingSessionId], message: "You already have an active lab session." });
  }

  const lab = LABS.find(l => l.id === labId);

  if (!lab) {
    console.error(`Lab not found for ID: ${labId}`);
    return res.status(404).json({ success: false, message: "Lab not found" });
  }

  try {
    const sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
    
    console.log(`Requesting Fargate Task for ${lab.taskDefinition}...`);
    const taskParams = {
      cluster: process.env.ECS_CLUSTER,
      taskDefinition: lab.taskDefinition, 
      launchType: "FARGATE",
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: process.env.ECS_SUBNETS ? process.env.ECS_SUBNETS.split(',').map(s => s.trim()) : [],
          securityGroups: process.env.ECS_SECURITY_GROUPS ? process.env.ECS_SECURITY_GROUPS.split(',').map(s => s.trim()) : [],
          assignPublicIp: "ENABLED",
        },
      },
    };
    
    console.log("AWS RUN_TASK PARAMS:", JSON.stringify(taskParams, null, 2));
    const command = new RunTaskCommand(taskParams);

    const response = await ecsClient.send(command);
    
    if (!response.tasks || response.tasks.length === 0) {
       throw new Error("AWS ECS failed to return a task object. Check cluster capacity or limits.");
    }

    const taskArn = response.tasks[0].taskArn;
    console.log(`Fargate Task started successfully! TaskArn: ${taskArn}`);

    SESSIONS[sessionId] = {
      sessionId,
      labId,
      userId,
      taskArn,
      status: "starting",
      message: `Provisioning ${lab.title} environment...`,
      estimatedReadyInSeconds: 45,
      expiresAt: new Date(Date.now() + 120 * 60 * 1000).toISOString()
    };

    res.json({ success: true, ...SESSIONS[sessionId] });
  } catch (error) {
    console.error("FARGATE START ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to start lab environment", error: error.message });
  }
});

// GET /api/lab-sessions/user/:userId
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sessionId = Object.keys(SESSIONS).find(sid => 
    SESSIONS[sid].userId === userId && SESSIONS[sid].status !== 'failed'
  );

  if (sessionId) {
    res.json({ success: true, session: SESSIONS[sessionId] });
  } else {
    res.json({ success: false, message: "No active session found" });
  }
});

// GET /api/lab-sessions/:id
router.get('/:id', async (req, res) => {
  const session = SESSIONS[req.params.id];
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  if (session.status === 'starting') {
    try {
      const describeTasks = await ecsClient.send(new DescribeTasksCommand({
        cluster: process.env.ECS_CLUSTER,
        tasks: [session.taskArn],
      }));

      const task = describeTasks.tasks[0];
      if (task.lastStatus === 'RUNNING') {
        const publicIp = await getTaskPublicIp(session.taskArn);
        if (publicIp) {
          session.status = 'running';
          session.message = 'Lab environment is ready';
          session.publicIp = publicIp;
          session.tools = {
            remoteDesktop: { enabled: true, url: `http://${publicIp}:8888/vnc`, token: "rdp-123" },
            terminal: { enabled: true, url: `http://${publicIp}:8888/terminal`, token: "term-123" },
            ide: { enabled: true, url: `/admin/compute/ide?sessionId=${session.sessionId}` }
          };
        }
      } else if (task.lastStatus === 'STOPPED') {
        session.status = 'failed';
        session.message = `Lab environment failed to start. Reason: ${task.stoppedReason || 'Container exited'}`;
        console.error(`Task ${session.taskArn} stopped. Reason: ${task.stoppedReason}`);
      }
    } catch (error) {
      console.error("Status Poll Error:", error);
    }
  }

  res.json(session);
});

// POST /api/lab-sessions/:id/stop
router.post('/:id/stop', async (req, res) => {
  const session = SESSIONS[req.params.id];
  if (!session) {
    return res.status(404).json({ success: false, message: "Session not found" });
  }

  try {
    await ecsClient.send(new StopTaskCommand({
      cluster: process.env.ECS_CLUSTER,
      task: session.taskArn,
      reason: "User requested stop"
    }));

    session.status = 'stopped';
    session.message = 'Lab environment stopped';
    res.json({ success: true, sessionId: req.params.id, status: 'stopped' });
  } catch (error) {
    console.error("Fargate Stop Error:", error);
    res.status(500).json({ success: false, message: "Failed to stop environment" });
  }
});

export default router;
