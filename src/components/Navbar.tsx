import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, Menu } from "lucide-react";
import SearchBar from "./SearchBar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const isSearchPage = location.pathname === "/search";
  
  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Browse Listings", path: "/search" },
    user ? { label: "My Listings", path: "/my-listings" } : null,
    user ? { label: "Saved Properties", path: "/saved" } : null,
    user ? { label: "Profile", path: "/profile" } : null,
    !user ? { label: "Login", path: "/login" } : null,
    !user ? { label: "Register", path: "/register" } : null,
  ].filter(Boolean);

  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                DoorFinder
              </span>
            </Link>

            <div className="hidden md:flex gap-4">
              <Link
                to="/search"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Browse
              </Link>
              {user && (
                <Link
                  to="/my-listings"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  My Listings
                </Link>
              )}
              {user && (
                <Link
                  to="/saved"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Saved
                </Link>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {isSearchPage && (
              <div className="hidden md:block">
                <SearchBar />
              </div>
            )}

            <Link to="/post">
              <Button variant="default" size="sm" className="hidden md:flex">
                <PlusCircle className="h-4 w-4 mr-2" />
                List Property
              </Button>
            </Link>

            {user ? (
              <div className="hidden md:block">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-4">
                  {menuItems.map(
                    (item) =>
                      item && (
                        <SheetClose asChild key={item.path}>
                          <Link
                            to={item.path}
                            className="text-lg hover:text-primary transition-colors"
                          >
                            {item.label}
                          </Link>
                        </SheetClose>
                      )
                  )}
                  {user && (
                    <Button variant="ghost" onClick={handleLogout}>
                      Logout
                    </Button>
                  )}
                  <SheetClose asChild>
                    <Link to="/post">
                      <Button className="w-full mt-2">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        List Property
                      </Button>
                    </Link>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {isSearchPage && (
          <div className="py-3 md:hidden">
            <SearchBar />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
