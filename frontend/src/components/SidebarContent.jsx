import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { MdExpandMore } from 'react-icons/md';
import { motion } from 'motion/react';
import { SIDEBAR_ITEMS } from '../constants/sidebar';

const SidebarContent = ({ isCollapsed = false }) => {
  const [expandedItems, setExpandedItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleExpand = (label) => {
    setExpandedItems(prev => (prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]));
  };

  const wrapperClasses =
    'h-full flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ' +
    (isCollapsed ? 'w-[70px] md:w-[82px]' : 'w-[260px] md:w-[290px]');

  return (
    <Box className={wrapperClasses}
      sx={{ background: "rgba(255, 255, 255, 0.95)" }}
    >
      <Box className="p-5 pb-3 flex items-center gap-3 justify-between">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 w-full">
          <Box className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
            <img src="/assets/logo.png" alt="logo" className="w-7 h-7 object-contain" />
          </Box>
          {!isCollapsed && <Typography className="font-black text-slate-900 tracking-tight text-[15px] truncate">Vlab HQ</Typography>}
        </motion.div>
      </Box>

      <List className="flex-1 mt-4 overflow-y-auto px-3 pb-20 custom-scrollbar space-y-1">
        {SIDEBAR_ITEMS.map((item, idx) => {
          const isActive = item.path ? (item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)) : false;
          const isExpanded = expandedItems.includes(item.label);

          const itemClass =
            'rounded-[14px] px-4 py-2.5 transition-all duration-300 relative overflow-hidden group ' +
            (isActive ? 'bg-red-50 border border-red-100 text-red-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent') +
            (isCollapsed ? ' justify-center px-1' : '');

          return (
            <Box key={idx} className="group/item relative mb-1.5">
              <ListItem disablePadding>
                <ListItemButton
                  title={isCollapsed ? item.label : ''}
                  onClick={() => {
                    if (item.hasSub) {
                      toggleExpand(item.label);
                    } else if (item.path) {
                      navigate(item.path);
                    }
                  }}
                  className={itemClass}
                  sx={{ 
                    borderLeft: `3px solid ${isActive ? '#dc2626' : 'transparent'}`,
                  }}
                >
                  {isActive && <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-50 pointer-events-none" />}
                  
                  <ListItemIcon sx={{ color: isActive ? '#dc2626' : 'inherit', minWidth: isCollapsed ? 0 : 38, transition: 'color 0.3s ease' }} className="group-hover:text-red-500">
                    {item.icon && (() => { const Icon = item.icon; return <Icon size={22} />; })()}
                  </ListItemIcon>

                  {!isCollapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ className: 'text-[13px] font-bold tracking-wide transition-colors ' + (isActive ? 'text-red-700' : 'text-slate-500 group-hover:text-slate-900') }}
                    />
                  )}

                  {!isCollapsed && item.hasSub && (
                    <Box 
                      className={(isExpanded ? 'text-red-600 ' : 'text-slate-500 ') + 'transition-all duration-300 group-hover:text-red-500'}
                      sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'flex', alignItems: 'center' }}
                    >
                      <MdExpandMore size={18} />
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>

              <Collapse in={!isCollapsed && item.hasSub && isExpanded} timeout={300} unmountOnExit>
                <Box className="pl-[3.2rem] pr-2 py-1.5 mt-1 space-y-1 relative before:absolute before:left-[22px] before:top-0 before:bottom-0 before:w-[1px] before:bg-slate-200">
                  {item.subItems?.map((sub, sIdx) => {
                    const isSubActive = location.pathname === sub.path;
                    const SubIcon = sub.icon;
                    return (
                      <ListItemButton
                        key={sIdx}
                        onClick={() => { if (sub.path) navigate(sub.path); }}
                        className={'py-2 px-3 rounded-[10px] relative ' + (isSubActive ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50 hover:text-red-600') + ' transition-all duration-200'}
                      >
                        {isSubActive && <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-600 shadow-sm" />}
                        <ListItemIcon sx={{ color: isSubActive ? '#ef4444' : 'inherit', minWidth: 26 }}>
                          {SubIcon && <SubIcon size={16} />}
                        </ListItemIcon>
                        <ListItemText primary={sub.label} primaryTypographyProps={{ className: 'text-[12px] font-semibold tracking-wide' }} />
                      </ListItemButton>
                    );
                  })}
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </List>

      <Box className="p-5 border-t border-slate-200 bg-slate-50">
        <Typography className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-3">Logged in as</Typography>
        <Box className="flex items-center gap-3">
          <Avatar className="w-10 h-10 bg-red-600 text-white font-bold border border-red-500">M</Avatar>
          {!isCollapsed && (
            <Box>
              <Typography className="text-sm font-black text-slate-900 leading-tight">Meet Nayak</Typography>
              <Typography className="text-[10px] text-red-600 font-bold uppercase tracking-widest mt-0.5">Admin</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarContent;
