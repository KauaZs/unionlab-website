"use client";

import { useState, useEffect } from "react";
import { Compass, Trophy, HelpCircle, LogIn, Coins, ShoppingBag, Crown, Megaphone, Bell, Trash2, Bot, Menu } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  } | null;
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenMobileMenu: () => void;
}

const parseMarkdown = (text: string) => {
  if (!text) return "";
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-extrabold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function Header({ user, currentPath, onNavigate, onOpenMobileMenu }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/public/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/public/notifications/read", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      })
      .catch((err) => console.error(err));
  };

  const handleClearAll = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/public/notifications/clear", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setNotifications([]);
      })
      .catch((err) => console.error(err));
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      handleMarkAsRead();
    }
  };

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.png`;
  };

  const isTabActive = (tab: string) => {
    if (tab === "home") return currentPath === "#/" || currentPath === "";
    return currentPath === `#/${tab}`;
  };

  return (
    <header className="sticky top-0 z-50 h-20 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12">
      <div 
        className="flex items-center gap-2.5 cursor-pointer select-none group"
        onClick={() => onNavigate("#/")}
      >
        <img 
          src="/unionlab.png" 
          alt="Union Lab Logo" 
          className="h-10 w-10 object-contain rounded-xl border border-slate-900 shadow-md transition-all duration-300 group-hover:scale-105"
        />
        <span className="font-extrabold text-lg tracking-tight text-white font-sans hidden sm:block">
          unionlab
        </span>
      </div>
      
      {/* Navigation tabs */}
      <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/40 p-1 rounded-xl border border-slate-900/80">
        <button
          onClick={() => onNavigate("#/")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isTabActive("home")
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Compass className="w-4 h-4" />
          Explorar
        </button>
        <button
          onClick={() => onNavigate("#/rankings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isTabActive("rankings")
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Trophy className="w-4 h-4" />
          Rankings
        </button>
        <button
          onClick={() => onNavigate("#/store")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isTabActive("store")
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Loja
        </button>
        <button
          onClick={() => onNavigate("#/vip")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isTabActive("vip")
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Crown className="w-4 h-4" />
          VIP
        </button>
        <button
          onClick={() => onNavigate("#/outdoor")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isTabActive("outdoor")
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Outdoor
        </button>
        <button
          onClick={() => onNavigate("#/addbot")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isTabActive("addbot")
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <Bot className="w-4 h-4" />
          Add Bot
        </button>
        <button
          onClick={() => onNavigate("#/help")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            isTabActive("help")
              ? "bg-white text-black shadow-md shadow-white/5"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Ajuda & FAQ
        </button>
      </nav>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="relative p-2.5 rounded-xl border border-slate-900 bg-slate-900/60 hover:bg-slate-900/90 text-slate-400 hover:text-white transition-all duration-200"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-slate-950">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2.5 w-[calc(100vw-3rem)] sm:w-80 max-h-96 overflow-y-auto bg-slate-950 border border-slate-900 rounded-2xl p-4 shadow-2xl space-y-4 z-50 text-left">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-black text-white">Notificações</span>
                    {notifications.length > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-[10px] font-bold text-red-500 hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Limpar Tudo
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                        Nenhuma notificação por aqui.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 rounded-xl border border-slate-900/60 text-xs relative overflow-hidden transition-all duration-200 ${
                            n.read ? "bg-slate-950/20 text-slate-400" : "bg-slate-900/30 text-white"
                          }`}
                          style={{
                            borderLeft: `3px solid ${
                              n.type === "success"
                                ? "#10B981"
                                : n.type === "error"
                                ? "#EF4444"
                                : n.type === "warning"
                                ? "#F59E0B"
                                : "#3B82F6"
                            }`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-1.5 mb-1">
                            <span className="font-extrabold text-[11px] uppercase tracking-wider">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] leading-relaxed font-medium">
                            {parseMarkdown(n.message)}
                          </p>
                          <span className="block text-[8px] text-slate-500 font-bold mt-1.5">
                            {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div 
              onClick={() => onNavigate("#/profile")}
              className="hidden sm:flex items-center gap-2 bg-slate-900/60 border border-slate-900 hover:border-slate-800 rounded-xl px-3.5 py-1.5 cursor-pointer select-none transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-slate-200">
                <span className="text-white font-extrabold">{user.unicoins}</span>
              </span>
            </div>
            <img
              className="w-10 h-10 rounded-full border-2 border-zinc-700 hover:border-zinc-400 shadow-md shadow-white/5 hover:scale-105 cursor-pointer transition-all duration-300 object-cover"
              src={getAvatarUrl(user.id, user.avatar)}
              alt={user.username}
              onClick={() => onNavigate("#/profile")}
            />
          </div>
        ) : (
          <Button 
            variant="premium" 
            onClick={() => {
              localStorage.setItem("redirect_target", window.location.hash);
              window.location.href = "/api/auth/login";
            }}
            className="flex items-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </Button>
        )}
        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2.5 rounded-xl border border-slate-900 bg-slate-900/60 hover:bg-slate-900/90 text-slate-400 hover:text-white transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
