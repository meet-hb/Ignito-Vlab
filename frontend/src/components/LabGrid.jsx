import React from 'react';
import { 
  Box, 
  Card, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { motion } from 'motion/react';
import { 
  MdChevronRight, 
  MdTerminal, 
  MdAccessTime, 
  MdStars, 
  MdWarning 
} from 'react-icons/md';
import { useLabStore } from '../store/labStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { fetchUserActiveSession, stopLabSession } from '../services/labService';

const LabGrid = ({ onLabClick, labs: labsProp }) => {
  const navigate = useNavigate();
  const { labs: storeLabs } = useLabStore();
  const { user } = useAuthStore();
  const labs = labsProp || storeLabs;
  const [activeSessions, setActiveSessions] = React.useState({});
  const [isStopping, setIsStopping] = React.useState(null);
  const [showStopModal, setShowStopModal] = React.useState(false);
  const [pendingStop, setPendingStop] = React.useState(null); // { sessionId, labId }

  const checkSessions = async () => {
    if (!user) return;
    try {
      const response = await fetchUserActiveSession(user.email);
      if (response.success && response.session) {
        setActiveSessions({ [response.session.labId]: response.session });
      } else {
        setActiveSessions({});
      }
    } catch (err) {
      console.error('Session sync error:', err);
    }
  };

  React.useEffect(() => {
    checkSessions();
    const interval = setInterval(checkSessions, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const handleStopLab = async () => {
    if (!pendingStop) return;
    const { sessionId, labId } = pendingStop;
    
    setIsStopping(labId);
    setShowStopModal(false);
    try {
      await stopLabSession(sessionId);
    } catch (err) {
      console.error('Failed to stop lab:', err);
    } finally {
      setActiveSessions({});
      setIsStopping(null);
      setPendingStop(null);
      await checkSessions();
    }
  };

  const isLabActive = (labId) => !!activeSessions[labId];

  return (
    <>
      <Box className="flex flex-col gap-4 font-sans">
      {labs.map((lab, idx) => (
        <motion.div
          key={lab.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          whileHover={{ x: 8 }}
          onClick={() => onLabClick(lab)}
          className="cursor-pointer group"
        >
          <Card 
            elevation={0} 
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-red-500/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all p-4 md:p-6"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Logo Section */}
              <div className="w-full md:w-40 h-24 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-200 relative overflow-hidden shrink-0 group-hover:bg-white transition-colors">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.05)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
                 <img 
                   src={lab.logo} 
                   alt={lab.title} 
                   className="max-h-[70%] max-w-[70%] object-contain transition-transform duration-[1200ms] cubic-bezier(0.4, 0, 0.2, 1) group-hover:scale-105 relative z-10"
                   referrerPolicy="no-referrer"
                 />
              </div>

              {/* Content Section */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <div className="p-1.5 bg-red-50 rounded-lg text-red-600">
                    <MdTerminal size={18} />
                  </div>
                  <Typography className="text-xs font-black text-red-600 uppercase tracking-widest">Environment Instance</Typography>
                </div>
                <Typography variant="h5" className="text-slate-900 font-black tracking-tight text-xl md:text-2xl group-hover:text-red-600 transition-colors uppercase">
                  {lab.title}
                </Typography>
                <Typography className="text-slate-400 text-sm mt-1 font-medium">Standard Cloud Laboratory Infrastructure</Typography>
                
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                      <MdAccessTime size={16} />
                    </div>
                    <div>
                      <Typography className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Duration</Typography>
                      <Typography className="text-xs font-bold text-slate-700 mt-0.5">{lab.durationMinutes} Mins</Typography>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-100 rounded-lg text-slate-500">
                      <MdStars size={16} />
                    </div>
                    <div>
                      <Typography className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Credits</Typography>
                      <Typography className="text-xs font-bold text-slate-700 mt-0.5">{lab.credits} Credits</Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                {isLabActive(lab.id) ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link 
                      to={`/admin/compute/rdp?labId=${lab.id}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ textDecoration: 'none' }}
                    >
                      <Button 
                        variant="contained" 
                        className="!bg-emerald-600 hover:!bg-emerald-700 text-white rounded-xl px-6 py-3 font-black text-xs tracking-widest transition-all shadow-lg shadow-emerald-500/20 uppercase"
                      >
                        Go to Lab
                      </Button>
                    </Link>
                    <Button 
                      variant="contained" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setPendingStop({ sessionId: activeSessions[lab.id].sessionId, labId: lab.id });
                        setShowStopModal(true);
                      }}
                      disabled={isStopping === lab.id}
                      className="!bg-red-600 hover:!bg-red-700 text-white rounded-xl px-6 py-3 font-black text-xs tracking-widest transition-all shadow-lg shadow-red-500/20 uppercase"
                    >
                      {isStopping === lab.id ? 'Stopping...' : 'Stop Lab'}
                    </Button>
                  </div>
                ) : (
                  <Link 
                    to={`/admin/compute/rdp?labId=${lab.id}&app=vscode`}
                    onClick={(e) => e.stopPropagation()}
                    style={{ textDecoration: 'none' }}
                  >
                    <Button 
                      variant="contained" 
                      className="!bg-red-600 hover:!bg-red-700 text-white rounded-xl px-8 py-3 font-black text-xs tracking-widest transition-all group-hover:shadow-lg group-hover:shadow-red-500/20 uppercase"
                      endIcon={<MdChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    >
                      Start Lab
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className={`w-2 h-2 rounded-full ${isLabActive(lab.id) ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {isLabActive(lab.id) ? 'Session Active' : 'System Online'}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </Box>
      
    {/* Stop Lab Confirmation Modal */}
    <Dialog 
      open={showStopModal} 
      onClose={() => !isStopping && setShowStopModal(false)}
      PaperProps={{
        className: "bg-[#1e1e1e] border border-white/10 rounded-2xl p-2",
        style: { backgroundColor: '#1e1e1e', borderRadius: '20px', color: 'white' }
      }}
    >
      <Box className="p-6 flex flex-col items-center gap-4 text-center max-w-sm">
        <Box className="w-16 h-16 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 mb-2">
          <MdWarning size={32} />
        </Box>
        <div className="space-y-1">
          <Typography className="text-white text-xl font-black uppercase tracking-tighter">Stop Lab Session?</Typography>
          <Typography className="text-slate-400 text-sm">Are you sure you want to stop this lab? All unsaved work will be permanently lost.</Typography>
        </div>
        <Box className="flex gap-3 w-full mt-4">
          <Button 
            onClick={() => setShowStopModal(false)}
            disabled={!!isStopping}
            className="flex-1 !py-3 !rounded-xl !text-slate-400 !bg-white/5 hover:!bg-white/10 !font-black !text-[11px] uppercase tracking-widest"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStopLab}
            disabled={!!isStopping}
            variant="contained"
            className="flex-1 !py-3 !rounded-xl !bg-red-600 hover:!bg-red-700 !text-white !font-black !text-[11px] uppercase tracking-widest shadow-xl shadow-red-600/20"
          >
            Yes, Stop
          </Button>
        </Box>
      </Box>
    </Dialog>
  </>
  );
};

export default LabGrid;
