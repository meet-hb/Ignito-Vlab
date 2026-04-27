import React from 'react';
import { Box, Card, Typography, Button } from '@mui/material';
import { motion } from 'motion/react';
import { MdChevronRight, MdTerminal } from 'react-icons/md';
import { useLabStore } from '../store/labStore';

const LabGrid = ({ onLabClick, labs: labsProp }) => {
  const { labs: storeLabs } = useLabStore();
  const labs = labsProp || storeLabs;

  return (
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
                   className="max-h-[70%] max-w-[70%] object-contain transition-transform duration-500 group-hover:scale-110 relative z-10"
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
              </div>

              {/* Action Section */}
              <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
                <Button 
                  variant="contained" 
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open('/admin/compute/rdp?app=vscode', '_blank', 'noopener,noreferrer');
                  }}
                  className="!bg-red-600 hover:!bg-red-700 text-white rounded-xl px-8 py-3 font-black text-xs tracking-widest transition-all group-hover:shadow-lg group-hover:shadow-red-500/20 uppercase"
                  endIcon={<MdChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                >
                  Start Lab
                </Button>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  System Online
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </Box>
  );
};

export default LabGrid;
