
import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
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

const DownloadAppButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Prevent the mini-infobar from appearing on mobile
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler as any);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler as any);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      // If there's no install prompt event saved, we'll direct users to use browser menu
      // This happens when users have already dismissed the prompt once or on iOS Safari
      alert('To install this app on your device: tap the share button (iOS) or menu button (Android) and select "Add to Home Screen"');
      return;
    }
    
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
  };

  if (isInstalled || !isVisible) return null;

  return (
    <Button
      variant="success"
      size="md"
      fullWidth
      onClick={handleInstall}
      iconLeft={<Download size={18} />}
      className="shadow-md"
    >
      Install DoorFinder App
    </Button>
  );
};

export default DownloadAppButton;
