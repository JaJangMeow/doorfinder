
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import Button from './Button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

const InstallPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if we recently dismissed the prompt
    const lastDismissed = localStorage.getItem('installPromptDismissed');
    if (lastDismissed) {
      const dismissedTime = parseInt(lastDismissed, 10);
      const oneWeek = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
      if (Date.now() - dismissedTime < oneWeek) {
        setShowPrompt(false);
        return;
      }
    }

    // Prevent the mini-infobar from appearing on mobile
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      
      // Wait a bit before showing the prompt to avoid immediate popup fatigue
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handler as any);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // Show the install prompt
    await installPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setInstallPrompt(null);
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Store a flag in localStorage to prevent showing the prompt again for a while
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-background border border-border rounded-lg shadow-lg p-4 z-40 animate-fade-in">
      <button 
        onClick={dismissPrompt}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
      
      <div className="flex items-start">
        <div className="bg-primary/10 rounded-full p-2 mr-3">
          <Download className="h-6 w-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-foreground">Install DoorFinder</h3>
          <p className="text-sm text-muted-foreground mt-1">Add DoorFinder to your home screen for a better experience.</p>
          
          <div className="mt-3 flex space-x-2">
            <Button 
              size="sm" 
              variant="primary"
              onClick={handleInstall}
              iconLeft={<Download size={16} />}
            >
              Install Now
            </Button>
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={dismissPrompt}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
