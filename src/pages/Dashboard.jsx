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
    <Box className="flex-1 flex flex-col min-w-0 bg-slate-50 app-shell">
      <Header onMenuClick={onMenuClick} title={selectedLab ? getDetailTitle() : 'Infrastructure Dashboard'} onBack={selectedLab ? () => setSelectedLab(null) : undefined} />

      <Box component="main" className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto">
        <Box className="max-w-[1700px] mx-auto space-y-6">
          {error && (
            <Alert severity="warning" className="rounded-2xl">
              {error}. Showing the last available data.
            </Alert>
          )}

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}> 
            <Box className="bg-white border border-slate-200 rounded-3xl p-2 flex flex-col md:flex-row gap-2 shadow-sm">
              {stats.map((stat, i) => (
                <div key={i} className="flex-1 flex items-center justify-between p-5 md:p-6 hover:bg-slate-50 rounded-2xl transition-colors group">
                  <div>
                    <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</Typography>
                    <Typography className={"text-2xl font-black mt-1 " + stat.color}>{isLoading ? '...' : stat.value}</Typography>
                  </div>
                  <div className={"w-12 h-12 rounded-xl flex items-center justify-center border border-slate-100 " + stat.bg}>
                     <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                </div>
              ))}
            </Box>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            {selectedLab ? (
              <div className="space-y-6">
                <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2">
                  <div>
                    <Breadcrumbs separator={<span className="text-slate-300"><MdChevronRight size={18} /></span>} className="text-sm font-semibold text-slate-400">
                      <Link underline="hover" color="inherit" onClick={() => setSelectedLab(null)} className="cursor-pointer hover:text-red-500 transition-colors">Infrastructure</Link>
                      <Typography className="text-red-600 font-bold">{getDetailTitle()}</Typography>
                    </Breadcrumbs>
                    <Typography variant="h3" className="text-3xl md:text-4xl font-black text-slate-900 mt-2 uppercase tracking-tight">{getDetailTitle()} <span className="text-red-600">Labs</span></Typography>
                  </div>
                  <Button 
                    onClick={() => setSelectedLab(null)}
                    className="text-slate-500 font-bold hover:text-red-600 normal-case"
                  >
                    Return to Hub
                  </Button>
                </Box>
                <SubLabGrid labs={getSubLabsForSelected()} />
              </div>
            ) : (
              <div className="space-y-6">
                <Box className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
                  <div>
                    <Typography variant="h2" className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                      Welcome, <span className="text-red-600">Meet</span>
                    </Typography>
                    <Typography className="text-xs text-slate-400 uppercase tracking-[0.3em] font-black mt-2">Centralized Infrastructure Hub</Typography>
                  </div>
                  <Typography className="text-[10px] font-black text-slate-300 uppercase tracking-widest hidden md:block pb-1">System Status: Optimal</Typography>
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
