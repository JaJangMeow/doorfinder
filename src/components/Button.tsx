import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "success" | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  animated?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      iconLeft,
      iconRight,
      fullWidth = false,
      animated = true,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);
    
    const variants = {
      primary:
        "bg-primary text-primary-foreground shadow hover:opacity-90 active:opacity-100",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/90",
      outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost:
        "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      success: "bg-green-500 text-white shadow hover:opacity-90 active:opacity-100",
      destructive: "bg-destructive text-destructive-foreground shadow hover:opacity-90 active:opacity-100"
    };

    const sizes = {
      xs: "h-8 rounded-md px-2 text-xs",
      sm: "h-9 rounded-md px-3 text-xs",
      md: "h-10 rounded-md px-4 py-2",
      lg: "h-12 rounded-md px-6",
      xl: "h-14 rounded-md px-8 text-lg"
    };
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
      
      if (onClick) {
        onClick(e);
      }
    };
    
    const handleTouchStart = () => {
      setIsPressed(true);
    };
    
    const handleTouchEnd = () => {
      setIsPressed(false);
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-feedback",
          variants[variant],
          sizes[size],
          animated && "active:scale-[0.98]",
          isPressed && animated && "scale-[0.98]",
          fullWidth ? "w-full" : "",
          className
        )}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 relative">
              <div className="absolute inset-0 rounded-full border-2 border-current opacity-20"></div>
              <div className="absolute inset-0 rounded-full border-2 border-current border-r-transparent animate-spin"></div>
            </div>
          </div>
        )}
        <span 
          className={cn(
            loading ? "invisible" : "flex items-center gap-2",
            "transform transition-transform"
          )}
        >
          {iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>}
          {children}
          {iconRight && <span className="inline-flex shrink-0 ml-1">{iconRight}</span>}
        </span>
        
        {/* Ripple effect for touch feedback */}
        <span className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
          <span className={cn(
            "absolute inset-0 rounded-md bg-current opacity-0 transition-opacity",
            isPressed && "animate-ripple opacity-10"
          )}></span>
        </span>
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
