import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { MdTrendingUp, MdLayers, MdHourglassEmpty } from 'react-icons/md';

import Header from '../components/Header';
import LabGrid from '../components/LabGrid';
import SupportFab from '../components/SupportFab';

import { useLabStore } from '../store/labStore';

export default function Dashboard({ onMenuClick }) {
  const { labs, subLabs, isLoading, error, loadLabs } = useLabStore();

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  const stats = useMemo(() => ([
    { 
      label: 'Total Available Labs', 
      value: labs.length, 
      color: 'text-red-600', 
      bg: 'bg-red-50',
      icon: MdTrendingUp
    },
    {
      label: 'Active Sub-labs',
      value: Object.keys(subLabs).reduce((acc, key) => acc + subLabs[key].length, 0),
      color: 'text-slate-900',
      bg: 'bg-slate-50',
      icon: MdLayers
    }
  ]), [labs, subLabs]);

  return (
    <Box className="flex-1 flex flex-col min-w-0 bg-slate-50 app-shell h-full overflow-hidden">
      <Header onMenuClick={onMenuClick} title="Infrastructure Dashboard" />

      <Box component="main" className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto">
        <Box className="max-w-[1700px] mx-auto space-y-8">
          {error && (
            <Alert severity="warning" className="rounded-2xl">
              {error}. Showing the last available data.
            </Alert>
          )}

          {/* Header Row: Welcome + Stats */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-2">
            <div>
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <Typography variant="h2" className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                  Welcome, <span className="text-red-600">Meet</span>
                </Typography>
              </motion.div>
              <Typography className="text-xs text-slate-400 uppercase tracking-[0.4em] font-black mt-4 ml-1">Centralized Infrastructure Hub</Typography>
            </div>

            {/* Statistics Cards */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            > 
              {stats.map((stat, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -5 }}
                  className="relative overflow-hidden frosted-card p-5 flex items-center justify-between group transition-all duration-300 border border-white min-h-[110px] min-w-[240px]"
                >
                  <div className="relative z-10">
                    <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</Typography>
                    <div className="flex items-baseline gap-1">
                      <Typography className={"text-2xl font-black tracking-tight " + stat.color}>
                        {isLoading ? "..." : stat.value}
                      </Typography>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Live</span>
                    </div>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 ${stat.bg}`}>
                     <stat.icon size={24} className={stat.color} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Labs Hub Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              System Status: Optimal
            </div>

            <div>
              <LabGrid onLabClick={() => {}} labs={labs} />
            </div>
          </div>
        </Box>
      </Box>

      <SupportFab />
    </Box>
  );
}
