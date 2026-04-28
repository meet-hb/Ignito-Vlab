import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Alert } from '@mui/material';
import { MdChevronRight } from 'react-icons/md';
import { motion } from 'motion/react';

import Header from '../components/Header';
import LabGrid from '../components/LabGrid';
import SubLabGrid from '../components/SubLabGrid';
import SupportFab from '../components/SupportFab';

import { useLabStore } from '../store/labStore';

export default function Dashboard({ onMenuClick }) {
  const [selectedLab, setSelectedLab] = useState(null);
  const { labs, subLabs, isLoading, error, loadLabs } = useLabStore();

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  const handleLabClick = (lab) => {
    setSelectedLab(lab);
  };

  const getSubLabsForSelected = () => {
    if (!selectedLab) return [];
    return subLabs[selectedLab.title] || [];
  };

  const getDetailTitle = () => {
    if (!selectedLab) return '';
    return selectedLab.title;
  };

  const stats = useMemo(() => ([
    { label: 'Total Labs', value: labs.length, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Active Sub-labs', value: Object.keys(subLabs).reduce((acc, key) => acc + subLabs[key].length, 0), color: 'text-slate-900', bg: 'bg-slate-50' },
    { label: 'Pending Requests', value: 3, color: 'text-slate-900', bg: 'bg-slate-50' },
  ]), [labs, subLabs]);

  return (
    <Box className="flex-1 flex flex-col min-w-0 bg-slate-50 app-shell h-full overflow-hidden">
      <Header onMenuClick={onMenuClick} title={selectedLab ? getDetailTitle() : 'Infrastructure Dashboard'} onBack={selectedLab ? () => setSelectedLab(null) : undefined} />

      <Box component="main" className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto">
        <Box className="max-w-[1700px] mx-auto space-y-6">
          {error && (
            <Alert severity="warning" className="rounded-2xl">
              {error}. Showing the last available data.
            </Alert>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          > 
            <Box className="frosted-card p-2 flex flex-col md:flex-row gap-2">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ backgroundColor: "rgba(220, 38, 38, 0.02)" }}
                  className="flex-1 flex items-center justify-between p-5 md:p-6 rounded-2xl transition-all group cursor-default"
                >
                  <div>
                    <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</Typography>
                    <Typography className={"text-2xl font-black mt-1 " + stat.color}>
                      {isLoading ? (
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>...</motion.span>
                      ) : stat.value}
                    </Typography>
                  </div>
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 transition-transform duration-500 group-hover:scale-110 " + stat.bg}>
                     <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  </div>
                </motion.div>
              ))}
            </Box>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            {selectedLab ? (
              <div className="space-y-6">
                <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2">
                  <div>
                    <Breadcrumbs separator={<span className="text-slate-300"><MdChevronRight size={18} /></span>} className="text-sm font-semibold text-slate-400">
                      <Link underline="hover" color="inherit" onClick={() => setSelectedLab(null)} className="cursor-pointer hover:text-red-500 transition-colors">Infrastructure</Link>
                      <Typography className="text-red-600 font-bold">{getDetailTitle()}</Typography>
                    </Breadcrumbs>
                    <Typography variant="h3" className="text-3xl md:text-4xl font-black text-slate-900 mt-2 uppercase tracking-tight glow-title">{getDetailTitle()} Labs</Typography>
                  </div>
                  <Button 
                    onClick={() => setSelectedLab(null)}
                    variant="outlined"
                    className="text-slate-500 font-bold border-slate-200 rounded-xl hover:text-red-600 hover:border-red-200 normal-case px-6"
                  >
                    Return to Hub
                  </Button>
                </Box>
                <SubLabGrid labs={getSubLabsForSelected()} />
              </div>
            ) : (
              <div className="space-y-8">
                <Box className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                  <div>
                    <motion.div
                      initial={{ clipPath: 'inset(0 100% 0 0)' }}
                      animate={{ clipPath: 'inset(0 0% 0 0)' }}
                      transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    >
                      <Typography variant="h2" className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                        Welcome, <span className="text-red-600">Meet</span>
                      </Typography>
                    </motion.div>
                    <Typography className="text-xs text-slate-400 uppercase tracking-[0.4em] font-black mt-4 ml-1">Centralized Infrastructure Hub</Typography>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:flex pb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    System Status: Optimal
                  </div>
                </Box>
                <LabGrid onLabClick={handleLabClick} labs={labs} />
              </div>
            )}
          </motion.div>

        </Box>
      </Box>

      <SupportFab />
    </Box>
  );
}
