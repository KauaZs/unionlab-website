"use client";

import { useEffect, useState } from "react";
import { Coins, ShieldCheck, Sparkles, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface Banner {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  owned: boolean;
  selected: boolean;
}

interface BannerStoreProps {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  } | null;
  onUpdateUser: () => void;
}

export default function BannerStore({ user, onUpdateUser }: BannerStoreProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBanners = () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch("/api/public/banners", { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar banners da loja.");
        return res.json();
      })
      .then((data) => {
        setBanners(data as Banner[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível carregar os banners no momento.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBanners();
  }, [user]);

  const handlePurchase = (bannerId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Você precisa estar logado para comprar banners.");
      return;
    }

    setPurchasingId(bannerId);
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/public/banners/${bannerId}/purchase`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao realizar a compra.");
        }
        return data;
      })
      .then(() => {
        setSuccessMsg("Banner adquirido com sucesso!");
        fetchBanners();
        onUpdateUser();
      })
      .catch((err: any) => {
        setError(err.message || "Erro ao comprar o banner.");
      })
      .finally(() => {
        setPurchasingId(null);
      });
  };

  const handleSelect = (bannerId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setEquippingId(bannerId);
    setError(null);
    setSuccessMsg(null);

    fetch(`/api/public/banners/${bannerId}/select`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erro ao equipar o banner.");
        }
        return data;
      })
      .then(() => {
        setSuccessMsg("Banner equipado com sucesso!");
        fetchBanners();
        onUpdateUser();
      })
      .catch((err: any) => {
        setError(err.message || "Erro ao equipar o banner.");
      })
      .finally(() => {
        setEquippingId(null);
      });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950/20 border border-slate-900 rounded-3xl p-8 relative overflow-hidden">
        <div className="space-y-2 relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Personalização de Perfil
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
            Loja de Banners
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Adquira banners exclusivos para decorar o seu perfil público e mostrar para toda a comunidade! Usuários com assinatura <strong className="text-white font-bold">UNION+</strong> resgatam todos os banners de graça.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-900 rounded-2xl p-5 md:min-w-[200px] justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Seu Saldo</span>
            <div className="flex items-center gap-1.5">
              <Coins className="w-4.5 h-4.5 text-amber-500" />
              <span className="text-xl font-extrabold text-white">
                {user ? user.unicoins.toLocaleString() : 0}
              </span>
            </div>
          </div>
          {!user && (
            <Badge variant="default" className="text-[10px] bg-red-500/10 border-red-500/20 text-red-400">
              Desconectado
            </Badge>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-sm font-medium">
          ⚠️ {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-2xl text-sm font-medium">
          ✅ {successMsg}
        </div>
      )}

      {/* Banners Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 border border-slate-900 rounded-3xl bg-zinc-950/20 text-slate-500 font-medium">
          Nenhum banner cadastrado na loja no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {banners.map((banner) => (
            <Card key={banner.id} className="overflow-hidden border border-slate-900 bg-slate-950/20 flex flex-col justify-between group">
              <div>
                {/* Banner Preview Frame */}
                <div className="relative h-40 overflow-hidden border-b border-slate-900 bg-black">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
                  />
                  {banner.owned && (
                    <Badge className="absolute top-4 right-4 bg-zinc-900 border border-zinc-800 text-white font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Adquirido
                    </Badge>
                  )}
                </div>

                <CardHeader className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-lg font-bold text-white font-sans">
                      {banner.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm font-extrabold text-white shrink-0">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span>{banner.price.toLocaleString()} unicoins</span>
                    </div>
                  </div>
                  <CardDescription className="text-xs text-slate-400 mt-1 font-medium">
                    Preço padrão na loja. Grátis para assinantes UNION+.
                  </CardDescription>
                </CardHeader>
              </div>

              <CardContent className="p-6 pt-0">
                {banner.owned ? (
                  banner.selected ? (
                    <Button
                      variant="outline"
                      className="w-full border-zinc-800 bg-zinc-900 text-white cursor-default flex items-center justify-center gap-2"
                      disabled
                    >
                      <Check className="w-4 h-4 text-white" />
                      <span>Equipado no Perfil</span>
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleSelect(banner.id)}
                      disabled={equippingId === banner.id}
                    >
                      {equippingId === banner.id ? "Equipando..." : "Equipar Banner"}
                    </Button>
                  )
                ) : (
                  <Button
                    variant="premium"
                    className="w-full"
                    onClick={() => handlePurchase(banner.id)}
                    disabled={purchasingId === banner.id || !user}
                  >
                    {purchasingId === banner.id ? "Comprando..." : "Adquirir Banner"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
