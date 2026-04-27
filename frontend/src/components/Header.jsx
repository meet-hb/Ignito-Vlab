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
  MdSupportAgent
} from 'react-icons/md';
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
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  return (
    <Box
      component="header"
      className="app-shell sticky top-0 z-50 px-3 sm:px-4 md:px-8 lg:px-10 py-3 md:py-4 border-b border-slate-200"
      sx={{
        background: 'rgba(255, 255, 255, 0.9)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-6 w-full">
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0 flex-1">
          <IconButton
            onClick={onMenuClick}
            className="md:hidden bg-slate-100 text-slate-600 hover:bg-slate-200"
            size="small"
          >
            <MdMenu size={20} />
          </IconButton>
          {onBack && (
            <IconButton
              onClick={onBack}
              className="bg-slate-100 text-slate-600 hover:bg-slate-200"
              size="small"
            >
              <MdArrowBack size={20} />
            </IconButton>
          )}
          <div className="rounded-2xl px-2.5 sm:px-3 py-1 bg-slate-100 flex items-center gap-2 border border-slate-200 min-w-0">
            <img src="/assets/logo.png" alt="VLabs" className="h-7 w-7 object-contain" />
            <Typography variant="subtitle2" className="font-black text-slate-900 tracking-tight text-sm truncate">
              Vlab Control
            </Typography>
          </div>
          <Typography variant="body2" className="hidden xl:inline-block ml-2 text-slate-500 font-semibold text-sm uppercase tracking-[0.15em] truncate">
            {title}
          </Typography>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
          <div className="relative hidden lg:block">
            <TextField
              placeholder="Find labs users policies..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-[180px] xl:w-[280px]"
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f8fafc',
                  borderRadius: '999px',
                  color: '#1e293b',
                  '& fieldset': { borderColor: '#e2e8f0' },
                  '&:hover fieldset': { borderColor: '#cbd5e1' },
                  '&.Mui-focused fieldset': { borderColor: '#dc2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.1)' }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <span className="text-slate-400 flex items-center">
                      <MdSearch size={18} />
                    </span>
                  </InputAdornment>
                ),
              }}
            />
            
            {searchResults.length > 0 && (
              <Box className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[1000] py-2">
                {searchResults.map(result => (
                  <Box 
                    key={`${result.type}-${result.id}`}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between group"
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                  >
                    <div>
                      <Typography className="text-[10px] font-black text-red-600 uppercase tracking-widest">{result.type}</Typography>
                      <Typography className="text-[13px] font-bold text-slate-800 group-hover:text-red-600 transition-colors">{result.name}</Typography>
                    </div>
                    <MdArrowBack size={14} className="rotate-180 text-slate-300 group-hover:text-red-600" />
                  </Box>
                ))}
              </Box>
            )}
          </div>
          <IconButton className="flex md:hidden text-slate-500" size="small">
            <MdSearch size={20} />
          </IconButton>
          <div
            onClick={handleClick}
            className="flex items-center gap-2 py-1 px-2 rounded-2xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-all max-w-[160px] sm:max-w-none"
          >
            <Avatar className="w-8 h-8 md:w-9 md:h-9 bg-red-600 border border-red-500 text-white font-bold">
              MN
            </Avatar>
            <div className="hidden lg:block text-left">
              <Typography variant="body2" className="font-bold text-slate-900 leading-none">
                Meet Nayak
              </Typography>
              <Typography variant="caption" className="text-red-600 uppercase tracking-widest text-[10px]">
                Administrator
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 0,
          className: 'overflow-visible shadow-xl mt-4 w-80 rounded-[24px] border border-slate-200',
          sx: {
            bgcolor: '#fff',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 24,
              width: 12,
              height: 12,
              bgcolor: '#fff',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderTop: '1px solid #e2e8f0',
              borderLeft: '1px solid #e2e8f0',
            },
          },
        }}
      >
        <div className="p-8 text-center bg-slate-50 rounded-t-[24px]">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 bg-red-600 mx-auto mb-4 border-4 border-white shadow-lg text-3xl font-black text-white">
              M
            </Avatar>
            <div className="absolute bottom-4 right-0 w-6 h-6 bg-emerald-400 border-4 border-white rounded-full shadow-sm" />
          </div>
          <Typography variant="h6" className="font-black text-slate-900 mb-1 tracking-tight">
            Meet Nayak
          </Typography>
          <Typography variant="body2" className="text-red-600 font-bold text-xs uppercase tracking-widest">
            Super Admin
          </Typography>
        </div>
        <div className="p-6 pt-2 flex flex-col gap-3">
          <Button
            fullWidth
            variant="contained"
            onClick={logout}
            startIcon={<MdLogout size={20} />}
            className="!bg-red-600 hover:!bg-red-700 text-white rounded-2xl py-3 normal-case font-black text-sm shadow-lg shadow-red-600/20 transition-all active:scale-[0.98]"
          >
            Logout Securely
          </Button>
          <div className="grid grid-cols-2 gap-3 mt-1">
            <Button
              variant="outlined"
              startIcon={<MdSecurity size={18} />}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-2xl py-2 normal-case font-bold text-[11px] transition-all"
            >
              Security
            </Button>
            <Button
              variant="outlined"
              startIcon={<MdSupportAgent size={18} />}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 rounded-2xl py-2 normal-case font-bold text-[11px] transition-all"
            >
              Support
            </Button>
          </div>
        </div>
      </Menu>
    </Box>
  );
};

export default Header;
