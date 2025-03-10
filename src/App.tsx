
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
      console.log("Auth state on init:", !!data.session);
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, !!session);
        setIsAuthenticated(!!session);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Protected route component - strictly for authenticated users
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    // If auth status is still loading, show loading indicator
    if (isAuthenticated === null) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
  };

  // Semi-protected route component - redirect to auth page if not authenticated
  const SemiProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (isAuthenticated === null) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      );
    }
    
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
            
            {/* Protected Routes - redirect to login if not authenticated */}
            <Route path="/home" element={
              <SemiProtectedRoute>
                <Index />
              </SemiProtectedRoute>
            } />
            <Route path="/property/:id" element={
              <SemiProtectedRoute>
                <PropertyDetail />
              </SemiProtectedRoute>
            } />
            <Route path="/search" element={
              <SemiProtectedRoute>
                <SearchPage />
              </SemiProtectedRoute>
            } />
            <Route path="/saved" element={
              <SemiProtectedRoute>
                <SavedPage />
              </SemiProtectedRoute>
            } />
            <Route path="/profile" element={
              <SemiProtectedRoute>
                <ProfilePage />
              </SemiProtectedRoute>
            } />
            
            {/* Fully Protected Routes - only for authenticated users */}
            <Route path="/post" element={
              <ProtectedRoute>
                <PostPropertyPage />
              </ProtectedRoute>
            } />
            
            {/* Redirects */}
            <Route path="/browse" element={<Navigate to="/search" replace />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
