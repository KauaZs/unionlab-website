"use client";

import { useEffect, useState } from "react";
import { Coins, Sparkles, Check, Crown, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface VipStatus {
  active: boolean;
  vipType?: number; // 0 for VIP, 1 for UNION+
  expiresAt?: number;
  purchasedAt?: number;
}

interface VipPageProps {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  } | null;
  onUpdateUser: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function VipPage({ user, onUpdateUser, showToast }: VipPageProps) {
  const [status, setStatus] = useState<VipStatus>({ active: false });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const fetchVipStatus = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/public/vip/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setStatus(data as VipStatus);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVipStatus();
  }, [user]);

  const handleBuyVip = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Você precisa estar logado para comprar VIP.", "error");
      return;
    }

    setPurchasing(true);
    fetch("/api/public/vip/purchase", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao realizar a compra.");
        return data;
      })
      .then(() => {
        showToast("Assinatura VIP adquirida com sucesso! Divirta-se!", "success");
        fetchVipStatus();
        onUpdateUser();
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao comprar VIP.", "error");
      })
      .finally(() => {
        setPurchasing(false);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950/20 border border-slate-900 rounded-3xl p-8 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-4 h-4 text-yellow-500" />
            Benefícios Premium
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Área VIP & UNION+
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Destaque-se no site e no servidor com multiplicador de votos, maior limite de bots cadastrados, redução drástica de cooldowns e muito mais.
          </p>
        </div>

        {user && status.active && (
          <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:min-w-[240px]">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sua Assinatura</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="default" className={status.vipType === 1 ? "bg-amber-500/10 border-amber-500/20 text-amber-400 font-extrabold" : "bg-white text-black font-extrabold"}>
                  {status.vipType === 1 ? "UNION+" : "VIP"}
                </Badge>
              </div>
              {status.expiresAt && (
                <span className="text-[10px] text-slate-400 block font-medium">
                  Expira em: {new Date(status.expiresAt).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Plans Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Card 1: VIP */}
        <Card className="border border-slate-900 bg-slate-950/20 flex flex-col justify-between overflow-hidden relative">
          <div>
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-center">
                <Badge variant="default" className="bg-white text-black font-bold uppercase tracking-wider text-[10px]">
                  Mais Acessível
                </Badge>
                <div className="flex items-center gap-1 text-sm font-extrabold text-white">
                  <Coins className="w-4.5 h-4.5 text-amber-500" />
                  <span>1.200 unicoins / mês</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-black text-white font-sans mt-4">
                Assinatura VIP
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 font-medium">
                Compre diretamente usando seus Unicoins ganhos avaliando e votando em bots!
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4 space-y-4">
              <span className="text-xs font-bold text-slate-200 block">O que você recebe:</span>
              <div className="space-y-3.5">
                {[
                  "Voto duplicado (seu voto vale por 2) ✅",
                  "Cooldown de voto reduzido para 5 horas ⏱️",
                  "Desconto de 10% na compra de códigos 🏷️",
                  "Limite de até 2 bots cadastrados no site 🤖",
                  "Cooldown de reputação reduzido para 5 horas ❤️",
                  "Cargo EXCLUSIVO VIP no servidor do Discord 🏅",
                ].map((perk, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-semibold leading-relaxed">
                    <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>

          <CardContent className="p-8 pt-0">
            {status.active ? (
              <Button
                variant="outline"
                className="w-full h-11 border-zinc-800 bg-zinc-900 text-white cursor-default flex items-center justify-center gap-2"
                disabled
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Assinatura Ativa</span>
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full h-11 text-xs font-bold"
                onClick={handleBuyVip}
                disabled={purchasing || !user || user.unicoins < 1200}
              >
                {purchasing ? "Processando..." : user && user.unicoins < 1200 ? "Unicoins Insuficientes" : "Adquirir VIP"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Card 2: UNION+ */}
        <Card className="border border-slate-900 bg-slate-950/20 flex flex-col justify-between overflow-hidden relative">
          {/* Subtle gradient border to show it is premium */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500"></div>
          
          <div>
            <CardHeader className="p-8 pb-4">
              <div className="flex justify-between items-center">
                <Badge variant="default" className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Premium Máximo
                </Badge>
                <div className="text-sm font-extrabold text-white">
                  <span>R$ 15,00 / ano</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-black text-white font-sans mt-4">
                Assinatura UNION+
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 font-medium">
                Desbloqueie o máximo poder de customização e benefícios premium!
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 pt-4 space-y-4">
              <span className="text-xs font-bold text-slate-200 block">Todos os benefícios VIP mais:</span>
              <div className="space-y-3.5">
                {[
                  "+1.000 unicoins imediatamente após a compra 🪙",
                  "Voto triplicado (seu voto vale por 3) ✅",
                  "Cooldown de voto reduzido para 4 horas ⏱️",
                  "Desconto de 100% na compra de códigos (Códigos Grátis!) 🏷️",
                  "Limite de até 3 bots cadastrados no site 🤖",
                  "Cooldown de reputação reduzido para 4 horas ❤️",
                  "Acesso ao comando u.mute no Discord (temp max 5 min) 🤫",
                  "Permissão para ativar eventos especiais 🚀",
                  "Todos os Banners da Loja totalmente GRATUITOS 🖼️",
                  "Cargo Exclusivo UNION+ e cores personalizadas 🏅",
                ].map((perk, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-semibold leading-relaxed">
                    <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>

          <CardContent className="p-8 pt-0">
            {status.active && status.vipType === 1 ? (
              <Button
                variant="outline"
                className="w-full h-11 border-zinc-800 bg-zinc-900 text-white cursor-default flex items-center justify-center gap-2"
                disabled
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Assinatura Ativa</span>
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  variant="premium"
                  className="w-full h-11 text-xs font-bold"
                  disabled
                >
                  Adquirir UNION+
                </Button>
                <span className="text-[10px] text-slate-500 text-center block font-medium">
                  Adquira digitando <code className="text-slate-400 font-bold bg-slate-900 px-1 py-0.5 rounded font-mono">/vip</code> no servidor do Discord!
                </span>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
