import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recruitment from "./pages/Recruitment";
import Candidates from "./pages/Candidates";
import Interviews from "./pages/Interviews";
import Onboarding from "./pages/Onboarding";
import Employees from "./pages/Employees";
import Departments from "./pages/Departments";
import RolesPermissions from "./pages/RolesPermissions";
import Guarantors from "./pages/Guarantors";
import Payroll from "./pages/Payroll";
import LeaveManagement from "./pages/LeaveManagement";
import Reports from "./pages/Reports";
import HRSettings from "./pages/Settings";
import Inbox from "./pages/Inbox";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard"  />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/roles" element={<RolesPermissions />} />
              <Route path="/guarantors" element={<Guarantors />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/leave" element={<LeaveManagement />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<HRSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
