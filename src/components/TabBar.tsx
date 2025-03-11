
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Search, BookmarkCheck, User, Plus, Info, HelpCircle, Phone, Settings } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const mainTabs = [
    {
      name: "Home",
      path: "/home",
      icon: <Home size={20} />,
    },
    {
      name: "Search",
      path: "/search",
      icon: <Search size={20} />,
    },
    {
      name: "Post",
      path: "/post",
      icon: <Plus size={20} />,
    },
    {
      name: "Saved",
      path: "/saved",
      icon: <BookmarkCheck size={20} />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User size={20} />,
    },
  ];
  
  // Info dialogs
  const infoDialogs = [
    {
      name: "About Us",
      icon: <Info size={20} />,
      title: "About Us",
      description: "We literally made this in a day for the Arcade Tank. Imagine what more we could do with this and what it could be! Imagine this being used by everyone—not just students—for searching new places. It would be so much simpler."
    },
    {
      name: "How It Works",
      icon: <Settings size={20} />,
      title: "How It Works",
      description: "DoorFinder helps students find housing near their colleges. Browse listings, filter by price and amenities, save favorites, and contact owners directly. Property owners can post their listings and manage inquiries."
    },
    {
      name: "Help Center",
      icon: <HelpCircle size={20} />,
      title: "Help Center",
      description: "C'mon, it's super basic and so simple—help yourself hehe."
    },
    {
      name: "Contact Us",
      icon: <Phone size={20} />,
      title: "Contact Us",
      description: "24mscs10@kristujayanti.com, joelkizyking@gmail.com, Instagram: mew_chew_"
    },
  ];
  
  // Toggle sub-menu
  const [showInfoTabs, setShowInfoTabs] = useState(false);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-lg z-50">
      {/* Info tabs (secondary navigation) */}
      {showInfoTabs && (
        <div className="grid grid-cols-4 h-16 border-b border-border">
          {infoDialogs.map((dialog) => (
            <Dialog key={dialog.name}>
              <DialogTrigger asChild>
                <button
                  className="flex flex-col items-center justify-center text-xs p-1
                             cursor-pointer hover:text-primary text-muted-foreground"
                >
                  {dialog.icon}
                  <span className="mt-1 text-[10px]">{dialog.name}</span>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{dialog.title}</DialogTitle>
                  <DialogDescription>
                    {dialog.description}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
      
      {/* Main tabs */}
      <div className="grid grid-cols-5 h-16">
        {mainTabs.map((tab, index) => (
          <button
            key={tab.name}
            className={cn(
              "flex flex-col items-center justify-center text-xs transition-colors",
              "cursor-pointer hover:text-primary",
              location.pathname === tab.path
                ? "text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => {
              // Toggle info tabs if we're already on this tab
              if (location.pathname === tab.path && index !== 2) { // Don't toggle for Post button
                setShowInfoTabs(!showInfoTabs);
              } else {
                // Navigate to the tab
                navigate(tab.path);
                setShowInfoTabs(false);
              }
            }}
          >
            {tab.icon}
            <span className="mt-1">{tab.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
