
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogIn, LogOut } from "lucide-react";
import Button from "./Button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detect user authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (data.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        setUserProfile(profileData);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Navbar auth event:", event);
        setIsAuthenticated(!!session);
        
        if (session) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          setUserProfile(profileData);
        } else {
          setUserProfile(null);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Detect scroll position to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
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
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "py-3 bg-background/80 backdrop-blur-lg shadow-sm" : "py-5"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to={isAuthenticated ? "/home" : "/"}
          className="flex items-center text-xl font-semibold text-foreground"
        >
          <span className="text-primary font-bold">Door</span>
          <span>Finder</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link
                to="/home"
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  location.pathname === "/home" ? "text-primary" : "text-foreground"
                )}
              >
                Home
              </Link>
              <Link
                to="/search"
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  location.pathname === "/search" ? "text-primary" : "text-foreground"
                )}
              >
                Browse
              </Link>
              <Link
                to="/saved"
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  location.pathname === "/saved" ? "text-primary" : "text-foreground"
                )}
              >
                Saved
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/browse"
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  location.pathname === "/browse" ? "text-primary" : "text-foreground"
                )}
              >
                Browse
              </Link>
              <Link
                to="/about"
                className={cn(
                  "text-sm hover:text-primary transition-colors",
                  location.pathname === "/about" ? "text-primary" : "text-foreground"
                )}
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<User size={16} />}
                >
                  {userProfile?.full_name || 'Profile'}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                iconLeft={<LogOut size={16} />}
                onClick={handleLogout}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  iconLeft={<LogIn size={16} />}
                >
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button 
                  size="sm" 
                  iconLeft={<User size={16} />}
                >
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile Menu */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-background shadow-lg md:hidden transition-transform duration-300 ease-in-out transform glass",
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/home"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/home" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Home
                  </Link>
                  <Link
                    to="/search"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/search" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Browse
                  </Link>
                  <Link
                    to="/saved"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/saved" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Saved
                  </Link>
                  <Link
                    to="/profile"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/profile" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/browse"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/browse" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Browse
                  </Link>
                  <Link
                    to="/about"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname === "/about" 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    About
                  </Link>
                </>
              )}
            </nav>
            <div className="pt-3 border-t border-border flex flex-col space-y-2">
              {isAuthenticated ? (
                <Button 
                  variant="outline" 
                  fullWidth 
                  iconLeft={<LogOut size={16} />}
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              ) : (
                <>
                  <Link to="/login" className="w-full">
                    <Button variant="outline" fullWidth iconLeft={<LogIn size={16} />}>
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button fullWidth iconLeft={<User size={16} />}>
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
