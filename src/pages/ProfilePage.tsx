
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";
import { User, Settings, Home, LogOut } from "lucide-react";
import Button from "@/components/Button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          setIsLoading(false);
          return;
        }
        
        const { user } = session.session;
        
        // Fetch user metadata
        const userData = {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || 'User',
          isLoggedIn: true
        };
        
        setUserProfile(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse h-20 w-20 rounded-full bg-primary/20"></div>
            </div>
          ) : userProfile?.isLoggedIn ? (
            <>
              <div className="flex items-center mb-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <User size={30} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                  <p className="text-muted-foreground">{userProfile.email}</p>
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
                <div 
                  className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer flex items-center"
                  onClick={handleSignOut}
                >
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
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                  >
                    Create Account
                  </Button>
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
