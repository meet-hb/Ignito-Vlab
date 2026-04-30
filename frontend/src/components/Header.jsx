import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Avatar,
  InputAdornment,
  Menu,
  Button
} from '@mui/material';
import {
  MdMenu,
  MdArrowBack,
  MdSearch,
  MdLogout,
  MdSecurity,
  MdSupportAgent,
  MdNotificationsNone
} from 'react-icons/md';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useLabStore } from '../store/labStore';

const Header = ({ onMenuClick, title, onBack }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState([]);
  const logout = useAuthStore(state => state.logout);
  const { labs, subLabs } = useLabStore();
  const open = Boolean(anchorEl);

  // Combine all labs and sub-labs into one searchable list
  const ALL_SEARCH_DATA = React.useMemo(() => {
    const data = [];
    
    // Add Main Labs
    labs.forEach(lab => {
      data.push({ id: lab.id, type: 'Category', name: lab.title, path: `/admin/labs` });
    });

    // Add Sub Labs
    Object.values(subLabs).forEach(subList => {
      subList.forEach(sub => {
        data.push({ id: sub.id, type: 'Lab', name: sub.title, path: `/admin/labs/view/${sub.id}` });
      });
    });

    // Add Mock Users/Policies for now
    data.push({ id: 'u1', type: 'User', name: 'Meet Nayak', path: '/admin/users' });
    data.push({ id: 'p1', type: 'Policy', name: 'Global Admin Policy', path: '/admin/policies' });
    
    return data;
  }, [labs, subLabs]);

  React.useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = ALL_SEARCH_DATA.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 8)); // Limit to 8 results
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, ALL_SEARCH_DATA]);
  
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  
  return (
    <Box
      component="header"
      className="sticky top-0 z-[100] px-4 md:px-8 py-3 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4 max-w-[1700px] mx-auto">
        
        {/* Left Side: Brand & Title */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <IconButton
            onClick={onMenuClick}
            className="md:hidden bg-slate-100/80 text-slate-600 hover:bg-slate-200 rounded-xl"
            size="small"
          >
            <MdMenu size={20} />
          </IconButton>
          
          {onBack && (
            <IconButton
              onClick={onBack}
              className="bg-slate-100/80 text-slate-600 hover:bg-slate-200 rounded-xl"
              size="small"
            >
              <MdArrowBack size={20} />
            </IconButton>
          )}
          <div className="flex items-center gap-2">
            <img src="/assets/logo-icon.png" alt="VL" className="h-8 w-8 object-contain lg:hidden" />
            <Typography variant="h4" className="font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap text-xl md:text-2xl lg:text-3xl">
              <span className="text-red-600">MCA</span>
            </Typography>
          </div>
        </div>

        {/* Center/Right: Search & Actions */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          
          {/* Modern Search */}
          <div className="relative hidden md:block">
            <TextField
              placeholder="Search something..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[200px] xl:w-[320px]"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '16px',
                  height: '44px',
                  fontSize: '13px',
                  fontWeight: 600,
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'transparent' },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                    '& fieldset': { borderColor: '#dc2626', borderWidth: '1px' },
                    boxShadow: '0 4px 20px rgba(220,38,38,0.08)'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MdSearch size={20} className="text-slate-400" />
                  </InputAdornment>
                ),
              }}
            />
            
            {searchResults.length > 0 && (
              <Box className="absolute top-[120%] left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[1000] py-2 animate-in fade-in slide-in-from-top-2">
                {searchResults.map(result => (
                  <Box 
                    key={`${result.type}-${result.id}`}
                    className="px-5 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group border-l-4 border-transparent hover:border-red-500"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  >
                    <div>
                      <Typography className="text-[9px] font-black text-red-600 uppercase tracking-widest">{result.type}</Typography>
                      <Typography className="text-[13px] font-bold text-slate-800">{result.name}</Typography>
                    </div>
                    <MdArrowBack size={14} className="rotate-180 text-slate-300 group-hover:text-red-500 transition-colors" />
                  </Box>
                ))}
              </Box>
            )}
          </div>

          <IconButton className="text-slate-400 hover:text-red-600 transition-colors hidden sm:flex">
            <MdNotificationsNone size={24} />
          </IconButton>

          {/* User Welcome Style (Image 2 Replacement) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClick}
            className="flex flex-col items-end cursor-pointer transition-all pr-1"
          >
            <Typography variant="h6" className="font-bold text-slate-900 tracking-tight leading-none text-sm md:text-base">
              Welcome, <span className="text-red-600">Meet</span>
            </Typography>
            <Typography className="text-slate-400 font-black uppercase tracking-[0.1em] text-[7px] md:text-[8px] mt-0.5">
              Infrastructure Hub
            </Typography>
          </motion.div>
        </div>
      </div>

      {/* Profile Menu Overlay */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          className: 'mt-4 w-80 rounded-[28px] border border-slate-200 overflow-hidden shadow-2xl shadow-slate-200/50',
          sx: { bgcolor: '#fff' },
        }}
      >
        <div className="p-8 text-center bg-slate-50/50">
          <div className="relative inline-block mb-4">
            <Avatar className="w-24 h-24 bg-gradient-to-tr from-red-600 to-red-500 mx-auto border-4 border-white shadow-xl text-3xl font-black text-white">
              MN
            </Avatar>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-md" />
          </div>
          <Typography variant="h6" className="font-black text-slate-900 mb-1 tracking-tight">
            Meet Nayak
          </Typography>
          <Typography className="text-red-600 font-black text-[10px] uppercase tracking-[0.2em]">
            Super Administrator
          </Typography>
        </div>
        
        <div className="p-6 space-y-3">
          <Button
            fullWidth
            variant="contained"
            onClick={logout}
            startIcon={<MdLogout size={20} />}
            className="!bg-red-600 hover:!bg-red-700 !text-white !rounded-2xl !py-3.5 !normal-case !font-black !text-sm !shadow-xl !shadow-red-600/20 !transition-all"
          >
            Logout Session
          </Button>
          

        </div>
      </Menu>
    </Box>
  );
};

export default Header;
