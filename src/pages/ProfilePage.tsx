
import React from "react";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import { User, Settings, Home, LogOut } from "lucide-react";
import Button from "@/components/Button";

const ProfilePage: React.FC = () => {
  // In a real app, this would fetch user data from your auth provider
  const user = {
    name: "Guest User",
    email: "user@example.com",
    isLoggedIn: false
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          {user.isLoggedIn ? (
            <>
              <div className="flex items-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <User size={30} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer flex items-center">
                  <Home size={20} className="mr-3 text-primary" />
                  <span>My Listings</span>
                </div>
                <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer flex items-center">
                  <Settings size={20} className="mr-3 text-primary" />
                  <span>Account Settings</span>
                </div>
                <div className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer flex items-center">
                  <LogOut size={20} className="mr-3 text-primary" />
                  <span>Sign Out</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <User size={30} className="text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-semibold mb-6">Welcome to DoorFinder</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Sign in to save properties, post listings, and manage your account.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline">Sign In</Button>
                  <Button>Create Account</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <TabBar />
    </div>
  );
};

export default ProfilePage;
