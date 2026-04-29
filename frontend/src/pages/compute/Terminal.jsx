import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { MdTerminal, MdClose, MdAdd } from 'react-icons/md';

const Terminal = ({ session, hideHeader }) => {
  const initialHistory = [
    'Ignito Cloud Shell v1.0.0',
    'Copyright (c) 2026 Ignito Labs. All rights reserved.',
    '',
    'Connecting to container runtime...',
    'Environment: Ubuntu 22.04.3 LTS (GNU/Linux 6.2.0-1017-aws x86_64)',
    'Welcome, ignito-user!',
    '',
  ];

  const [tabs, setTabs] = useState([
    { id: Date.now(), name: 'bash', history: [...initialHistory], input: '' }
  ]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    inputRef.current?.focus();
  }, [activeTab.history, activeTabId]);

  const updateActiveTab = (updates) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updates } : t));
  };

  const addNewTab = () => {
    const newId = Date.now();
    setTabs(prev => [...prev, { 
      id: newId, 
      name: `bash (${prev.length + 1})`, 
      history: [...initialHistory], 
      input: '' 
    }]);
    setActiveTabId(newId);
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    if (tabs.length === 1) return; // Don't close the last tab
    
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const cmd = activeTab.input.trim();
      let newHistory = [...activeTab.history];
      
      if (cmd) {
        newHistory.push(`ignito@container:~$ ${cmd}`);
        
        // Mock responses
        const addResponse = (msg) => {
          newHistory.push(msg);
          newHistory.push('');
          updateActiveTab({ history: newHistory, input: '' });
        };

        if (cmd === 'ls') addResponse('src  public  package.json  node_modules  README.md');
        else if (cmd === 'whoami') addResponse('ignito-user');
        else if (cmd === 'clear') updateActiveTab({ history: [`ignito@container:~$ `], input: '' });
        else if (cmd === 'help') addResponse('Available commands: ls, whoami, clear, help, date, echo');
        else if (cmd === 'date') addResponse(new Date().toString());
        else if (cmd.startsWith('echo ')) addResponse(cmd.substring(5));
        else addResponse(`bash: ${cmd}: command not found`);
      } else {
        newHistory.push('ignito@container:~$ ');
        updateActiveTab({ history: newHistory, input: '' });
      }
    }
  };

  return (
    <Box className="h-full w-full bg-[#0c0c0c] flex flex-col font-mono text-[13px]">
      {/* Terminal Header/Tab area */}
      {!hideHeader && (
        <Box className="h-9 bg-[#1e1e1e] flex items-center px-2 border-b border-black/40 shrink-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <Box 
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-3 h-full cursor-pointer transition-all border-r border-black/20 min-w-[120px] max-w-[200px] ${
                activeTabId === tab.id 
                ? 'bg-[#0c0c0c] border-t-2 border-t-red-500 text-slate-200' 
                : 'hover:bg-[#2a2d2e] text-slate-500'
              }`}
            >
              <MdTerminal size={14} className={activeTabId === tab.id ? 'text-emerald-500' : 'text-slate-600'} />
              <Typography className="text-[11px] font-bold truncate flex-1">{tab.name}</Typography>
              {tabs.length > 1 && (
                <MdClose 
                  size={14} 
                  className="hover:bg-white/10 rounded p-0.5 text-slate-500 hover:text-white"
                  onClick={(e) => closeTab(e, tab.id)}
                />
              )}
            </Box>
          ))}
          
          <Box 
            onClick={addNewTab}
            className="flex items-center gap-1 px-3 h-full cursor-pointer text-slate-500 hover:text-slate-300 hover:bg-[#2a2d2e] transition-all"
          >
            <MdAdd size={16} />
            <Typography className="text-[10px] font-bold whitespace-nowrap">New Terminal</Typography>
          </Box>
        </Box>
      )}

      {/* Terminal Content */}
      <Box 
        ref={terminalRef}
        onClick={() => inputRef.current?.focus()}
        className="flex-1 overflow-y-auto p-4 custom-scrollbar-dark selection:bg-red-500/30"
      >
        {activeTab.history.map((line, i) => (
          <div key={i} className="text-[#cccccc] mb-0.5 whitespace-pre-wrap break-all leading-relaxed">
            {line.startsWith('ignito@container:~$') ? (
              <>
                <span className="text-emerald-500 font-bold">ignito@container</span>
                <span className="text-slate-400">:</span>
                <span className="text-blue-400 font-bold">~</span>
                <span className="text-slate-400">$</span>
                <span className="ml-2">{line.replace('ignito@container:~$ ', '')}</span>
              </>
            ) : line}
          </div>
        ))}
        
        <Box className="flex items-center gap-2">
          <span className="text-emerald-500 font-bold">ignito@container</span>
          <span className="text-slate-400">:</span>
          <span className="text-blue-400 font-bold">~</span>
          <span className="text-slate-400">$</span>
          <input
            ref={inputRef}
            type="text"
            value={activeTab.input}
            onChange={(e) => updateActiveTab({ input: e.target.value })}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-[#cccccc] font-mono text-[13px] p-0 m-0"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Terminal;
