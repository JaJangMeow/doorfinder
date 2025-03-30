import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Search, BookmarkCheck, Plus, User } from "lucide-react";

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
      special: true,
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
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-lg z-50 safe-area-bottom">
      {/* Main tabs */}
      <div className="grid grid-cols-5 h-16">
        {mainTabs.map((tab) => (
          <button
            key={tab.name}
            className={cn(
              "flex flex-col items-center justify-center text-xs transition-all duration-300",
              "relative overflow-hidden cursor-pointer hover:text-primary",
              tab.special ? "group" : "",
              location.pathname === tab.path
                ? "text-primary"
                : "text-muted-foreground"
            )}
            onClick={() => {
              navigate(tab.path);
              // Add haptic feedback if available
              if ('vibrate' in navigator) {
                navigator.vibrate(5);
              }
            }}
          >
            <div className={cn(
              "transition-all duration-300 flex items-center justify-center",
              location.pathname === tab.path ? "scale-110" : "scale-100"
            )}>
              {tab.special ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary rounded-full opacity-10 scale-150 animate-pulse-subtle"></div>
                  <div className="relative bg-primary text-primary-foreground p-1 rounded-full transform transition-transform group-hover:scale-110 group-active:scale-95">
                    {tab.icon}
                  </div>
                </div>
              ) : (
                tab.icon
              )}
            </div>
            <span className={cn(
              "mt-1 transition-all",
              location.pathname === tab.path ? "font-medium" : ""
            )}>
              {tab.name}
            </span>
            
            {location.pathname === tab.path && (
              <span className="absolute bottom-0 left-1/2 w-1.5 h-1.5 bg-primary rounded-full transform -translate-x-1/2 animate-fade-in" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
