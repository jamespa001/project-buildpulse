'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      // Check window scroll OR document root element scroll
      const isScrollable =
        document.documentElement.scrollHeight > window.innerHeight;
      const scrolled =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop;
      setIsVisible(scrolled > 20 && isScrollable);
    };

    // Attach listener to window and document
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    // Fallback for container scroll
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50 pointer-events-auto">
      <button
        onClick={scrollToTop}
        type="button"
        aria-label="Back to top"
        className="w-11 h-11 bg-slate-900/90 hover:bg-indigo-600 border border-slate-700/80 hover:border-indigo-400 text-indigo-400 hover:text-white rotate-45 rounded-xl shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
      >
        <ArrowUp className="w-5 h-5 -rotate-45 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </button>
    </div>
  );
}
