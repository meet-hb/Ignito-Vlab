import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Fade,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Invalid email or password.');
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginId.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }

    const result = await login(loginId.trim(), password);
    if (result.success) {
      navigate('/');
    } else {
      setErrorMessage(result.message || 'Unable to sign in. Please try again.');
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      bgcolor: '#ffffff',
      '& input': {
        backgroundColor: 'transparent',
      },
      '& input:-webkit-autofill': {
        WebkitBoxShadow: '0 0 0 100px #ffffff inset',
        WebkitTextFillColor: '#0f172a',
        caretColor: '#0f172a',
        borderRadius: '6px',
      },
      '& fieldset': {
        borderColor: '#e5e7eb',
      },
      '&:hover fieldset': {
        borderColor: '#cbd5e1',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#fb7185',
      },
    },
  };

  return (
    <Box className="min-h-screen bg-white p-3 sm:p-4 md:p-6 font-sans flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full"
      >
        <Paper
          elevation={0}
          className="relative overflow-hidden rounded-[22px] sm:rounded-[28px] border border-slate-100 bg-white min-h-[720px]"
        >
          <Box className="grid grid-cols-1 lg:grid-cols-[0.47fr_0.53fr] min-h-[calc(100vh-24px)] sm:min-h-[calc(100vh-32px)] md:min-h-[calc(100vh-48px)]">
            <Box className="relative min-h-[320px] sm:min-h-[360px] lg:min-h-full overflow-hidden mx-3 mt-3 lg:mx-0 lg:mt-0 rounded-[18px] lg:rounded-none">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    'linear-gradient(180deg, rgba(168,28,52,0.55), rgba(142,18,44,0.78)), url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80")',
                }}
              />

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.18))]" />

              <div className="relative z-10 h-full flex flex-col justify-between p-5 sm:p-6 md:p-8 text-white">
                <div className="flex items-center gap-3">
                  <Box className="w-9 h-9 rounded-lg bg-white/15 border border-white/15 backdrop-blur-md flex items-center justify-center">
                    <img src="/assets/logo.png" alt="Vlab" className="w-5 h-5 object-contain" />
                  </Box>
                  <Typography className="text-sm font-bold tracking-wide">Ignito Vlab</Typography>
                </div>

                <div className="pt-14 sm:pt-20 lg:pt-0">
                  <Typography className="text-[52px] sm:text-3xl md:text-4xl font-semibold tracking-tight mb-3 max-w-[320px] sm:max-w-none">
                    Welcome to Ignito Vlab
                  </Typography>
                  <Typography className="text-sm md:text-base text-white/85 max-w-md leading-7">
                    Login to access your account and manage labs, instances, and remote desktop sessions from one place.
                  </Typography>
                </div>

                <Typography className="text-[11px] text-white/75">
                  Login to access your account
                </Typography>
              </div>
            </Box>

            <Box className="relative bg-white overflow-hidden flex items-center justify-center px-3 pb-3 pt-4 sm:px-4 sm:pb-4 sm:pt-5 md:p-10">
              <div className="absolute right-[-120px] top-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full border border-rose-100" />
              <div className="absolute right-[-70px] top-1/2 -translate-y-1/2 w-[410px] h-[410px] rounded-full border border-rose-100/80" />
              <div className="absolute right-[10px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border-[28px] border-rose-100/90" />
              <div className="absolute right-[118px] top-[145px] w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-[0_8px_20px_rgba(190,24,93,0.35)]" />
              <div className="absolute right-[170px] bottom-[150px] w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-[0_8px_20px_rgba(190,24,93,0.35)]" />

              <Paper
                elevation={0}
                className="relative z-10 w-full max-w-[500px] rounded-[20px] bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.12)] border border-slate-100 px-6 py-8 sm:px-8 sm:py-9 md:px-10 md:py-10"
              >
                <Typography className="text-center text-[28px] font-semibold text-slate-800 mb-9">
                  Login
                </Typography>

                <Fade in={error}>
                  <Box>
                    {error && (
                      <Alert severity="error" className="rounded-xl mb-4">
                        {errorMessage}
                      </Alert>
                    )}
                  </Box>
                </Fade>

                <form onSubmit={handleLogin} className="space-y-5">
                  <Box>
                    <Typography className="text-[14px] font-medium text-slate-500 mb-2.5">Email</Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter your email"
                      value={loginId}
                      onChange={(event) => setLoginId(event.target.value)}
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdEmail size={18} className="text-slate-400" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography className="text-[14px] font-medium text-slate-500 mb-2.5">Password</Typography>
                    <TextField
                      fullWidth
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      sx={textFieldStyles}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MdLock size={18} className="text-slate-400" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword((prev) => !prev)}>
                              {showPassword ? <MdVisibilityOff size={18} className="text-rose-400" /> : <MdVisibility size={18} className="text-rose-400" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    className="!mt-7 !rounded-[6px] !py-3.5 !text-white !font-semibold !text-sm !tracking-[0.22em] !bg-[#ff6b5f] hover:!bg-[#f85b4d] shadow-none"
                  >
                    {isLoading ? 'LOGGING IN...' : 'LOG IN'}
                  </Button>

                  <div className="flex flex-col items-center gap-2 pt-2">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={keepLoggedIn}
                          onChange={(event) => setKeepLoggedIn(event.target.checked)}
                          size="small"
                          sx={{
                            color: '#d1d5db',
                            '&.Mui-checked': { color: '#ff6b5f' },
                            padding: '6px',
                          }}
                        />
                      }
                      label={<span className="text-[13px] text-slate-500">Keep me logged in</span>}
                      className="m-0"
                    />

                    <button
                      type="button"
                      className="text-[13px] text-[#ff6b5f] hover:text-[#f85b4d] transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </form>
              </Paper>

              <Typography className="absolute bottom-4 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-8 text-[10px] text-slate-400 text-center whitespace-nowrap">
                Copyright 2026. All rights reserved.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
