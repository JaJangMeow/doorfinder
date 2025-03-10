
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Menu, X, User, LogIn } from "lucide-react";
import Button from "./Button";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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
          to="/"
          className="flex items-center text-xl font-semibold text-foreground"
        >
          <span className="text-primary font-bold">Door</span>
          <span>Finder</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className={cn(
              "text-sm hover:text-primary transition-colors",
              location.pathname === "/" ? "text-primary" : "text-foreground"
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
            to="/about"
            className={cn(
              "text-sm hover:text-primary transition-colors",
              location.pathname === "/about" ? "text-primary" : "text-foreground"
            )}
          >
            About
          </Link>
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
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
            <Button size="sm" iconLeft={<User size={16} />}>
              Register
            </Button>
          </Link>
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
              <Link
                to="/"
                className={cn(
                  "py-2 px-4 rounded-md",
                  location.pathname === "/" 
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
            </nav>
            <div className="pt-3 border-t border-border flex flex-col space-y-2">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
