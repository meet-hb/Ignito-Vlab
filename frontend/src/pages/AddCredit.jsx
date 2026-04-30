import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Button, IconButton, Chip, Skeleton, Alert, Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAddCard, MdRefresh, MdHistory, MdPayment, MdWarning, MdCheckCircle, MdAccountBalanceWallet } from 'react-icons/md';
import Header from '../components/Header';
import PaymentGateway from '../components/PaymentGateway';
import { useLabStore } from '../store/labStore';

const LabCreditCard = ({ lab, onBuy }) => {
  const isOutOfCredit = (lab.credits || 0) <= 0;
  const [amount, setAmount] = useState(100); // Default adjustment amount

  const handleIncrement = () => setAmount(prev => prev + 50);
  const handleDecrement = () => setAmount(prev => Math.max(50, prev - 50));
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative overflow-hidden bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {/* Background Gradient */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 -mr-16 -mt-16 transition-colors duration-500 ${isOutOfCredit ? 'bg-red-500' : 'bg-blue-500'}`} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform duration-500">
            <MdAccountBalanceWallet size={24} className={isOutOfCredit ? 'text-red-500' : 'text-blue-500'} />
          </div>
          {isOutOfCredit ? (
            <Chip 
              icon={<MdWarning size={14} />} 
              label="No Credits" 
              size="small" 
              className="!bg-red-50 !text-red-600 !font-black !text-[10px] uppercase tracking-wider border border-red-100" 
            />
          ) : (
            <Chip 
              label="Active" 
              size="small" 
              className="!bg-emerald-50 !text-emerald-600 !font-black !text-[10px] uppercase tracking-wider border border-emerald-100" 
            />
          )}
        </div>

        <Typography className="text-[14px] font-black text-slate-900 mb-1 leading-tight line-clamp-1">
          {lab.name}
        </Typography>
        <Typography className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          {lab.semester || 'Other'}
        </Typography>

        <div className="mt-auto">
          {/* Current Balance Display */}
          <div className="flex items-end justify-between mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <Typography className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Current Balance
              </Typography>
              <Typography className={`text-2xl font-black tracking-tighter ${isOutOfCredit ? 'text-red-600' : 'text-slate-900'}`}>
                {lab.credits || 0}
              </Typography>
            </div>
            <Typography className="text-[9px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
              Credits
            </Typography>
          </div>

          {/* Interactive Counter */}
          <div className="mb-6">
            <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 text-center">
              Recharge Amount
            </Typography>
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-1 shadow-sm">
              <IconButton 
                onClick={handleDecrement}
                className="!bg-slate-50 hover:!bg-slate-100 !text-slate-600 !w-10 !h-10"
                size="small"
              >
                <Typography className="text-xl font-black">-</Typography>
              </IconButton>
              <Typography className="text-lg font-black text-slate-900">
                {amount}
              </Typography>
              <IconButton 
                onClick={handleIncrement}
                className="!bg-slate-900 hover:!bg-black !text-white !w-10 !h-10 shadow-md"
                size="small"
              >
                <Typography className="text-xl font-black">+</Typography>
              </IconButton>
            </div>
          </div>

          <Button
            fullWidth
            onClick={() => onBuy(lab, amount)}
            variant="contained"
            className={`!rounded-2xl !py-3 !shadow-none !text-[12px] !font-black !uppercase !tracking-widest transition-all duration-300 ${
              isOutOfCredit 
                ? '!bg-red-600 hover:!bg-red-700 !text-white' 
                : '!bg-slate-900 hover:!bg-black !text-white'
            }`}
            startIcon={<MdPayment size={18} />}
          >
            Buy {amount} Credits
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function AddCredit({ onMenuClick }) {
  const { labs, isLoading, loadLabs, updateLab } = useLabStore();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(100);

  useEffect(() => {
    loadLabs();
  }, [loadLabs]);

  const sortedLabs = useMemo(() => {
    if (!labs) return [];
    // Sort so labs with 0 credits come first
    return [...labs].sort((a, b) => {
      const aC = a.credits || 0;
      const bC = b.credits || 0;
      if (aC === 0 && bC > 0) return -1;
      if (aC > 0 && bC === 0) return 1;
      return 0;
    });
  }, [labs]);

  const handleBuy = (lab, amount) => {
    setSelectedLab(lab);
    setSelectedAmount(amount);
    setIsPaymentOpen(true);
  };

  const handlePaymentSuccess = (lab, creditsToAdd) => {
    // Update local state (in a real app, this would be an API call)
    const updatedLab = { ...lab, credits: (lab.credits || 0) + creditsToAdd };
    updateLab(updatedLab);

    setSnackbar({
      open: true,
      message: `Successfully added ${creditsToAdd} credits to ${lab.name}!`,
      severity: 'success'
    });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box className="flex-1 flex flex-col min-w-0 bg-slate-50 h-full overflow-hidden">
      <Header onMenuClick={onMenuClick} title="Recharge Lab Credits" />

      <Box component="main" className="flex-1 p-4 sm:p-8 overflow-auto">
        <div className="max-w-[1400px] mx-auto">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200">
                  <MdAddCard size={24} />
                </div>
                <Typography className="text-[12px] font-black text-red-600 uppercase tracking-[0.2em]">
                  Wallet & Billing
                </Typography>
              </div>
              <Typography className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
                Add Lab <span className="text-red-600">Credits</span>
              </Typography>
              <Typography className="text-slate-500 font-medium mt-3 max-w-xl">
                Keep your virtual labs running smoothly. Top up your credits instantly to prevent any interruptions in your learning environment.
              </Typography>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => loadLabs()}
                startIcon={<MdRefresh size={20} />}
                className="!rounded-2xl !bg-white !border !border-slate-200 !text-slate-600 !font-black !text-[12px] !px-6 !py-3 !uppercase !tracking-widest hover:!bg-slate-50 shadow-sm transition-all"
              >
                Refresh
              </Button>
              <Button
                startIcon={<MdHistory size={20} />}
                className="!rounded-2xl !bg-slate-900 !text-white !font-black !text-[12px] !px-6 !py-3 !uppercase !tracking-widest hover:!bg-black shadow-lg shadow-slate-200 transition-all"
              >
                History
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Out of Credit', count: labs.filter(l => (l.credits || 0) <= 0).length, color: 'text-red-600', bg: 'bg-red-50', icon: MdWarning },
              { label: 'Total Labs', count: labs.length, color: 'text-slate-900', bg: 'bg-slate-100', icon: MdAccountBalanceWallet },
              { label: 'Total Credits', count: labs.reduce((sum, l) => sum + (l.credits || 0), 0), color: 'text-blue-600', bg: 'bg-blue-50', icon: MdCheckCircle },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center gap-6"
              >
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <Typography className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {stat.label}
                  </Typography>
                  <Typography className={`text-3xl font-black tracking-tight ${stat.color}`}>
                    {isLoading ? <Skeleton width={40} /> : stat.count}
                  </Typography>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lab List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 h-[300px]">
                    <Skeleton variant="circular" width={48} height={48} className="mb-6" />
                    <Skeleton variant="text" width="60%" className="mb-2" />
                    <Skeleton variant="text" width="40%" className="mb-8" />
                    <Skeleton variant="text" width="100%" height={100} className="rounded-2xl" />
                  </div>
                ))
              ) : sortedLabs.length > 0 ? (
                sortedLabs.map((lab) => (
                  <LabCreditCard 
                    key={lab.id} 
                    lab={lab} 
                    onBuy={handleBuy} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <Typography className="text-slate-400 font-bold">No labs found.</Typography>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Box>
      
      <PaymentGateway
        open={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        lab={selectedLab}
        initialAmount={selectedAmount}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          className="rounded-2xl shadow-xl font-bold border border-slate-100"
          icon={<MdCheckCircle size={24} />}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
