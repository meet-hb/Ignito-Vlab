import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MdAdd,
  MdChevronRight,
  MdClose,
  MdDelete,
  MdFormatAlignLeft,
  MdInsertDriveFile,
  MdOutlineTerminal,
  MdSave,
  MdSettings,
  MdFolder,
  MdPlayArrow,
  MdCreateNewFolder,
  MdFileUpload,
  MdCode,
  MdJavascript,
  MdHtml,
  MdCss,
  MdLanguage
} from 'react-icons/md';
import Editor from '@monaco-editor/react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import { fetchFileContent, fetchFiles, runFile, saveFile } from '../../services/ideService';

const getFileIcon = (fileName, type) => {
  if (type === 'folder') return <MdFolder className="text-blue-400 shrink-0" />;
  
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'py': return <MdCode className="text-blue-400 shrink-0" />;
    case 'js': 
    case 'jsx': return <MdCode className="text-yellow-400 shrink-0" />;
    case 'html': return <MdHtml className="text-orange-500 shrink-0" />;
    case 'css': return <MdCss className="text-blue-300 shrink-0" />;
    case 'php': return <MdCode className="text-indigo-400 shrink-0" />;
    case 'java': return <MdCode className="text-red-500 shrink-0" />;
    default: return <MdInsertDriveFile className="text-slate-400 shrink-0" />;
  }
};

const detectLanguage = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'py') return 'python';
  if (ext === 'java') return 'java';
  if (ext === 'sql') return 'sql';
  if (ext === 'css') return 'css';
  if (ext === 'html') return 'html';
  if (ext === 'php') return 'php';
  if (ext === 'js' || ext === 'jsx') return 'javascript';
  if (ext === 'ts' || ext === 'tsx') return 'typescript';
  if (ext === 'json') return 'json';
  return 'text';
};

const CloudEditor = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [activeFileIndex, setActiveFileIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [terminalHistory, setTerminalHistory] = useState(['Welcome to Ignito Cloud IDE Terminal', 'Type code and press Run to see output...', '']);
  const [webPreviewCode, setWebPreviewCode] = useState('');
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' or 'preview'
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    const loadFiles = async () => {
      try {
        const response = await fetchFiles();
        if (isMounted && response.success) {
          setFiles(response.files);
        }
      } catch (err) {
        if (isMounted) setError('Failed to load workspace files');
      }
    };
    loadFiles();
    return () => { isMounted = false; };
  }, []);

  const activeFile = files[activeFileIndex];

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.setTheme('vs-dark');
  };

  const handleFormat = () => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  };

  const handleSave = async () => {
    if (!activeFile) return;
    setIsSaving(true);
    setError('');
    try {
      await saveFile({
        path: activeFile.path,
        content: activeFile.content,
        name: activeFile.name,
        language: activeFile.language,
      });
    } catch (saveError) {
      setError(saveError.message || 'Unable to save file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setError('');
    
    // Generate Web Preview
    let codeToRender = '';
    const content = activeFile.content;
    const ext = activeFile.name.split('.').pop().toLowerCase();

    if (ext === 'html') {
      codeToRender = content;
    } else if (ext === 'css') {
      codeToRender = `<html><head><style>${content}</style></head><body><h1>CSS Preview</h1><p>This is how your CSS looks.</p></body></html>`;
    } else if (ext === 'js' || ext === 'jsx') {
      codeToRender = `<html><body><div id="root"></div><script>${content}<\/script></body></html>`;
    } else {
      codeToRender = `<html><body style="font-family: sans-serif; color: #333;"><h1>Output:</h1><pre>${content}</pre></body></html>`;
    }
    
    setWebPreviewCode(codeToRender);

    // Switch to preview tab on mobile
    if (window.innerWidth < 1280) {
      setActiveTab('preview');
    }

    try {
      await runFile({
        path: activeFile.path,
        language: activeFile.language,
        sessionId: sessionId,
      });
    } catch (runError) {
      setError(runError.message || 'Unable to run file');
      setTerminalHistory(prev => [...prev, `Error: ${runError.message}`, '']);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAddFile = () => {
    const fileName = window.prompt('Enter file name (e.g. index.html, script.py, style.css):', 'untitled.txt');
    if (!fileName) return;

    const newFile = {
      name: fileName,
      path: `/workspace/${fileName}`,
      type: 'file',
      language: detectLanguage(fileName),
      content: '',
    };
    setFiles((prev) => {
      const nextFiles = [...prev, newFile];
      setActiveFileIndex(nextFiles.length - 1);
      return nextFiles;
    });
  };

  const handleAddFolder = () => {
    const folderName = window.prompt('Enter folder name:', 'new-folder');
    if (!folderName) return;

    const newFolder = {
      name: folderName,
      path: `/workspace/${folderName}`,
      type: 'folder',
      content: '',
    };
    setFiles((prev) => [...prev, newFolder]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const newFile = {
        name: file.name,
        path: `/workspace/${file.name}`,
        type: 'file',
        language: detectLanguage(file.name),
        content: content,
      };
      setFiles((prev) => {
        const nextFiles = [...prev, newFile];
        setActiveFileIndex(nextFiles.length - 1);
        return nextFiles;
      });
    };
    reader.readAsText(file);
  };

  const handleDeleteFile = (index) => {
    const updatedFiles = files.filter((_, fileIndex) => fileIndex !== index);
    setFiles(updatedFiles);
    if (activeFileIndex === index) {
      setActiveFileIndex(updatedFiles.length > 0 ? 0 : -1);
    } else if (activeFileIndex > index) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };

  return (
    <Box className="flex-1 flex flex-col min-h-0 bg-[#181818] h-full overflow-hidden">
      <Header onMenuClick={onMenuClick} title="Cloud IDE" />

      <Box className="flex-1 flex min-h-0">
        <Box className="hidden xl:flex w-[260px] bg-[#252526] border-r border-[#333] flex-col shrink-0">
          <Box className="p-4 flex items-center justify-between">
            <Typography className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
              <MdChevronRight size={16} style={{ color: 'white' }} /> Explorer
            </Typography>
            <div className="flex items-center gap-1">
              <Tooltip title="New File">
                <IconButton onClick={handleAddFile} className="hover:text-red-500 p-1">
                  <MdAdd size={18} style={{ color: 'white' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="New Folder">
                <IconButton onClick={handleAddFolder} className="hover:text-red-500 p-1">
                  <MdCreateNewFolder size={18} style={{ color: 'white' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Upload File">
                <IconButton onClick={() => fileInputRef.current?.click()} className="hover:text-red-500 p-1">
                  <MdFileUpload size={18} style={{ color: 'white' }} />
                </IconButton>
              </Tooltip>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
            </div>
          </Box>

          <Box className="flex-1 overflow-y-auto">
            {files.map((file, i) => (
              <Box
                key={file.path}
                onClick={() => setActiveFileIndex(i)}
                className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-all ${activeFileIndex === i ? 'bg-[#37373d] text-white' : 'text-slate-400 hover:bg-[#2a2d2e] hover:text-slate-200'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(file.name, file.type)}
                  <Typography className="text-[13px] font-medium truncate">{file.name}</Typography>
                </div>
                {activeFileIndex === i && (
                  <IconButton onClick={(event) => { event.stopPropagation(); handleDeleteFile(i); }} size="small" className="text-slate-500 hover:text-red-500">
                    <MdDelete size={14} />
                  </IconButton>
                )}
              </Box>
            ))}
          </Box>

          <Box className="p-4 bg-[#333]/30 border-t border-[#333]">
            <Button
              onClick={() => navigate('/admin/compute/terminals')}
              startIcon={<MdOutlineTerminal />}
              fullWidth
              className="!text-[10px] !font-black !text-slate-400 !bg-transparent hover:!text-white uppercase tracking-widest"
            >
              Open Terminal
            </Button>
          </Box>
        </Box>

        <Box className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0 overflow-hidden h-full">
          {error && <Alert severity="warning" className="m-3 rounded-xl shrink-0">{error}</Alert>}

          <Box className="sticky top-0 xl:relative z-20 min-h-10 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-[#181818] gap-3 shrink-0">
            <Box className="flex h-full min-w-0 overflow-x-auto">
              {files.map((file, i) => (
                <Box
                  key={file.path}
                  onClick={() => setActiveFileIndex(i)}
                  className={`h-full flex items-center gap-2 px-6 cursor-pointer border-r border-[#181818] transition-all whitespace-nowrap ${activeFileIndex === i ? 'bg-[#1e1e1e] text-white' : 'bg-[#2d2d2d] text-slate-500 hover:bg-[#1e1e1e]'}`}
                >
                  <Typography className="text-[12px] font-medium">{file.name}</Typography>
                  <MdClose size={12} className="opacity-60" />
                </Box>
              ))}
            </Box>

            <Box className="flex items-center gap-4 shrink-0">
              <IconButton onClick={handleFormat} className="hover:!text-red-500 p-1.5"><MdFormatAlignLeft size={18} style={{ color: 'white' }} /></IconButton>
              <IconButton 
                onClick={() => {
                  handleSave();
                  // Local download logic
                  if (activeFile) {
                    const blob = new Blob([activeFile.content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = activeFile.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  }
                }} 
                className="hover:!text-emerald-500 p-1.5"
              >
                <MdSave size={18} style={{ color: 'white' }} />
              </IconButton>
              <Button
                onClick={handleRun}
                variant="contained"
                size="small"
                disabled={isRunning}
                startIcon={<MdPlayArrow size={16} />}
                className="!text-[10px] !font-black px-4 rounded-lg !bg-red-600 shadow-lg shadow-red-500/20"
              >
                {isRunning ? 'Running...' : 'Run'}
              </Button>
            </Box>
          </Box>

          {/* Mobile Tab Switcher */}
          <Box className="xl:hidden flex bg-[#252526] border-b border-[#181818] shrink-0">
            <Button 
              onClick={() => setActiveTab('editor')}
              className={`flex-1 !rounded-none !py-3 !font-black !text-[11px] !tracking-widest uppercase transition-all ${activeTab === 'editor' ? '!bg-[#1e1e1e] !text-red-500 !border-b-2 !border-red-500' : '!text-slate-500'}`}
            >
              Code Editor
            </Button>
            <Button 
              onClick={() => setActiveTab('preview')}
              className={`flex-1 !rounded-none !py-3 !font-black !text-[11px] !tracking-widest uppercase transition-all ${activeTab === 'preview' ? '!bg-[#1e1e1e] !text-red-500 !border-b-2 !border-red-500' : '!text-slate-500'}`}
            >
              Live Preview {webPreviewCode && <div className="ml-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </Button>
          </Box>

          <Box className="flex-1 flex flex-col xl:flex-row min-h-0 relative overflow-hidden">
            {/* Editor Side */}
            <Box 
              id="editor-area" 
              className={`flex-1 flex flex-col border-b xl:border-b-0 xl:border-r border-[#333] ${activeTab === 'editor' ? 'flex' : 'hidden xl:flex'}`}
            >
              {activeFile ? (
                <Editor
                  height="100%"
                  language={activeFile?.language || 'python'}
                  value={activeFile?.content || ''}
                  onChange={(value) => {
                    setFiles((prev) => prev.map((file, index) => (
                      index === activeFileIndex ? { ...file, content: value || '' } : file
                    )));
                  }}
                  onMount={handleEditorDidMount}
                  options={{ fontSize: 14, minimap: { enabled: true }, automaticLayout: true, scrollBeyondLastLine: false }}
                />
              ) : (
                <Box className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 p-4 sm:p-8 text-center">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-white/5 flex items-center justify-center mb-2 border border-white/10 shadow-2xl">
                    <MdInsertDriveFile size={32} className="text-red-500/50 sm:text-[48px]" style={{ color: '#ef4444' }} />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Typography className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter">Start Coding</Typography>
                    <Typography className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">Create a new file to start building your project in the Ignito Cloud IDE.</Typography>
                  </div>
                  <Button 
                    onClick={handleAddFile} 
                    variant="contained" 
                    size="large"
                    className="!bg-red-600 !text-white !font-black !px-6 sm:!px-8 !py-2 sm:!py-3 !rounded-lg sm:!rounded-xl !shadow-xl !shadow-red-600/20 hover:!bg-red-700 transition-all hover:scale-105 active:scale-95"
                    startIcon={<MdAdd size={20} />}
                  >
                    Create New File
                  </Button>
                  <div className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-8 opacity-20">
                    <MdJavascript size={20} className="sm:text-[24px]" />
                    <MdCode size={20} className="sm:text-[24px]" />
                    <MdHtml size={20} className="sm:text-[24px]" />
                    <MdCss size={20} className="sm:text-[24px]" />
                  </div>
                </Box>
              )}
            </Box>

            {/* W3Schools style Web Output Side */}
            <Box 
              id="web-preview-area" 
              className={`w-full xl:w-[450px] 2xl:w-[550px] bg-white flex flex-col shrink-0 ${activeTab === 'preview' ? 'flex' : 'hidden xl:flex'}`}
            >
              <Box className="px-4 h-10 bg-[#f1f1f1] flex items-center justify-between border-b border-[#ddd] shrink-0">
                <Typography className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <MdPlayArrow size={14} className="text-emerald-600" /> Web View Result
                </Typography>
                <Box className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setWebPreviewCode('');
                      if (window.innerWidth < 1280) setActiveTab('editor');
                    }} 
                    className="ml-2 hover:text-red-600"
                  >
                    <MdClose size={16} />
                  </IconButton>
                </Box>
              </Box>
              <Box className="flex-1 bg-white relative">
                {webPreviewCode ? (
                  <iframe
                    title="Web Preview"
                    srcDoc={webPreviewCode}
                    className="w-full h-full border-none bg-white"
                    sandbox="allow-scripts"
                  />
                ) : (
                  <Box className="h-full flex flex-col items-center justify-center text-slate-300">
                    <MdLanguage size={80} className="opacity-20 mb-4" />
                    <Typography className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Preview Area</Typography>
                    <Typography className="text-[10px] text-slate-400 mt-2">Write HTML and click Run</Typography>
                  </Box>
                )}
                {isRunning && (
                  <Box className="absolute inset-0 bg-white/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </Box>
                )}
              </Box>
            </Box>
          </Box>


        </Box>
      </Box>
    </Box>
  );
};

export default CloudEditor;
