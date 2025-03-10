
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";
import PropertyDetail from "./pages/PropertyDetail";
import NotFound from "./pages/NotFound";
import SearchPage from "./pages/SearchPage";
import SavedPage from "./pages/SavedPage";
import ProfilePage from "./pages/ProfilePage";
import PostPropertyPage from "./pages/PostPropertyPage";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BrowsePage from "./pages/BrowsePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // If auth status is still loading, return nothing to prevent flicker
    if (isAuthenticated === null) return null;
    
    return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            
            {/* Protected Routes */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/property/:id" element={
              <ProtectedRoute>
                <PropertyDetail />
              </ProtectedRoute>
            } />
            <Route path="/search" element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/post" element={
              <ProtectedRoute>
                <PostPropertyPage />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
