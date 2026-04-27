import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Grid,
  Paper,
  Rating,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MdAccessTime,
  MdBarChart,
  MdChevronRight,
  MdContentCopy,
  MdFolderOpen,
  MdMonitor,
  MdOpenInNew,
  MdOutlineTerminal,
  MdStars,
} from 'react-icons/md';
import { motion } from 'motion/react';
import Header from '../components/Header';
import { fetchLabDetails, fetchLabSessionStatus, startLabSession, stopLabSession } from '../services/labService';

const ViewLab = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(1);
  const [labDetails, setLabDetails] = useState(null);
  const [session, setSession] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(120 * 60);
  const [copiedKey, setCopiedKey] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadLab = async () => {
      try {
        const response = await fetchLabDetails(id);
        if (mounted) {
          setLabDetails(response.lab);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || 'Unable to load lab details');
        }
      }
    };

    loadLab();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!session?.expiresAt || session.status !== 'running') return;

    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleStartLab = async () => {
    try {
      setIsStarting(true);
      setError('');
      const startResponse = await startLabSession({
        labId: id,
        userId: 'current-user-id', // TODO: Replace with actual auth user ID
      });

      const statusResponse = await fetchLabSessionStatus(startResponse.sessionId);
      setSession(statusResponse);
    } catch (startError) {
      setError(startError.message || 'Unable to start lab');
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndLab = async () => {
    if (!session?.sessionId) return;

    await stopLabSession(session.sessionId);
    setSession(null);
    setSecondsLeft(120 * 60);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const metricItems = useMemo(() => ([
    { icon: <MdAccessTime size={22} />, label: `${labDetails?.durationMinutes || 0} MINS`, sub: 'Duration' },
    { icon: <MdStars size={22} />, label: `${labDetails?.credits || 0} CREDITS`, sub: 'Cost' },
    { icon: <MdBarChart size={22} />, label: (labDetails?.complexity || 'Expert').toUpperCase(), sub: 'Complexity' },
    { icon: <MdFolderOpen size={22} />, label: (labDetails?.category || 'General').toUpperCase(), sub: 'Category' },
  ]), [labDetails]);

  const credentials = session?.credentials;
  const toolLinks = session?.tools;
  const isLabStarted = session?.status === 'running';
  const remoteDesktopUrl = toolLinks?.remoteDesktop?.url
    ? `${toolLinks.remoteDesktop.url}${toolLinks.remoteDesktop.url.includes('?') ? '&' : '?'}app=vscode`
    : '/admin/compute/rdp?app=vscode';

  return (
    <Box className="flex-1 flex flex-col min-h-0 bg-slate-50 app-shell">
      <Header onMenuClick={onMenuClick} title="View Lab" onBack={() => window.history.back()} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 font-sans">
        <Box className="max-w-[1700px] mx-auto">
          {error && (
            <Alert severity="warning" className="mb-6 rounded-2xl">
              {error}
            </Alert>
          )}

          <Breadcrumbs separator={<span className="text-slate-300"><MdChevronRight size={16} /></span>} className="mb-6 md:mb-8">
            <Typography className="text-xs sm:text-sm font-medium text-slate-500 cursor-pointer hover:text-red-500 transition-colors">Dashboard</Typography>
            <Typography className="text-xs sm:text-sm font-medium text-slate-500 cursor-pointer hover:text-red-500 transition-colors">{labDetails?.category || 'Lab'}</Typography>
            <Typography className="text-sm font-bold text-red-600">View lab</Typography>
          </Breadcrumbs>

          <Paper elevation={0} className="p-4 sm:p-6 md:p-10 rounded-[28px] md:rounded-[40px] border border-slate-200 mb-8 md:mb-10 bg-white shadow-2xl shadow-slate-200/60 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

            <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center" className="relative z-10">
              <Grid item xs={12} lg="auto">
                <Box className="w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 mx-auto lg:mx-0 flex items-center justify-center p-4 md:p-6 border border-slate-100 rounded-3xl bg-slate-50/50 backdrop-blur-sm shadow-inner">
                  <img src={labDetails?.logo || '/assets/logo.png'} alt="Lab Logo" className="max-w-full max-h-full object-contain filter drop-shadow-xl" />
                </Box>
              </Grid>

              <Grid item xs={12} lg>
                <div className="flex flex-col gap-1 text-center lg:text-left">
                  <Typography variant="body2" className="text-red-600 font-black text-xs tracking-[0.3em] uppercase mb-1">
                    {labDetails?.subtitle || 'Enterprise Infrastructure Hub'}
                  </Typography>
                  <Typography variant="h3" className="font-black text-slate-900 tracking-tighter text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 break-words">
                    {labDetails?.title || 'Loading lab...'}
                  </Typography>
                </div>

                <Box className="flex items-center gap-3 mb-6 md:mb-8 bg-slate-50 w-fit max-w-full mx-auto lg:mx-0 px-4 py-2 rounded-full border border-slate-100">
                  <Rating value={labDetails?.rating || 0} size="small" readOnly />
                  <Typography variant="caption" className="text-slate-400 font-black tracking-widest">
                    ({(labDetails?.rating || 0).toFixed(1)}) {labDetails?.reviewCount ? `${labDetails.reviewCount} REVIEWS` : 'NO REVIEWS YET'}
                  </Typography>
                </Box>

                <div className="flex flex-wrap gap-6 md:gap-10">
                  {metricItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="p-2.5 bg-red-50 rounded-xl text-red-600">
                        {item.icon}
                      </div>
                      <div>
                        <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.sub}</Typography>
                        <Typography className="font-bold text-slate-700 text-sm">{item.label}</Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </Grid>

              <Grid item xs={12} lg="auto" sx={{ ml: { lg: 'auto' } }}>
                <div className="flex flex-col items-center lg:items-end gap-4 md:gap-6 bg-slate-50/50 p-5 sm:p-6 md:p-8 rounded-[28px] md:rounded-[32px] border border-slate-100 backdrop-blur-sm w-full">
                  {isLabStarted ? (
                    <div className="text-center lg:text-right">
                      <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Session Remaining</Typography>
                      <Typography className="font-mono font-black text-red-600 text-3xl sm:text-4xl md:text-5xl tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        {formatTime(secondsLeft)}
                      </Typography>
                    </div>
                  ) : (
                    <Typography className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {(labDetails?.status || 'ready').toUpperCase()}
                    </Typography>
                  )}

                  <Button
                    variant="contained"
                    onClick={isLabStarted ? handleEndLab : handleStartLab}
                    disabled={isStarting}
                    className={`text-white rounded-2xl px-6 sm:px-10 md:px-12 py-4 md:py-5 font-black text-xs sm:text-sm uppercase tracking-widest transition-all duration-500 shadow-2xl active:scale-95 w-full lg:w-auto ${isLabStarted
                      ? '!bg-slate-900 hover:!bg-black border border-white/10'
                      : '!bg-red-600 hover:!bg-red-700 border border-red-500/20 shadow-red-500/30'
                      }`}
                  >
                    {isStarting ? 'STARTING LAB...' : isLabStarted ? 'TERMINATE SESSION' : 'INITIALIZE HUB'}
                  </Button>
                </div>
              </Grid>
            </Grid>

            {isLabStarted && credentials && (
              <Box className="mt-8 md:mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50 relative">
                <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]" />
                    <Typography className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Access Credentials Dashboard</Typography>
                  </div>
                </div>

                <div className="p-4 sm:p-6 md:p-8 bg-slate-50/50">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-4">
                      {[
                        { label: 'IAM USERNAME', value: credentials.username, key: 'username' },
                        { label: 'ACCESS PASSWORD', value: credentials.password, key: 'password' },
                        { label: 'ACCOUNT ID', value: credentials.accountId, key: 'accountId' },
                        { label: 'ACCESS KEY ID', value: credentials.accessKey, key: 'accessKey' },
                        { label: 'SECRET ACCESS KEY', value: credentials.secretAccessKey, key: 'secretKey' },
                      ].map((cred, i) => (
                        <motion.div
                          key={cred.key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-500/30 hover:shadow-md transition-all group relative overflow-hidden"
                        >
                          <div className="w-full md:w-40">
                            <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cred.label}</Typography>
                          </div>
                          <div className="flex-1 flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3 sm:px-4 py-2.5 border border-slate-100 min-w-0">
                            <Typography className="text-xs font-mono font-bold text-slate-700 break-all">{cred.value}</Typography>
                            <Tooltip title={copiedKey === cred.key ? 'Identity Copied' : 'Copy Sequence'}>
                              <button
                                onClick={() => handleCopy(cred.value, cred.key)}
                                className={`p-1.5 rounded-lg transition-all ${copiedKey === cred.key ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                              >
                                <MdContentCopy size={16} />
                              </button>
                            </Tooltip>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="lg:col-span-4 flex flex-col justify-between">
                      <div className="bg-red-600 rounded-[28px] p-5 sm:p-6 md:p-8 text-white relative overflow-hidden h-full flex flex-col justify-center shadow-[0_20px_50px_rgba(220,38,38,0.3)]">
                        <div className="relative z-10">
                          <Typography className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-4">Direct Cloud Portal</Typography>
                          <Typography variant="h4" className="font-black tracking-tight mb-6 md:mb-8 leading-tight text-2xl md:text-4xl">
                            Execute Virtual <span className="text-red-100/60">Instance Console</span>
                          </Typography>
                          <Box className="space-y-3">
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => window.open(remoteDesktopUrl, '_blank', 'noopener,noreferrer')}
                              endIcon={<MdMonitor size={22} />}
                              className="!bg-slate-900 !text-white hover:!bg-black font-black rounded-2xl py-5 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 text-sm tracking-widest uppercase"
                            >
                              OPEN REMOTE DESKTOP
                            </Button>
                            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <Button
                                variant="contained"
                                onClick={() => navigate(toolLinks?.ide?.url || '/admin/compute/ide')}
                                endIcon={<MdOpenInNew size={18} />}
                                className="!bg-white !text-red-600 hover:!bg-red-50 font-black rounded-2xl py-4 shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-[10px] tracking-widest uppercase"
                              >
                                IDE
                              </Button>
                              <Button
                                variant="contained"
                                onClick={() => navigate(toolLinks?.terminal?.url || '/admin/compute/terminals')}
                                endIcon={<MdOutlineTerminal size={18} />}
                                className="!bg-white !text-slate-600 hover:!bg-slate-50 font-black rounded-2xl py-4 shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-[10px] tracking-widest uppercase"
                              >
                                CONSOLE
                              </Button>
                            </Box>
                          </Box>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Box>
            )}
          </Paper>
        </Box>
      </main>
    </Box>
  );
};

export default ViewLab;
