import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MdFitScreen,
  MdKeyboard,
  MdOutlinePowerSettingsNew,
  MdRefresh,
  MdTerminal,
} from 'react-icons/md';
import Header from '../../components/Header';
import { connectTerminalStream } from '../../services/ideService';

const Terminal = ({ onMenuClick }) => {
  const [history, setHistory] = useState([
    'Welcome to Ignito Compute Terminal',
    'Connecting to live output stream...',
    '',
  ]);
  const [error, setError] = useState('');
  const terminalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const connection = connectTerminalStream({
      sessionId: 'sess_12345',
      runId: 'run_123',
      onMessage: (message) => {
        if (message.type === 'stdout' || message.type === 'stderr') {
          setHistory((prev) => [...prev, message.data.trimEnd()]);
        }

        if (message.type === 'exit') {
          setHistory((prev) => [...prev, `${message.message} (exit code ${message.exitCode})`]);
        }
      },
    });

    return () => {
      connection?.close?.();
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const handleReset = () => {
    setHistory([
      'Terminal session reset.',
      'Waiting for next run output...',
      '',
    ]);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <Box className="flex-1 flex flex-col min-h-0 bg-slate-900 app-shell">
      <Header onMenuClick={onMenuClick} title="SSH Console" />

      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-10">
        <Box className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col">
          {error && (
            <Alert severity="warning" className="mb-4 rounded-xl">
              {error}
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Box className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                <MdTerminal size={22} />
              </Box>
              <div>
                <Typography className="text-white font-black tracking-tight leading-none mb-1">Live Container Terminal</Typography>
                <Typography className="text-slate-500 text-[10px] font-black uppercase tracking-widest">WebSocket Stream | session sess_12345</Typography>
              </div>
            </div>

            <div className="flex gap-2">
              <Tooltip title="Reset Session">
                <IconButton onClick={handleReset} className="bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-xl p-2.5">
                  <MdRefresh size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Back to Instances">
                <IconButton onClick={() => navigate('/admin/compute/instances')} className="bg-slate-800 text-red-500 hover:bg-red-500/10 rounded-xl p-2.5">
                  <MdOutlinePowerSettingsNew size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Fullscreen">
                <IconButton onClick={toggleFullscreen} className="bg-red-600 text-white hover:bg-red-700 rounded-xl p-2.5 shadow-lg shadow-red-500/20">
                  <MdFitScreen size={18} />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          <Paper
            elevation={0}
            className="flex-1 bg-[#2e3440] rounded-[32px] border border-slate-800 p-6 md:p-8 shadow-2xl flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-800/50 backdrop-blur-md flex items-center px-6 gap-2 border-b border-slate-700/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
              <Typography className="text-[10px] font-mono text-slate-500 ml-4">ws://terminal-stream | 80x24</Typography>
            </div>

            <Box
              ref={terminalRef}
              className="flex-1 mt-6 overflow-y-auto font-mono text-[13px] leading-relaxed custom-scrollbar-dark"
            >
              {history.map((line, index) => (
                <div key={`${line}-${index}`} className="whitespace-pre-wrap text-[#d8dee9]">
                  {line}
                </div>
              ))}
            </Box>

            <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><MdKeyboard size={12} /> UTF-8</span>
                <span className="flex items-center gap-1"><MdTerminal size={12} /> websocket</span>
              </div>
              <div>STREAM: ACTIVE</div>
            </div>
          </Paper>
        </Box>
      </main>
    </Box>
  );
};

export default Terminal;
