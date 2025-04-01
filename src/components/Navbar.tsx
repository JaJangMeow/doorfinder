import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, Search, Heart, Building, ChevronDown } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import ContactDialog from '@/components/ContactDialog';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();

    supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    } else {
      navigate('/login');
      toast({
        title: 'Success',
        description: 'Logged out successfully.',
      });
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const closeProfile = () => {
    setIsProfileOpen(false);
  };

  const handleContactUsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsContactDialogOpen(true);
  };

  return (
    <>
      <nav className="sticky top-0 z-30 w-full bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center font-bold text-xl">
            DoorFinder
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className={`py-2 px-3 hover:text-primary transition-colors ${location.pathname === '/' ? 'text-primary font-medium' : ''}`}>
              Home
            </Link>
            <Link to="/search" className={`py-2 px-3 hover:text-primary transition-colors ${location.pathname === '/search' ? 'text-primary font-medium' : ''}`}>
              Browse
            </Link>
            <Link to="/saved" className={`py-2 px-3 hover:text-primary transition-colors ${location.pathname === '/saved' ? 'text-primary font-medium' : ''}`}>
              Saved
            </Link>
            <a href="#" onClick={handleContactUsClick} className="py-2 px-3 hover:text-primary transition-colors">
              Contact Us
            </a>
          </div>

          {/* Profile Menu */}
          {user ? (
            <div className="relative hidden md:block">
              <button onClick={toggleProfile} className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors">
                <User size={20} className="text-muted-foreground" />
                <ChevronDown size={16} className="text-muted-foreground" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-background border border-border overflow-hidden">
                  <Link to="/profile" className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors" onClick={closeProfile}>
                    <User size={16} className="mr-2" />
                    Profile
                  </Link>
                  <Link to="/my-listings" className="flex items-center px-4 py-2 text-sm hover:bg-accent transition-colors" onClick={closeProfile}>
                    <Building size={16} className="mr-2" />
                    My Listings
                  </Link>
                  <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm hover:bg-accent transition-colors text-left">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:block">
              <Link to="/login" className="py-2 px-3 hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/register" className="py-2 px-3 bg-primary text-primary-foreground rounded-md shadow hover:opacity-90 transition-colors">
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm flex flex-col p-4">
          {/* Mobile Menu Top Section */}
          <div className="flex items-center justify-between">
            <Link to="/home" className="flex items-center font-bold text-xl" onClick={() => setIsMenuOpen(false)}>
              DoorFinder
            </Link>
            <button onClick={toggleMenu}>
              <X size={24} />
            </button>
          </div>
          
          <div className="flex flex-col mt-8 space-y-6 text-lg px-2">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className={`flex items-center space-x-2 ${location.pathname === '/' ? 'text-primary font-medium' : ''}`}>
              <Home size={20} />
              <span>Home</span>
            </Link>
            <Link to="/search" onClick={() => setIsMenuOpen(false)} className={`flex items-center space-x-2 ${location.pathname === '/search' ? 'text-primary font-medium' : ''}`}>
              <Search size={20} />
              <span>Browse</span>
            </Link>
            <Link to="/saved" onClick={() => setIsMenuOpen(false)} className={`flex items-center space-x-2 ${location.pathname === '/saved' ? 'text-primary font-medium' : ''}`}>
              <Heart size={20} />
              <span>Saved</span>
            </Link>
            <a href="#" onClick={(e) => { setIsMenuOpen(false); handleContactUsClick(e); }} className="flex items-center space-x-2">
              <User size={20} />
              <span>Contact Us</span>
            </a>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                 <Link to="/my-listings" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                  <Building size={20} />
                  <span>My Listings</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-2">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Login</span>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2">
                  <User size={20} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Contact Dialog */}
      <ContactDialog 
        open={isContactDialogOpen} 
        onOpenChange={setIsContactDialogOpen} 
      />
    </>
  );
};

export default Navbar;
