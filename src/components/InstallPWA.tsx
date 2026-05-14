import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is already installed/running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
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
      // Fallback instructions for unsupported browsers like iOS Safari
      alert('To install the app, look for the "Add to Home Screen" option in your browser menu. On iOS Safari, tap the Share icon and then "Add to Home Screen".');
    }
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {(deferredPrompt || !isStandalone) && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-md shadow-emerald-500/20 text-white font-semibold transition-all transform hover:scale-105 active:scale-95 z-50 text-xs md:text-sm"
        >
          <Download size={14} className="animate-bounce" />
          <span className="whitespace-nowrap">Install App</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
