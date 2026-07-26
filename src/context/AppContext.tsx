"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Header from "@/components/Header";
import CelebrationModal from "@/components/CelebrationModal";
import { Compass, Trophy, ShoppingBag, Crown, Megaphone, Bot, HelpCircle, X, Coins } from "lucide-react";

interface User {
  id: string;
  username: string;
  avatar: string | null;
  unicoins: number;
  cooldowns?: {
    voteBot?: number;
    rep?: number;
  };
}

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface CelebrationData {
  isOpen: boolean;
  title: string;
  subtitle: string;
  rewardText: string;
  streakText?: string;
}

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  authToken: string | null;
  setAuthToken: (token: string | null) => void;
  refreshUser: () => void;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  showCelebration: (title: string, subtitle: string, rewardText: string, streakText?: string) => void;
  recaptchaSiteKey: string | null;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Celebration Modal State
  const [celebration, setCelebration] = useState<CelebrationData | null>(null);

  const showCelebration = (title: string, subtitle: string, rewardText: string, streakText?: string) => {
    setCelebration({
      isOpen: true,
      title,
      subtitle,
      rewardText,
      streakText,
    });
  };

  // Toast notifications state
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const setAuthToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("token", token);
      setAuthTokenState(token);
    } else {
      localStorage.removeItem("token");
      setAuthTokenState(null);
      setUser(null);
    }
  };

  const refreshUser = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data as User);
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("token");
        setAuthTokenState(null);
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthTokenState(token);
    }

    const defaultKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    if (defaultKey) {
      setRecaptchaSiteKey(defaultKey);
    }

    fetch("/api/public/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.recaptchaSiteKey) {
          setRecaptchaSiteKey(data.recaptchaSiteKey);
        }
      })
      .catch((err) => console.error("Error loading config:", err));
  }, []);

  useEffect(() => {
    refreshUser();
  }, [authToken]);

  const handleNavigate = (path: string) => {
    // Normalize path from old hash format if passed
    let cleanPath = path;
    if (cleanPath.startsWith("#/")) {
      cleanPath = cleanPath.replace("#/", "/");
    }
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }
    router.push(cleanPath);
    setIsMobileMenuOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        authToken,
        setAuthToken,
        refreshUser,
        showToast,
        showCelebration,
        recaptchaSiteKey,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
      }}
    >
      <div className="app-container">
        {/* Background Floating Glows */}
        <div className="bg-ambient-glow"></div>
        <div className="bg-ambient-glow blue"></div>

        {/* HEADER */}
        <Header
          user={user}
          currentPath={pathname || "/"}
          onNavigate={handleNavigate}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* MAIN CONTAINER */}
        <main>{children}</main>

        {/* TOAST NOTIFICATIONS */}
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
                t.type === "success"
                  ? "bg-zinc-900/95 border-emerald-500/20 text-emerald-400"
                  : t.type === "error"
                  ? "bg-zinc-900/95 border-red-500/20 text-red-400"
                  : "bg-zinc-900/95 border-zinc-800 text-zinc-300"
              }`}
            >
              <span className="text-sm">
                {t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}
              </span>
              <p className="text-xs font-bold leading-normal">{t.message}</p>
            </div>
          ))}
        </div>

        {/* CELEBRATION MODAL */}
        {celebration && (
          <CelebrationModal
            isOpen={celebration.isOpen}
            title={celebration.title}
            subtitle={celebration.subtitle}
            rewardText={celebration.rewardText}
            streakText={celebration.streakText}
            onClose={() => setCelebration(null)}
          />
        )}

        {/* MOBILE MENU DRAWER */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="mobile-drawer-backdrop lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer Panel */}
            <div className="mobile-drawer p-6 space-y-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200 lg:hidden">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                  <span className="font-extrabold text-white text-base">Menu</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Profile Card (Mobile Only) */}
                {user && (
                  <div
                    onClick={() => {
                      handleNavigate("/profile");
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between bg-slate-900/40 border border-slate-900/80 rounded-2xl p-4 cursor-pointer hover:border-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        className="w-9 h-9 rounded-full border border-slate-850"
                        src={
                          user.avatar
                            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
                            : "https://cdn.discordapp.com/embed/avatars/0.png"
                        }
                        alt={user.username}
                      />
                      <div className="text-left">
                        <p className="text-xs font-black text-white leading-none mb-0.5">{user.username}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Perfil</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-2.5 py-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs font-black text-white">{user.unicoins}</span>
                    </div>
                  </div>
                )}

                {/* Navigation items */}
                <nav className="flex flex-col gap-2">
                  {[
                    { id: "home", label: "Explorar", icon: Compass, path: "/" },
                    { id: "rankings", label: "Rankings", icon: Trophy, path: "/rankings" },
                    { id: "store", label: "Loja", icon: ShoppingBag, path: "/store" },
                    { id: "vip", label: "VIP", icon: Crown, path: "/vip" },
                    { id: "outdoor", label: "Outdoor", icon: Megaphone, path: "/outdoor" },
                    { id: "addbot", label: "Add Bot", icon: Bot, path: "/addbot" },
                    { id: "help", label: "Ajuda & FAQ", icon: HelpCircle, path: "/help" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = item.path === "/" ? pathname === "/" : (pathname || "").startsWith(item.path);
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left ${
                          active
                            ? "bg-white text-black font-extrabold"
                            : "text-slate-400 hover:text-white hover:bg-slate-900/30"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-900 pt-4 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Union Lab v2</span>
              </div>
            </div>
          </>
        )}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
