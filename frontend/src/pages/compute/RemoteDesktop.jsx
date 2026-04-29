import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  Paper,
  Avatar,
  Divider
} from '@mui/material';
import { 
  MdClose, 
  MdMinimize, 
  MdCropSquare, 
  MdTerminal, 
  MdLanguage,
  MdSettings,
  MdFolder,
  MdPowerSettingsNew,
  MdWifi,
  MdVolumeUp,
  MdSearch
} from 'react-icons/md';
import { VscCode } from 'react-icons/vsc';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { fetchUserActiveSession, startLabSession, fetchLabSessionStatus } from '../../services/labService';
import CloudEditor from './Editor';
import Terminal from './Terminal';

const appsConfig = [
  { id: 'vscode', title: 'Visual Studio Code', icon: 'vscode', component: CloudEditor },
  { id: 'terminal', title: 'SSH Terminal', icon: 'terminal', component: Terminal },
  { id: 'browser', title: 'Ignito Browser', icon: 'browser', component: () => <Box className="p-10 text-white">Browser simulation coming soon...</Box> },
  { id: 'files', title: 'File Explorer', icon: 'files', component: () => <Box className="p-10 text-white">Files simulation coming soon...</Box> }
];

const getAppIcon = (iconId, size = 24) => {
  switch (iconId) {
    case 'vscode': return <VscCode size={size} className="text-blue-400" />;
    case 'terminal': return <MdTerminal size={size} className="text-emerald-400" />;
    case 'browser': return <MdLanguage size={size} className="text-red-400" />;
    case 'files': return <MdFolder size={size} className="text-yellow-400" />;
    default: return <MdSettings size={size} />;
  }
};

const RemoteDesktop = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [connecting, setConnecting] = useState(true);
  const [connectionLog, setConnectionLog] = useState([]);
  const [openWindows, setOpenWindows] = useState([]); 
  const [activeWindow, setActiveWindow] = useState(null);
  const [maximizedWindows, setMaximizedWindows] = useState([]);
  const [minimizedWindows, setMinimizedWindows] = useState([]);
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const hasAutoOpenedRef = useRef(false);

  const user = useAuthStore(state => state.user);
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const labId = params.get('labId');
    
    const initializeSession = async () => {
      if (!labId || !user?.email) {
        setConnecting(false);
        return;
      }

      try {
        setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Authenticating user session...`]);
        
        // 1. Check for existing session
        const activeRes = await fetchUserActiveSession(user.email);
        if (activeRes.success && activeRes.session && activeRes.session.labId === labId) {
          setSession(activeRes.session);
          setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Resuming existing session: ${activeRes.session.sessionId}`]);
        } else {
          // 2. Start new session
          setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] No active session found. Provisioning new environment for Lab: ${labId}...`]);
          const startRes = await startLabSession({ labId, userId: user.email });
          
          let currentStatus = 'starting';
          let statusRes = null;
          
          while (currentStatus === 'starting') {
            statusRes = await fetchLabSessionStatus(startRes.sessionId);
            currentStatus = statusRes.status;
            if (currentStatus === 'starting') {
              setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Infrastructure provisioning in progress...`]);
              await new Promise(r => setTimeout(r, 3000));
            }
          }
          
          if (currentStatus === 'running') {
            setSession(statusRes);
            setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Environment ready! Connecting to Remote Desktop...`]);
          } else {
            throw new Error('Failed to start lab environment');
          }
        }
        
        setTimeout(() => setConnecting(false), 1500);
      } catch (err) {
        setError(err.message || 'Failed to initialize session');
        setConnectionLog(prev => [...prev, `[ERROR] ${err.message}`]);
      }
    };

    initializeSession();
  }, [location.search, user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const toggleWindow = (appId) => {
    const app = appsConfig.find(a => a.id === appId);
    if (!app) return;

    if (openWindows.find(w => w.id === appId)) {
      if (minimizedWindows.includes(appId)) {
        setMinimizedWindows(minimizedWindows.filter(id => id !== appId));
      }
      setActiveWindow(appId);
    } else {
      setOpenWindows([...openWindows, app]);
      setActiveWindow(appId);
      if (appId === 'vscode') {
        setMaximizedWindows(prev => [...prev, appId]);
      }
    }
    setShowStartMenu(false);
  };

  const closeWindow = (id) => {
    setOpenWindows(openWindows.filter(w => w.id !== id));
    setMaximizedWindows(maximizedWindows.filter(winId => winId !== id));
    setMinimizedWindows(minimizedWindows.filter(winId => winId !== id));
    if (activeWindow === id) setActiveWindow(null);
  };

  const minimizeWindow = (id) => {
    setMinimizedWindows(prev => [...prev, id]);
    if (activeWindow === id) setActiveWindow(null);
  };

  const toggleMaximize = (id) => {
    if (maximizedWindows.includes(id)) {
      setMaximizedWindows(maximizedWindows.filter(winId => winId !== id));
    } else {
      setMaximizedWindows([...maximizedWindows, id]);
    }
  };

  useEffect(() => {
    if (connecting || hasAutoOpenedRef.current) return;
    const appToOpen = new URLSearchParams(location.search).get('app');
    if (appToOpen) {
      toggleWindow(appToOpen);
      hasAutoOpenedRef.current = true;
    }
  }, [connecting, location.search]);

  if (connecting) {
    return (
      <Box className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center font-mono p-4">
        <Box className="max-w-xl w-full">
           <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Box className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white">
                  <MdWifi size={24} className="animate-pulse" />
                </Box>
                <div>
                  <Typography className="text-white font-black text-xl">Ignito Remote Desktop</Typography>
                  <Typography className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Secure WebRTC Tunnel</Typography>
                </div>
              </div>

              <Box className="bg-black/50 border border-white/5 rounded-2xl p-6 min-h-[300px] overflow-auto">
                {connectionLog.map((log, i) => (
                  <div key={i} className="text-[11px] text-emerald-500/80 mb-1">
                    <span className="text-slate-600 mr-2">$</span> {log}
                  </div>
                ))}
              </Box>
           </div>
        </Box>
      </Box>
    );
  }

  return (
    <Box 
      className="h-screen w-screen overflow-hidden relative select-none"
      sx={{ 
        backgroundImage: 'url("https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >

      {/* Desktop Icons */}
      <Box className="p-6 flex flex-col gap-6">
        {appsConfig.map(app => (
          <div 
            key={app.id}
            onDoubleClick={() => toggleWindow(app.id)}
            className="w-20 flex flex-col items-center gap-1 cursor-pointer group"
          >
            <Box className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-all shadow-2xl">
              {getAppIcon(app.icon)}
            </Box>
            <Typography className="text-white text-[11px] font-bold text-center drop-shadow-lg">{app.title}</Typography>
          </div>
        ))}
      </Box>

      {/* Windows Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {openWindows.map((win, index) => {
          const isMaximized = maximizedWindows.includes(win.id);
          const isMinimized = minimizedWindows.includes(win.id);
          if (isMinimized) return null;

          return (
            <div
              key={win.id}
              onMouseDown={() => setActiveWindow(win.id)}
              className={`absolute bg-[#1e1e1e] shadow-2xl border border-white/10 overflow-hidden flex flex-col pointer-events-auto transition-all duration-300 ${isMaximized ? 'inset-0 bottom-14' : 'inset-10 rounded-2xl'}`}
              style={{ zIndex: activeWindow === win.id ? 100 : 10 + index }}
            >
              <Box className="h-10 bg-[#252526] flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  {getAppIcon(win.icon, 18)}
                  <Typography className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{win.title}</Typography>
                </div>
                <div className="flex items-center gap-2">
                  <IconButton onClick={() => minimizeWindow(win.id)} size="small" className="text-slate-500 hover:bg-white/10"><MdMinimize size={16} /></IconButton>
                  <IconButton onClick={() => toggleMaximize(win.id)} size="small" className="text-slate-500 hover:bg-white/10"><MdCropSquare size={16} /></IconButton>
                  <IconButton onClick={() => closeWindow(win.id)} size="small" className="text-slate-500 hover:bg-red-600 hover:text-white"><MdClose size={16} /></IconButton>
                </div>
              </Box>
              <Box className="flex-1 overflow-hidden">
                 <win.component onMenuClick={() => {}} session={session} hideHeader={true} />
              </Box>
            </div>
          );
        })}
      </div>

      {/* Taskbar */}
      <Box className="absolute bottom-0 left-0 right-0 h-14 bg-black/60 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-2 z-[600]">
        <Box className="flex items-center gap-1">
          <IconButton 
            onClick={() => setShowStartMenu(!showStartMenu)}
            className={`w-10 h-10 rounded-xl ${showStartMenu ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
             <Box className="w-5 h-5 grid grid-cols-2 gap-0.5">
                <div className="bg-red-500 rounded-sm" /><div className="bg-blue-500 rounded-sm" />
                <div className="bg-emerald-500 rounded-sm" /><div className="bg-yellow-500 rounded-sm" />
             </Box>
          </IconButton>
          
          <IconButton className="text-white hover:bg-white/10 rounded-xl w-10 h-10"><MdSearch size={22} /></IconButton>
          <Divider orientation="vertical" className="h-6 mx-2 !border-white/10" />

          {openWindows.map(win => (
            <Box 
              key={win.id}
              onClick={() => {
                if (minimizedWindows.includes(win.id)) setMinimizedWindows(minimizedWindows.filter(id => id !== win.id));
                setActiveWindow(win.id);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer relative ${activeWindow === win.id ? 'bg-white/20' : 'hover:bg-white/10'} ${minimizedWindows.includes(win.id) ? 'opacity-50' : ''}`}
            >
              {getAppIcon(win.icon, 22)}
              {activeWindow === win.id && !minimizedWindows.includes(win.id) && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-red-600 rounded-full" />}
            </Box>
          ))}
        </Box>

        <Box className="flex items-center gap-4 px-4 text-white">
           <MdWifi size={18} className="opacity-60" />
           <div className="text-right">
             <Typography className="text-[11px] font-bold">{currentTime}</Typography>
             <Typography className="text-[9px] opacity-40">25/04/2026</Typography>
           </div>
        </Box>
      </Box>

      {/* Start Menu Simulation */}
      {showStartMenu && (
        <Box className="absolute bottom-16 left-2 w-[400px] h-[500px] bg-black/80 backdrop-blur-3xl rounded-3xl border border-white/10 p-6 z-[500]">
           <Typography className="text-white/40 text-[10px] font-black uppercase mb-4">Pinned</Typography>
           <Box className="grid grid-cols-4 gap-4">
              {appsConfig.map(app => (
                <div key={app.id} onClick={() => toggleWindow(app.id)} className="flex flex-col items-center gap-2 cursor-pointer hover:bg-white/5 p-2 rounded-xl">
                  {getAppIcon(app.icon)}
                  <Typography className="text-white/80 text-[10px]">{app.title.split(' ')[0]}</Typography>
                </div>
              ))}
           </Box>
        </Box>
      )}
    </Box>
  );
};

export default RemoteDesktop;
