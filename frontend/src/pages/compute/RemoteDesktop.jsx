import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  Paper,
  Avatar,
  Divider,
  Button
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
import { fetchUserActiveSession, startLabSession, fetchLabSessionStatus, stopLabSession } from '../../services/labService';
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

  const initStartedRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const labId = params.get('labId');
    
    const initializeSession = async () => {
      if (!labId || !user?.email || initStartedRef.current) return;
      initStartedRef.current = true;

      try {
        setConnectionLog(prev => [`[${new Date().toLocaleTimeString()}] Connecting to Ignito Cloud Core...`]);
        
        // 1. Check for existing session
        const activeRes = await fetchUserActiveSession(user.email);
        let activeSession = null;

        if (activeRes.success && activeRes.session && activeRes.session.labId === labId) {
          activeSession = activeRes.session;
          setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found existing session: ${activeSession.sessionId}`]);
        } else {
          // 2. Start new session
          const startRes = await startLabSession({ labId, userId: user.email });
          activeSession = startRes;
          setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Provisioning new environment...`]);
        }

        // Wait if starting
        let currentStatus = activeSession.status || 'starting';
        let statusRes = activeSession;
        
        while (currentStatus === 'starting') {
          statusRes = await fetchLabSessionStatus(activeSession.sessionId);
          currentStatus = statusRes.status;
          if (currentStatus === 'starting') {
            setConnectionLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Provisioning environment...`]);
            await new Promise(r => setTimeout(r, 1000));
          }
        }
        
        if (currentStatus === 'running') {
          setSession(statusRes);
          setConnecting(false);
        } else {
          throw new Error(statusRes.message || 'Failed to start lab environment');
        }
        
      } catch (err) {
        setError(err.message || 'Failed to initialize session');
        setConnectionLog(prev => [...prev, `[ERROR] ${err.message}`]);
        initStartedRef.current = false; // Allow retry on error
      }
    };

    if (user?.email) {
      initializeSession();
    }
  }, [location.search, user?.email]);

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

  const handleStopLab = async () => {
    if (!window.confirm('Are you sure you want to stop this lab session? All unsaved work will be lost.')) return;
    
    try {
      if (session?.sessionId) {
        await stopLabSession(session.sessionId);
      }
      navigate('/');
    } catch (err) {
      console.error('Failed to stop lab:', err);
      navigate('/'); // Still navigate back to be safe
    }
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
    
    const params = new URLSearchParams(location.search);
    const appToOpen = params.get('app');
    const labId = params.get('labId')?.toLowerCase() || '';

    // If explicit app is requested, open it
    if (appToOpen) {
      toggleWindow(appToOpen);
      hasAutoOpenedRef.current = true;
    } 
    // If it's a Linux lab, prioritize Terminal
    else if (labId.includes('linux')) {
      toggleWindow('terminal');
      if (!maximizedWindows.includes('terminal')) {
        setMaximizedWindows(prev => [...prev, 'terminal']);
      }
      hasAutoOpenedRef.current = true;
    }
    // Default to VS Code for everything else
    else {
      toggleWindow('vscode');
      hasAutoOpenedRef.current = true;
    }
  }, [connecting, location.search]);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('Initializing connection...');

  useEffect(() => {
    if (!connecting) return;
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 95) return 95;
        // Progress slows down as it gets closer to 95
        const increment = Math.max(0.1, (95 - prev) / 20);
        return prev + increment;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [connecting]);

  useEffect(() => {
    if (!connecting) return;
    const statuses = [
      'Allocating cloud resources...',
      'Requesting Fargate task...',
      'Pulling container image...',
      'Configuring network bridge...',
      'Initializing secure tunnel...',
      'Starting container services...',
      'Optimizing display stream...',
      'Preparing your workspace...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLoadingStatus(statuses[i % statuses.length]);
      i++;
    }, 3000);
    return () => clearInterval(interval);
  }, [connecting]);

  if (connecting) {
    return (
      <Box className="h-screen w-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <Box className="max-w-md w-full relative">
          {/* Animated Background Glow */}
          <div className="absolute -inset-20 bg-red-600/10 blur-[100px] rounded-full animate-pulse" />
          
          <div className="relative flex flex-col items-center gap-8 text-center">
            {/* Logo / Icon */}
            <Box className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-2xl shadow-red-600/20 rotate-3 animate-bounce">
              <MdWifi size={40} />
            </Box>

            <div className="space-y-2">
              <Typography className="text-white font-black text-3xl tracking-tighter uppercase">Initializing Lab</Typography>
              <Typography className="text-slate-500 text-xs uppercase tracking-[0.3em] font-bold">Secure WebRTC Tunnel</Typography>
            </div>

            {/* Progress Area */}
            <Box className="w-full space-y-6">
              <Box className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <Box 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  style={{ width: `${loadingProgress}%` }}
                />
              </Box>
              
              <div className="flex justify-between items-center px-1">
                <Typography className="text-slate-400 text-[11px] font-black uppercase tracking-widest animate-pulse">
                  {loadingStatus}
                </Typography>
                <Typography className="text-red-500 font-mono text-sm font-bold">
                  {Math.round(loadingProgress)}%
                </Typography>
              </div>
            </Box>

            {/* Hint / Tip */}
            <Box className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              <Typography className="text-slate-500 text-[10px] leading-relaxed italic">
                Tip: Use the sidebar terminal for faster CLI operations while the editor is loading complex project structures.
              </Typography>
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
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
                  <IconButton onClick={() => minimizeWindow(win.id)} size="small" sx={{ color: 'white' }} className="hover:bg-white/10"><MdMinimize size={16} /></IconButton>
                  <IconButton onClick={() => toggleMaximize(win.id)} size="small" sx={{ color: 'white' }} className="hover:bg-white/10"><MdCropSquare size={16} /></IconButton>
                  <IconButton onClick={() => closeWindow(win.id)} size="small" sx={{ color: 'white' }} className="hover:bg-red-600 hover:text-white"><MdClose size={16} /></IconButton>
                </div>
              </Box>
              <Box className="flex-1 overflow-hidden">
                 <win.component 
                   onMenuClick={() => {}} 
                   session={session} 
                   hideHeader={win.id === 'terminal' ? !new URLSearchParams(location.search).get('labId')?.toLowerCase().includes('linux') : true} 
                   onOpenTerminal={() => {
                     // Minimize VS Code and Open Terminal Fullscreen
                     minimizeWindow('vscode');
                     toggleWindow('terminal');
                     if (!maximizedWindows.includes('terminal')) {
                       setMaximizedWindows(prev => [...prev, 'terminal']);
                     }
                   }}
                 />
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

        <Box className="flex items-center gap-6 px-4 text-white">
           <Button 
            onClick={handleStopLab}
            variant="contained"
            className="!bg-red-600 hover:!bg-red-700 !text-white !text-[10px] !font-black px-4 py-1.5 rounded-lg shadow-lg shadow-red-600/20 uppercase tracking-widest transition-all"
            startIcon={<MdPowerSettingsNew size={16} />}
          >
            Stop Lab
          </Button>
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
