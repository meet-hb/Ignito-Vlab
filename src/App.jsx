import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Box, Drawer, IconButton } from '@mui/material';
import { MdClose } from 'react-icons/md';
// Layout Components
import SidebarContent from './components/SidebarContent';
// Pages
import Dashboard from './pages/Dashboard';
import AdminLabs from './pages/AdminLabs';
import CreateMultipleUsers from './pages/CreateMultipleUsers';
import CreateUser from './pages/CreateUser';
import AllUsers from './pages/AllUsers';
import CreatePolicy from './pages/CreatePolicy';
import ViewLab from './pages/ViewLab';
import Login from './pages/Login';
// Compute Pages (Lightsail Clone)
import Instances from './pages/compute/Instances';
import CreateInstance from './pages/compute/CreateInstance';
import Terminal from './pages/compute/Terminal';
import CloudEditor from './pages/compute/Editor';
import RemoteDesktop from './pages/compute/RemoteDesktop';
import { useAuthStore } from './store/authStore';

function AuthenticatedApp({ isSidebarOpen, isCollapsed, toggleSidebar, setIsSidebarOpen }) {
  const location = useLocation();
  const isRemoteDesktopRoute = location.pathname === '/admin/compute/rdp';

  if (isRemoteDesktopRoute) {
    return (
      <Routes>
        <Route path="/admin/compute/rdp" element={<RemoteDesktop onMenuClick={toggleSidebar} />} />
        <Route path="*" element={<Navigate to="/admin/compute/rdp" replace />} />
      </Routes>
    );
  }

  return (
    <Box className="min-h-screen flex bg-ignito-bg font-sans">
      {/* Sidebar - Desktop */}
      <Box className="hidden md:block flex-shrink-0 transition-all duration-300" sx={{ width: isCollapsed ? { md: 60, lg: 80 } : { md: 240, lg: 280 } }}>
        <SidebarContent isCollapsed={isCollapsed} />
      </Box>
      {/* Sidebar - Mobile */}
      <Drawer
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280, bgcolor: 'var(--color-ignito-sidebar)' },
        }}>
        <Box className="relative h-full">
          <SidebarContent />
          <IconButton
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-5 -right-14 bg-white hover:bg-gray-100 shadow-xl">
            <div className="text-ignito-maroon flex items-center">
              <MdClose size={22} />
            </div>
          </IconButton>
        </Box>
      </Drawer>
      <Routes>
        <Route path="/" element={<Dashboard onMenuClick={toggleSidebar} />} />
        <Route path="/admin/labs" element={<AdminLabs onMenuClick={toggleSidebar} />} />
        <Route path="/admin/users/bulk" element={<CreateMultipleUsers onMenuClick={toggleSidebar} />} />
        <Route path="/admin/users/new" element={<CreateUser onMenuClick={toggleSidebar} />} />
        <Route path="/admin/users" element={<AllUsers onMenuClick={toggleSidebar} />} />
        <Route path="/admin/policies/new" element={<CreatePolicy onMenuClick={toggleSidebar} />} />
        <Route path="/admin/labs/view/:id" element={<ViewLab onMenuClick={toggleSidebar} />} />
        
        {/* Compute Routes */}
        <Route path="/admin/compute" element={<Navigate to="/admin/compute/instances" replace />} />
        <Route path="/admin/compute/instances" element={<Instances onMenuClick={toggleSidebar} />} />
        <Route path="/admin/compute/new" element={<CreateInstance onMenuClick={toggleSidebar} />} />
        <Route path="/admin/compute/terminals" element={<Terminal onMenuClick={toggleSidebar} />} />
        <Route path="/admin/compute/ide" element={<CloudEditor onMenuClick={toggleSidebar} />} />

        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Box>
  );
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const toggleSidebar = () => {
    if (window.innerWidth < 900) {
      setIsSidebarOpen(true);
    } else {
      setIsCollapsed(prev => !prev);
    }
  };
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }
  return (
    <BrowserRouter>
      <AuthenticatedApp
        isSidebarOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </BrowserRouter>
  );
}
