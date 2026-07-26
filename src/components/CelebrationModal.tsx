"use client";

import { useEffect } from "react";
import { Flame, X, Sparkles, Coins } from "lucide-react";
import { Button } from "./ui/button";

interface CelebrationModalProps {
  isOpen: boolean;
  title: string;
  subtitle: string;
  rewardText: string;
  streakText?: string;
  onClose: () => void;
}

export default function CelebrationModal({
  isOpen,
  title,
  subtitle,
  rewardText,
  streakText,
  onClose,
}: CelebrationModalProps) {
  // Prevent body scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Clean Markdown ** and Discord custom emojis from streak text
  const cleanStreak = (text?: string) => {
    if (!text) return "";
    let cleaned = text.replace(/<a?:[a-zA-Z0-9_]+:\d+>/g, "");
    cleaned = cleaned.replace(/\[\s*\]/g, "");
    cleaned = cleaned.replace(/\*\*/g, "");
    return cleaned.trim();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Floating Sparkles Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400 rounded-full animate-ping opacity-60" style={{ animationDelay: "0.2s" }} />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-amber-500 rounded-full animate-ping opacity-40" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping opacity-80" style={{ animationDelay: "0.8s" }} />
        <div className="absolute bottom-1/3 right-1/3 w-2.5 h-2.5 bg-orange-400 rounded-full animate-ping opacity-50" style={{ animationDelay: "1.1s" }} />
      </div>

      {/* Modal Card Container */}
      <div className="relative w-full max-w-sm bg-zinc-950 border border-slate-900 rounded-3xl p-6 shadow-3xl text-center space-y-6 transform scale-100 transition-all duration-300 animate-in zoom-in-95">
        
        {/* Rotating Glow Ring Behind Icon */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-300 animate-spin opacity-20 blur-md" style={{ animationDuration: "6s" }} />
          <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-slate-800 flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            {title}
          </h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Reward Showcase */}
        <div className="bg-zinc-900/60 border border-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1 shadow-inner relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Recompensa Resgatada</span>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500 animate-bounce" />
            <span className="text-xl font-extrabold text-white tracking-tight">{rewardText}</span>
          </div>
        </div>

        {/* Streak Details (Optional) */}
        {streakText && (
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-orange-400 bg-orange-950/20 border border-orange-500/10 rounded-xl py-2.5 px-4 animate-in slide-in-from-bottom-2">
            <Flame className="w-4 h-4 fill-orange-500/20 animate-pulse shrink-0" />
            <span className="leading-tight">{cleanStreak(streakText)}</span>
          </div>
        )}

        {/* Button */}
        <div className="pt-2">
          <Button 
            onClick={onClose} 
            variant="premium" 
            className="w-full h-11 font-extrabold text-xs tracking-wider rounded-xl uppercase shadow-md shadow-amber-500/5 active:scale-[0.98] transition-transform duration-100"
          >
            Incrível! 🚀
          </Button>
        </div>

        {/* Close Icon Top Right */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-900/50 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
}
