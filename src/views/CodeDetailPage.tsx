"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Star, Eye, Calendar, Copy, Lock, ShieldAlert, Trash2, Coins, Code, ExternalLink, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { VIDEO_CODES_MANAGER_ID } from "@/lib/site";

interface CodeDetail {
  id: string;
  title: string;
  description: string;
  authorId: string;
  authorName: string;
  authorAvatar: string | null;
  price: number;
  views: number;
  language: string;
  createdAt: string;
  stars: number;
  hasStarred: boolean;
  hasAccess: boolean;
  code: string;
  isVideo?: boolean;
}

interface CodeDetailPageProps {
  id: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  } | null;
  refreshUser: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "bdscript", label: "BDScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "php", label: "PHP" },
  { value: "typescript", label: "TypeScript" },
  { value: "rust", label: "Rust" },
  { value: "kotlin", label: "Kotlin" },
];

export default function CodeDetailPage({ id, user, refreshUser, showToast }: CodeDetailPageProps) {
  const router = useRouter();
  const [codeData, setCodeData] = useState<CodeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [staring, setStaring] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);

  const fetchCodeDetails = () => {
    const token = localStorage.getItem("token");
    const headers: any = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`/api/public/codes/${id}`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setCodeData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        showToast("Código não encontrado.", "error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCodeDetails();
  }, [id]);

  const handleBuy = async () => {
    if (!user) {
      showToast("Você precisa entrar com o Discord para comprar códigos.", "error");
      return;
    }
    if (user.unicoins < (codeData?.price || 0)) {
      showToast("Você não possui Unicoins suficientes.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setBuying(true);
    try {
      const res = await fetch(`/api/public/codes/${id}/buy`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao comprar código.", "error");
      } else {
        showToast("Código desbloqueado com sucesso!", "success");
        refreshUser();
        fetchCodeDetails();
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao processar compra.", "error");
    } finally {
      setBuying(false);
    }
  };

  const handleStar = async () => {
    if (!user) {
      showToast("Você precisa estar logado para favoritar códigos.", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setStaring(true);
    try {
      const res = await fetch(`/api/public/codes/${id}/star`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setCodeData((prev) =>
          prev
            ? {
                ...prev,
                hasStarred: data.hasStarred,
                stars: data.starsCount,
              }
            : null
        );
        showToast(data.hasStarred ? "Código adicionado aos favoritos!" : "Código removido dos favoritos.", "info");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setStaring(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar permanentemente este snippet de código?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/public/codes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Erro ao deletar código.", "error");
      } else {
        showToast("Código deletado com sucesso.", "success");
        router.push("/codes");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao deletar código.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = () => {
    if (!codeData?.code) return;
    navigator.clipboard.writeText(codeData.code);
    showToast("Código copiado para a área de transferência!", "success");
  };

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.png`;
  };

  const formatLanguage = (lang: string) => {
    const found = LANGUAGES.find((l) => l.value === lang.toLowerCase());
    return found ? found.label : lang;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-900 rounded mx-auto" />
        <div className="h-10 w-80 bg-slate-900 rounded mx-auto" />
        <div className="h-64 w-full bg-slate-900 rounded" />
      </div>
    );
  }

  if (!codeData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-300">Snippet não encontrado</h3>
        <Button onClick={() => router.push("/codes")} variant="outline" className="mt-4 border-slate-900 bg-slate-950/20 hover:bg-slate-900 text-xs">
          Voltar para codes
        </Button>
      </div>
    );
  }

  const isOwner = user && user.id === codeData.authorId;
  const canMarkVideo = user?.id === VIDEO_CODES_MANAGER_ID;

  const toggleVideo = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const next = !codeData.isVideo;
    setSavingVideo(true);
    try {
      const res = await fetch(`/api/public/codes/${codeData.id}/video`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isVideo: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Erro ao atualizar o código.", "error");
        return;
      }
      setCodeData({ ...codeData, isVideo: next });
      showToast(next ? "Marcado como código de vídeo." : "Removido dos códigos de vídeo.", "success");
    } catch {
      showToast("Erro de conexão com o servidor.", "error");
    } finally {
      setSavingVideo(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/codes")}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-350 transition-colors uppercase tracking-wider outline-none select-none"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar para codes
      </button>

      {/* Code Header details */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Badge variant="outline" className="text-[10px] font-bold border-slate-850 bg-slate-900/40 text-slate-400 py-0.5 px-2.5 rounded-full select-none">
              {formatLanguage(codeData.language)}
            </Badge>
            {codeData.isVideo && (
              <span className="flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                <Video className="h-3 w-3" />
                Código de vídeo
              </span>
            )}
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 select-none">
              <Eye className="w-3.5 h-3.5" />
              <span>{codeData.views} views</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 select-none">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(codeData.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {codeData.title}
          </h2>
          <div className="flex items-center gap-2">
            <img
              src={getAvatarUrl(codeData.authorId, codeData.authorAvatar)}
              alt={codeData.authorName}
              className="w-6 h-6 rounded-full border border-slate-900 object-cover"
            />
            <span className="text-xs font-bold text-slate-400">
              Criado por <strong className="text-slate-200">{codeData.authorName}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <Button
            variant="outline"
            disabled={staring}
            onClick={handleStar}
            className={`flex items-center gap-2 h-9 px-4 text-xs font-bold border-slate-900 bg-slate-950/20 hover:bg-slate-900 transition-colors ${
              codeData.hasStarred ? "text-amber-400 border-amber-500/25 bg-amber-550/5" : "text-slate-400"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${codeData.hasStarred ? "fill-amber-550/20 text-amber-500" : ""}`} />
            {codeData.hasStarred ? "Favoritado" : "Favoritar"} ({codeData.stars})
          </Button>

          {canMarkVideo && (
            <Button
              variant="outline"
              disabled={savingVideo}
              onClick={toggleVideo}
              className={`flex items-center gap-2 h-9 px-4 text-xs font-bold transition-colors ${
                codeData.isVideo ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20" : "border-slate-900 bg-slate-950/20 text-slate-400 hover:bg-slate-900"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              {codeData.isVideo ? "Remover de vídeos" : "Marcar como vídeo"}
            </Button>
          )}

          {isOwner && (
            <Button
              variant="outline"
              disabled={deleting}
              onClick={handleDelete}
              className="flex items-center gap-2 h-9 px-4 text-xs font-bold border-red-500/20 bg-red-950/5 hover:bg-red-950/20 text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Deletar
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="bg-slate-900/10 border border-slate-900/60 p-4.5 rounded-2xl text-sm text-slate-350 leading-relaxed font-medium">
        {codeData.description || "Nenhuma descrição detalhada informada para este snippet."}
      </div>

      {/* Code Display Area */}
      <Card className="border border-slate-900 bg-slate-950/20 overflow-hidden">
        {codeData.hasAccess ? (
          <div className="relative">
            {/* Copy button */}
            <div className="absolute top-4 right-4 z-10">
              <Button
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-1.5 h-8 px-3 text-xs font-bold border border-slate-800 bg-slate-950/80 hover:bg-slate-900 text-slate-350 shadow-md backdrop-blur"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar Código
              </Button>
            </div>
            
            {/* Real Code Body */}
            <CardContent className="p-6 pt-14">
              <pre className="text-[11px] font-mono leading-relaxed text-emerald-400 bg-slate-950/40 border border-slate-900/60 p-5 rounded-xl overflow-x-auto whitespace-pre select-all max-h-[500px]">
                <code>{codeData.code}</code>
              </pre>
            </CardContent>
          </div>
        ) : (
          <div className="relative">
            {/* Blurred Mock Code */}
            <div className="p-6 filter blur-sm select-none opacity-20 pointer-events-none font-mono text-[11px] leading-relaxed space-y-2">
              <p>const client = new Discord.Client();</p>
              <p>client.on('messageCreate', async (message) =&gt; &#123;</p>
              <p>  if (message.content === '!ping') &#123;</p>
              <p>    await message.reply('Pong!');</p>
              <p>  &#125;</p>
              <p>&#125;);</p>
              <p>// Hidden premium details here...</p>
              <p>client.login(process.env.DISCORD_TOKEN);</p>
            </div>

            {/* Lock Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 p-6">
              <div className="text-center max-w-sm space-y-4 animate-in zoom-in duration-200">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-white">Snippet Protegido</h4>
                  <p className="text-xs font-semibold text-slate-500">
                    Este snippet é exclusivo e custa <strong className="text-amber-400">{codeData.price} Unicoins</strong> para ser desbloqueado permanentemente.
                  </p>
                </div>
                <Button
                  onClick={handleBuy}
                  disabled={buying}
                  className="flex items-center gap-2 h-10 px-5 text-xs font-black bg-amber-550 hover:bg-amber-600 text-white rounded-xl mx-auto shadow-lg shadow-amber-550/10"
                >
                  <Coins className="w-4 h-4 shrink-0" />
                  {buying ? "Processando..." : `Desbloquear Snippet`}
                </Button>
                {user && (
                  <p className="text-[10px] font-bold text-slate-600">
                    Seu saldo: <strong className="text-slate-400">{user.unicoins} Unicoins</strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Info Callout */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-900 bg-slate-950/10 text-slate-500 text-xs font-semibold">
        <Code className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="block text-slate-350">Como funcionam as compras de códigos?</span>
          <p className="leading-relaxed">
            Códigos adquiridos são vinculados permanentemente à sua conta do Union Lab. Você terá acesso irrestrito para visualizar, copiar e usar as instruções e scripts fornecidos a qualquer momento, sem taxas recorrentes.
          </p>
        </div>
      </div>
    </div>
  );
}
