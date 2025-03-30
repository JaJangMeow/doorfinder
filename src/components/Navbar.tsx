
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle logo click
  const handleLogoClick = () => {
    navigate("/home");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-3 bg-background/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto px-4 flex items-center justify-center">
        {/* Mobile Menu Button (Left side) */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden absolute left-4"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        
        {/* Logo now centered and clickable */}
        <div 
          className="text-xl font-semibold text-foreground cursor-pointer"
          onClick={handleLogoClick}
        >
          <span className="text-primary font-bold">Door</span>
          <span>Finder</span>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "absolute top-full left-0 right-0 bg-background shadow-lg md:hidden transition-transform duration-300 ease-in-out transform glass",
            isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          )}
        >
          <div className="container mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              {location.pathname === "/" && (
                <>
                  <Link
                    to="/login"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname.includes("/login") 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className={cn(
                      "py-2 px-4 rounded-md",
                      location.pathname.includes("/register") 
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
