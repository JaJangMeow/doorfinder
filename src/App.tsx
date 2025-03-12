
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Index from "@/pages/Index";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import SearchPage from "@/pages/SearchPage";
import PropertyDetailPage from "@/pages/PropertyDetail";
import SavedPage from "@/pages/SavedPage";
import PostPropertyPage from "@/pages/PostPropertyPage";
import MyListingsPage from "@/pages/MyListingsPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";
import WelcomePage from "@/pages/WelcomePage";
import BrowsePage from "@/pages/BrowsePage";

import { Toaster } from "@/components/ui/toaster";
import { setupSupabaseStorage } from "@/lib/supabase-setup";

function App() {
  // Initialize Supabase storage on app mount
  useEffect(() => {
    setupSupabaseStorage().catch(err => {
      console.error("Failed to setup storage:", err);
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/property/:id" element={<PropertyDetailPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/post" element={<PostPropertyPage />} />
        <Route path="/my-listings" element={<MyListingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
