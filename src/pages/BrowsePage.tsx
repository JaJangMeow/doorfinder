
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BrowsePage: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to login page instead of guest browsing
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  );
};

export default BrowsePage;
