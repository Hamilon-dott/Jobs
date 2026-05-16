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
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("To install the app:\n\n• For Android Chrome: Tap the 3-dot menu and select 'Install app' or 'Add to Home screen'.\n• For iOS Safari: Tap the Share button and select 'Add to Home Screen'.");
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <button
      onClick={handleInstallClick}
      className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md text-white transition-all transform hover:scale-105 active:scale-95 z-50"
      aria-label="Install App"
    >
      <Download size={16} />
    </button>
  );
}
