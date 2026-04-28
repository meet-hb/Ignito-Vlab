# Ignito-Vlab: Cloud Infrastructure & IDE Platform

Ignito-Vlab is a professional, high-performance Cloud Infrastructure Dashboard and Integrated Development Environment (IDE) built for enterprise-grade lab management and code execution.

## 🚀 Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS (for layout & utilities) & Vanilla CSS
- **UI Components**: Material UI (MUI) for professional enterprise components
- **Animations**: Framer Motion (motion/react) for smooth, high-end transitions
- **State Management**: Zustand (for lightweight and fast global state)
- **Icons**: React Icons (Material Design icons)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Execution Engine**: `child_process` with multi-command fallback (Python/Py/Python3)
- **Communication**: REST API (Axios) & Dynamic Host Detection for multi-device access

---

## 📂 Project Structure

```text
Ignito-Vlab/
├── frontend/                # React Vite Application
│   ├── src/
│   │   ├── components/      # Reusable UI components (Header, Sidebar, LabGrid)
│   │   ├── pages/           # Page views (Dashboard, Editor, AllUsers)
│   │   ├── store/           # Zustand state (labStore, authStore)
│   │   ├── services/        # API communication services (ideService, labService)
│   │   ├── constants/       # Sidebar items and fixed configurations
│   │   └── App.jsx          # Main routing logic
├── backend/                 # Node.js Express Server
│   ├── routes/
│   │   ├── ide.js           # Core IDE logic (File Save, Run, Command Execution)
│   │   ├── labs.js          # Lab management and mock data
│   │   └── users.js         # User management logic
│   └── server.js            # Main entry point for the backend
└── README.md                # Project documentation
```

---

## ✨ Key Features

### 1. Infrastructure Dashboard
- **Dynamic Stats**: Real-time count of available labs and system status.
- **Lab Grid**: Visual representation of available infrastructure categories.
- **Glassmorphism UI**: High-end aesthetic with backdrop blurs and subtle shadows.

### 2. Cloud IDE (Compute Section)
- **File Management**: Create, Save, and Delete files within the IDE.
- **Code Execution**: Run Python scripts directly on the server with real-time terminal output.
- **Resilient Engine**: Backend handles Windows/Linux path differences and command fallbacks automatically.
- **Auto-Save**: Integrated file saving mechanism before execution.

### 3. User Management
- **User Directory**: View and manage all registered users.
- **Role-Based Branding**: Specialized "Administrator" and "Super Admin" badges.

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (added to System PATH for the IDE to work)
- NPM or Yarn

### Step 1: Backend Setup
```bash
cd backend
npm install
npm run dev
```
*Note: Backend runs on port 8080 by default.*

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Note: Frontend will automatically connect to the backend IP detected on your network.*

---

## ⚙️ How Execution Works (For Developers)

The code execution pipeline in `backend/routes/ide.js` follows these steps:
1. **Request**: Frontend sends file path and content to `/api/run`.
2. **Temporary Storage**: The backend saves the content into a temporary `.py` file in the OS `tmp` directory.
3. **Detection**: The system automatically detects whether to use `python`, `py`, or `python3` based on the host environment.
4. **Execution**: Uses `child_process.exec` with a **10-second timeout** safety mechanism.
5. **Cleanup**: Standard output (STDOUT) and errors (STDERR) are captured and sent back to the frontend terminal.

---

## 🛡️ Best Practices & Handover Notes
- **Dynamic IPs**: The frontend detects the current host IP dynamically (`window.location.hostname`) to allow access from other devices on the same network.
- **UI Consistency**: Always use the defined Tailwind classes and MUI themes to maintain the "Premium" look.
- **Security**: The current execution model is for local/private labs. For production, consider using a Docker-based sandbox for code execution.

---
**Developed by:** Hackberry Softech
**Project Version:** 1.0.0
**Branch:** Production/Main
