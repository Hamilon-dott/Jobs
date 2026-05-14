import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone)) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
    } else {
        alert("To install the app:\n\n• For Android Chrome: Tap the 3-dot menu and select 'Install app' or 'Add to Home screen'.\n• For iOS Safari: Tap the Share button and select 'Add to Home Screen'.");
    }
  };

  if (isStandalone) {
    return null; // Don't render the button if already installed
  }

  return (
    <button
      onClick={handleInstallClick}
      className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 z-50 text-xs md:text-sm"
    >
      <Download size={14} className="animate-bounce" />
      <span className="whitespace-nowrap">Install App</span>
    </button>
  );
}
