
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/hooks/useAuth';
import { LanguageProvider } from '@/contexts/LanguageContext';
import MobileLayout from "@/components/Layout/MobileLayout";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import ResetPassword from "@/pages/Auth/ResetPassword";
import Dashboard from "@/pages/Dashboard/Dashboard";
import EquipmentList from "@/pages/Equipment/EquipmentList";
import EquipmentDetail from "@/pages/Equipment/EquipmentDetail";
import PersonnelList from "@/pages/Personnel/PersonnelList";
import ConsumptionList from "@/pages/Consumption/ConsumptionList";
import TasksList from "@/pages/Tasks/TasksList";
import NotificationsList from "@/pages/Notifications/NotificationsList";
import About from "@/pages/About/About";
import Contact from "@/pages/Contact/Contact";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile/Profile";
import { useEffect } from "react";
import { requestNotificationPermission } from "./utils/notificationUtils";
import ReportGenerator from "./pages/Report/ReportGenerator";
import { useCapacitorInit } from "./utils/capacitorUtils";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('authToken') !== null;
  
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Always use mobile layout for all devices
  return <MobileLayout>{children}</MobileLayout>;
};

const App = () => {
  // Initialize Capacitor when app starts
  useCapacitorInit();
  
  // Check if dark mode is enabled and apply it
  useEffect(() => {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    if (darkModeEnabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/equipment" element={
                  <ProtectedRoute>
                    <EquipmentList />
                  </ProtectedRoute>
                } />
                
                <Route path="/equipment/:id" element={
                  <ProtectedRoute>
                    <EquipmentDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/personnel" element={
                  <ProtectedRoute>
                    <PersonnelList />
                  </ProtectedRoute>
                } />
                
                <Route path="/consumption" element={
                  <ProtectedRoute>
                    <ConsumptionList />
                  </ProtectedRoute>
                } />
                
                <Route path="/tasks" element={
                  <ProtectedRoute>
                    <TasksList />
                  </ProtectedRoute>
                } />
                
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <NotificationsList />
                  </ProtectedRoute>
                } />
                
                <Route path="/about" element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                } />
                
                <Route path="/contact" element={
                  <ProtectedRoute>
                    <Contact />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/" element={<Navigate to="/login" replace />} />
                
                <Route path="*" element={<NotFound />} />
                
                <Route path="/report" element={
                  <ProtectedRoute>
                    <ReportGenerator />
                  </ProtectedRoute>
                } />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
