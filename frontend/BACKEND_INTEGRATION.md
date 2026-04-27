# Backend Integration Guide

## Current frontend mode

The app now supports two modes:

- `VITE_USE_MOCK_API=true`: demo-safe mode for client presentation
- `VITE_USE_MOCK_API=false`: real backend mode

Set these in `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_API=false
```

## Frontend service entry points

- `src/services/authService.js`
- `src/services/labService.js`
- `src/services/computeService.js`
- `src/services/userService.js`
- `src/lib/apiClient.js`
- `src/config/env.js`

These are the only places you should need to update for backend wiring.

## Suggested Docker backend APIs

### Users / Identity

- `GET /users`: List all users.
- `POST /users`: Authorize/Create a new user.
- `PATCH /users/:userId/status`: Enable or disable a user.

Response for `GET /users`:

```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "name": "Ankur Patel",
      "email": "info@hackberrysoftech.com",
      "role": "Tenant Admin",
      "status": "CONFIRMED",
      "enabled": "True",
      "created": "23-07-2025",
      "updated": "29-09-2025"
    }
  ]
}
```

### Auth

- `POST /auth/login`

Request:

```json
{
  "email": "admin@ignito.com",
  "password": "admin123"
}
```

Response:

```json
{
  "user": {
    "id": "user-admin-001",
    "name": "Meet Nayak",
    "role": "Super Admin",
    "email": "admin@ignito.com"
  },
  "token": "jwt-or-session-token"
}
```

### Labs

- `GET /labs`
- `GET /labs/sub-labs`
- `GET /labs/:labId`
- `POST /lab-sessions`
- `GET /lab-sessions/:sessionId`
- `POST /lab-sessions/:sessionId/stop`

### Lab Details API

The `View Lab` screen needs a detailed lab payload for the selected lab/sub-lab.

#### Get Lab Details

- `GET /labs/:labId`

Response:

```json
{
  "success": true,
  "lab": {
    "id": "p1",
    "title": "Building with Amazon Bedrock",
    "subtitle": "Enterprise Infrastructure Hub",
    "logo": "https://your-cdn.com/labs/bedrock-logo.png",
    "rating": 0,
    "reviewCount": 0,
    "durationMinutes": 120,
    "credits": 50,
    // "complexity": "Expert",
    // "category": "AWS Advanced",
    // "description": "Hands-on guided lab for building with Amazon Bedrock.",
    "status": "ready"
  }
}
```

#### Required fields for `View Lab` page

The frontend needs these fields to render the lab detail hero section:

- `lab.id`
- `lab.title`
- `lab.subtitle`
- `lab.logo`
- `lab.rating`
- `lab.reviewCount`
- `lab.durationMinutes`
- `lab.credits`
- `lab.complexity`
- `lab.category`
- `lab.description`
- `lab.status`

#### UI mapping

These values are shown on the page as:

- `subtitle` -> `ENTERPRISE INFRASTRUCTURE HUB`
- `title` -> `Building with Amazon Bedrock`
- `rating` + `reviewCount` -> `(0.0) NO REVIEWS YET`
- `durationMinutes` -> `120 MINS`
- `credits` -> `50 CREDITS`
- `complexity` -> `EXPERT`
- `category` -> `AWS ADVANCED`
- `status` -> lab readiness / infrastructure availability

#### Notes for backend

- `durationMinutes` should be numeric from backend; frontend can format it as `120 MINS`
- `credits` should be numeric
- `complexity` should be a readable string like `Beginner`, `Intermediate`, `Expert`
- `category` should be a readable label
- `logo` should be a directly usable image URL
- `status` can be values like `ready`, `busy`, `maintenance`

### Start Lab / Lab Session APIs

The frontend needs a session-based flow after the user clicks `Start Lab`.

#### Start Lab

- `POST /lab-sessions`

Request:

```json
{
  "labId": "p1",
  "userId": "user-admin-001"
}
```

Success response:

```json
{
  "success": true,
  "sessionId": "sess_12345",
  "labId": "p1",
  "status": "starting",
  "message": "Lab provisioning started",
  "estimatedReadyInSeconds": 120
}
```

Error response:

```json
{
  "success": false,
  "message": "Unable to start lab"
}
```

#### Lab Session Status

- `GET /lab-sessions/:sessionId`

Response while provisioning:

```json
{
  "success": true,
  "sessionId": "sess_12345",
  "labId": "p1",
  "status": "starting",
  "message": "Provisioning lab environment",
  "estimatedReadyInSeconds": 80
}
```

Response when ready:

```json
{
  "success": true,
  "sessionId": "sess_12345",
  "labId": "p1",
  "status": "running",
  "message": "Lab is ready",
  "startedAt": "2026-04-25T10:00:00Z",
  "expiresAt": "2026-04-25T12:00:00Z",
  "tools": {
    "remoteDesktop": {
      "enabled": true,
      "url": "https://your-rdp-url-or-client-url",
      "token": "rdp-token"
    },
    "terminal": {
      "enabled": true,
      "url": "https://your-terminal-url",
      "token": "terminal-token"
    },
    "ide": {
      "enabled": true,
      "url": "https://your-ide-url",
      "token": "ide-token"
    }
  }
}
```

Response when failed:

```json
{
  "success": false,
  "sessionId": "sess_12345",
  "labId": "p1",
  "status": "failed",
  "message": "Lab provisioning failed"
}
```

#### Stop Lab

- `POST /lab-sessions/:sessionId/stop`

Request:

```json
{
  "sessionId": "sess_12345"
}
```

Response:

```json
{
  "success": true,
  "sessionId": "sess_12345",
  "status": "stopped",
  "message": "Lab stopped successfully"
}
```

#### Required fields for frontend

The frontend will rely on these fields:

- `success`
- `sessionId`
- `labId`
- `status`
- `message`
- `estimatedReadyInSeconds`
- `startedAt`
- `expiresAt`
- `credentials.username`
- `credentials.password`
- `credentials.accountId`
- `credentials.accessKey`
- `credentials.secretAccessKey`
- `tools.remoteDesktop.url`
- `tools.terminal.url`
- `tools.ide.url`

Allowed `status` values:

- `pending`
- `starting`
- `running`
- `failed`
- `stopped`

#### Expected frontend flow

1. User clicks `Start Lab`
2. Frontend calls `POST /lab-sessions`
3. Backend returns `sessionId`
4. Frontend polls `GET /lab-sessions/:sessionId`
5. When `status === running`, frontend:
   - shows credentials
   - enables Remote Desktop / Terminal / IDE actions
   - opens `tools.remoteDesktop.url` in a new tab when needed

Backend can return a standard client URL, a signed URL, or a Guacamole/WebRTC client URL in `tools.remoteDesktop.url`.

### Compute

- `GET /compute/instances`
- `GET /compute/catalog`
- `POST /compute/instances`
- `GET /files`
- `POST /save`
- `POST /run`
- `GET /ws/terminal` or `WS /ws/terminal`

Suggested `GET /compute/catalog` response:

```json
{
  "regions": [
    { "id": "us-east", "name": "US East (N. Virginia)", "code": "us-east-1" }
  ],
  "images": [
    { "id": "ubuntu", "name": "Ubuntu 22.04 LTS", "badge": "Linux" }
  ],
  "plans": [
    {
      "id": "p2",
      "price": "$5.00",
      "ram": "1 GB",
      "cpu": "1 vCPU",
      "ssd": "40 GB",
      "transfer": "2 TB",
      "popular": true
    }
  ]
}
```

### IDE / Code Runner Integration

The backend suggestion to use a WebSocket-based IDE flow is a good fit for the frontend.

#### Recommended approach

Use:

- React + Monaco Editor for code editing
- REST APIs for loading/saving/running code
- WebSocket for real-time terminal and run output streaming

#### Expected frontend flow

1. User opens Cloud IDE
2. Frontend loads file list using `GET /files`
3. User opens a file and frontend loads its content
4. User edits code in Monaco Editor
5. Frontend saves code using `POST /save`
6. User clicks `Run`
7. Frontend calls `POST /run`
8. Backend starts execution in container
9. Output streams live over WebSocket

#### Suggested APIs

##### List files

- `GET /files`

Response:

```json
{
  "success": true,
  "files": [
    {
      "name": "main.py",
      "path": "/workspace/main.py",
      "type": "file"
    },
    {
      "name": "src",
      "path": "/workspace/src",
      "type": "directory"
    }
  ]
}
```

##### Read file

- `GET /files/content?path=/workspace/main.py`

Response:

```json
{
  "success": true,
  "path": "/workspace/main.py",
  "content": "print('Hello World')"
}
```

##### Save file

- `POST /save`

Request:

```json
{
  "path": "/workspace/main.py",
  "content": "print('Updated code')"
}
```

Response:

```json
{
  "success": true,
  "message": "File saved successfully"
}
```

##### Run code

- `POST /run`

Request:

```json
{
  "path": "/workspace/main.py",
  "language": "python",
  "sessionId": "sess_12345"
}
```

Response:

```json
{
  "success": true,
  "runId": "run_123",
  "message": "Execution started"
}
```

##### Terminal / output streaming

- `WS /ws/terminal?sessionId=sess_12345&runId=run_123`

Suggested message shape:

```json
{
  "type": "stdout",
  "runId": "run_123",
  "data": "Program started...\n"
}
```

Other useful message types:

- `stdout`
- `stderr`
- `status`
- `exit`

Example exit event:

```json
{
  "type": "exit",
  "runId": "run_123",
  "exitCode": 0,
  "message": "Execution completed"
}
```

#### Frontend mapping

These project files will use this integration:

- `src/pages/compute/Editor.jsx` -> Monaco editor, file open/save/run
- `src/pages/compute/Terminal.jsx` -> WebSocket terminal output
- `src/pages/compute/RemoteDesktop.jsx` -> optional separate environment launcher

#### What backend should provide

To support IDE-like behavior, backend should provide:

- isolated workspace/container per session
- file listing API
- file content read API
- save API
- run API
- WebSocket stream for live logs/output
- optional container lifecycle status

#### Recommended reply to backend developer

You can tell them:

"Yes, WebSocket-based streaming is fine. Frontend will use Monaco for the editor, REST APIs for files/save/run, and WebSocket for terminal/output. Please expose `/files`, file-content read API, `/save`, `/run`, and a WebSocket endpoint for live stdout/stderr streaming from the container."

## Demo notes

- Keep `VITE_USE_MOCK_API=true` for client demo unless backend is fully ready.
- Remote desktop already opens in a separate tab.
- Remote desktop route already hides the main sidebar.
