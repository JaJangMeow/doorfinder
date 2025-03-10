
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Search, Heart, User } from "lucide-react";

const TabBar: React.FC = () => {
  const location = useLocation();

  const tabs = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Search",
      path: "/search",
      icon: Search,
    },
    {
      name: "Saved",
      path: "/saved",
      icon: Heart,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: User,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            className={cn(
              "flex flex-col items-center justify-center py-2 px-4 w-full transition-colors",
              location.pathname === tab.path
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{tab.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TabBar;
