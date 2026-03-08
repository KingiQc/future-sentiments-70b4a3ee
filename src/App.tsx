import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";

import LockScreen from "@/components/LockScreen";
import Index from "./pages/Index";
import ReceivedPage from "./pages/ReceivedPage";
import SettingsPage from "./pages/SettingsPage";
import CreateLetterPage from "./pages/CreateLetterPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import LetterDetailPage from "./pages/LetterDetailPage";
import FollowPage from "./pages/FollowPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LockScreen>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/received" element={<ReceivedPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/create" element={<CreateLetterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/letter/:id" element={<LetterDetailPage />} />
                <Route path="/follow" element={<FollowPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LockScreen>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
