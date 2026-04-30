import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Alert, IconButton, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MdTrendingUp, MdArrowBack, MdLayers } from 'react-icons/md';

import Header from '../components/Header';
import LabGrid from '../components/LabGrid';
import SemesterGrid from '../components/SemesterGrid';
import SupportFab from '../components/SupportFab';

import { useLabStore } from '../store/labStore';

export default function Dashboard({ onMenuClick }) {
  const { labs, isLoading, error, loadLabs } = useLabStore();
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  const semesters = useMemo(() => {
    const groups = labs.reduce((acc, lab) => {
      const sem = lab.semester || 'Other';
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(lab);
      return acc;
    }, {});

    return Object.keys(groups).sort().map(name => ({
      name,
      count: groups[name].length,
      totalCredits: groups[name].reduce((sum, lab) => sum + (lab.credits || 0), 0),
      labs: groups[name]
    }));
  }, [labs]);

  const filteredLabs = useMemo(() => {
    if (!selectedSemester) return [];
    return labs.filter(lab => (lab.semester || 'Other') === selectedSemester);
  }, [labs, selectedSemester]);

  const stats = useMemo(() => ([
    { 
      label: 'Total Available Labs', 
      value: labs.length, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      icon: MdTrendingUp
    }
  ]), [labs]);

  return (
    <Box className="flex-1 flex flex-col min-w-0 bg-slate-50 app-shell h-full overflow-hidden">
      <Header onMenuClick={onMenuClick} title="Infrastructure Dashboard" />

      <Box component="main" className="flex-1 p-3 sm:p-5 overflow-auto">
        <Box className="max-w-[1700px] mx-auto space-y-4 sm:space-y-5">
          {error && (
            <Alert severity="warning" className="rounded-xl py-1 px-3">
              <Typography className="text-xs">{error}. Showing last available data.</Typography>
            </Alert>
          )}

          {/* Header Row: Welcome + Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5 px-1">
            <div>
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <Typography variant="h2" className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">
                  Welcome, <span className="text-red-600">Meet</span>
                </Typography>
              </motion.div>
              <Typography className="text-[8px] sm:text-[9px] text-slate-400 uppercase tracking-[0.25em] font-black mt-1.5 ml-0.5">Infrastructure Hub</Typography>
            </div>

            {/* Statistics Cards */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto"
            > 
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -2 }}
                  className="relative overflow-hidden frosted-card p-2.5 sm:p-3 flex items-center justify-between gap-3 group transition-all duration-300 border border-white min-h-[60px] sm:min-h-[80px] flex-1 sm:min-w-[200px]"
                >
                  <div className="relative z-10 flex-1">
                    <Typography className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-[0.15em] mb-0.5 whitespace-nowrap">{stat.label}</Typography>
                    <div className="flex items-baseline gap-1">
                      <Typography className={"text-lg sm:text-xl font-black tracking-tight " + stat.color}>
                        {isLoading ? "..." : stat.value}
                      </Typography>
                      <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Live</span>
                    </div>
                  </div>

                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110 shrink-0 ${stat.bg}`}>
                     <stat.icon size={16} className={stat.color} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Labs Hub Section */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 text-white rounded-xl">
                    <MdLayers size={20} />
                  </div>
                  <div>
                    <Typography className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                      {selectedSemester ? `Explore ${selectedSemester}` : "Academic Curriculum"}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {selectedSemester ? "Viewing Filtered Content" : "System Status: Optimal"}
                      </Typography>
                    </div>
                  </div>
               </div>

               {selectedSemester && (
                 <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <Button 
                      onClick={() => setSelectedSemester(null)}
                      startIcon={<MdArrowBack />}
                      className="!rounded-xl !bg-white !border !border-slate-200 !text-slate-600 !font-black !text-[11px] !px-5 !py-2.5 uppercase tracking-widest hover:!bg-slate-50 transition-all shadow-sm"
                    >
                      Back to Semesters
                    </Button>
                 </motion.div>
               )}
            </div>

            <div className="mt-4">
               <AnimatePresence mode="wait">
                  {selectedSemester ? (
                    <motion.div
                      key="labs"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <LabGrid labs={filteredLabs} onLabClick={() => {}} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="semesters"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                    >
                      <SemesterGrid 
                        semesters={semesters} 
                        onSemesterClick={(name) => setSelectedSemester(name)} 
                      />
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>
        </Box>
      </Box>

      <SupportFab />
    </Box>
  );
}
