
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Search, BookmarkCheck, User, Plus } from "lucide-react";

const TabBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const mainTabs = [
    {
      name: "Home",
      path: "/",
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
  
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-lg z-50">
      {/* Main tabs */}
      <div className="grid grid-cols-5 h-16">
        {mainTabs.map((tab) => (
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
              navigate(tab.path);
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
