"use client";

import { useEffect, useState } from "react";
import { Search, Star, Plus, Eye, Calendar, Code, X, ChevronRight, Lock, DollarSign, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface CodeSnippet {
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
}

interface CodesPageProps {
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

export default function CodesPage({ user, refreshUser, showToast }: CodesPageProps) {
  const [codes, setCodes] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  // Publish Modal States
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");
  const [publishDescription, setPublishDescription] = useState("");
  const [publishLanguage, setPublishLanguage] = useState("javascript");
  const [publishPrice, setPublishPrice] = useState<number>(0);
  const [publishCode, setPublishCode] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const fetchCodes = () => {
    setLoading(true);
    let url = "/api/public/codes";
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (languageFilter) params.append("language", languageFilter);
    if (params.toString()) url += `?${params.toString()}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCodes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchCodes();
    }, 300);
    return () => clearTimeout(handler);
  }, [search, languageFilter]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTitle.trim()) {
      showToast("Título é obrigatório.", "error");
      return;
    }
    if (!publishDescription.trim()) {
      showToast("Descrição é obrigatória.", "error");
      return;
    }
    if (publishDescription.length > 500) {
      showToast("A descrição não pode exceder 500 caracteres.", "error");
      return;
    }
    if (!publishCode.trim()) {
      showToast("O código não pode estar vazio.", "error");
      return;
    }
    if (publishPrice < 0) {
      showToast("O preço deve ser maior ou igual a zero.", "error");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Você precisa estar logado para publicar um código.", "error");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/public/codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: publishTitle,
          description: publishDescription,
          code: publishCode,
          price: publishPrice,
          language: publishLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao publicar código.", "error");
      } else {
        showToast("Código publicado com sucesso!", "success");
        setIsPublishModalOpen(false);
        setPublishTitle("");
        setPublishDescription("");
        setPublishCode("");
        setPublishPrice(0);
        setPublishLanguage("javascript");
        fetchCodes();
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de conexão com o servidor.", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.png`;
  };

  const formatLanguage = (lang: string) => {
    const found = LANGUAGES.find((l) => l.value === lang.toLowerCase());
    return found ? found.label : lang;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-900">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full">
              codes
            </span>
          </div>
          <h2 className="text-3xl font-black text-white font-sans tracking-tight">
            Snippets da Comunidade
          </h2>
          <p className="text-sm text-slate-400 font-medium max-w-2xl">
            Explore, compre ou compartilhe trechos de código úteis criados pelos membros do Union Lab. Use seus Unicoins para desbloquear códigos exclusivos.
          </p>
        </div>

        {user && (
          <Button
            onClick={() => setIsPublishModalOpen(true)}
            className="flex items-center gap-2 h-11 px-5 text-sm font-bold bg-amber-550 hover:bg-amber-600 text-white rounded-xl transition-all shadow-lg shadow-amber-550/10 shrink-0 self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            Publicar Snippet
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar snippets por título..."
            className="w-full h-11 bg-slate-900/40 border border-slate-900/80 rounded-xl pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-800 transition-all font-medium"
          />
        </div>
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          className="h-11 w-full sm:w-48 bg-slate-900/40 border border-slate-900/80 rounded-xl px-4 text-sm text-slate-300 outline-none focus:border-slate-800 transition-all font-medium cursor-pointer"
        >
          <option value="" className="bg-slate-950 text-slate-300">Todas Linguagens</option>
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-slate-950 text-slate-300">
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Snippet Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 w-full bg-slate-950/20 border border-slate-900/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-16 bg-slate-950/5 border border-slate-900 rounded-2xl">
          <Terminal className="w-12 h-12 text-slate-700 mx-auto mb-4" />
          <h3 className="font-bold text-lg text-slate-400">Nenhum snippet encontrado</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-sm mx-auto font-medium">
            Tente mudar sua pesquisa ou filtros para encontrar o trecho de código que procura.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {codes.map((snippet) => (
            <Card
              key={snippet.id}
              onClick={() => window.location.href = `/codes/${snippet.id}`}
              className="border border-slate-900 bg-slate-950/20 hover:bg-slate-950/40 hover:border-slate-800 transition-all duration-300 rounded-2xl cursor-pointer group flex flex-col justify-between h-full select-none"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-bold border-slate-850 bg-slate-900/40 text-slate-400 py-0.5 px-2.5 rounded-full select-none">
                    {formatLanguage(snippet.language)}
                  </Badge>
                  <div className="flex items-center gap-1 text-slate-500 font-bold text-xs select-none">
                    <Star className="w-3.5 h-3.5 fill-amber-500/10 text-amber-500/70" />
                    <span>{snippet.stars}</span>
                  </div>
                </div>
                <CardTitle className="text-base font-extrabold text-slate-200 group-hover:text-white transition-colors line-clamp-1">
                  {snippet.title}
                </CardTitle>
                <p className="text-xs text-slate-400 font-medium line-clamp-2 mt-1.5 leading-relaxed">{snippet.description || "Nenhuma descrição informada."}</p>
              </CardHeader>

              <CardContent className="p-5 pt-0 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src={getAvatarUrl(snippet.authorId, snippet.authorAvatar)}
                    alt={snippet.authorName}
                    className="w-7 h-7 rounded-full border border-slate-900 object-cover"
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-350">{snippet.authorName}</span>
                    <span className="text-[9px] font-mono text-slate-600 font-bold select-all">{snippet.authorId}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                  <div className="flex items-center gap-1.5">
                    {snippet.price <= 0 ? (
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                        Gratuito
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        <span>{snippet.price} Unicoins</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1 shrink-0">
                      <Eye className="w-3.5 h-3.5 text-slate-600" />
                      {snippet.views}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-600" />
                      {new Date(snippet.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Publish Code Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-900 bg-slate-950 p-6 shadow-2xl flex flex-col space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-400" />
                Publicar Novo Snippet (codes)
              </h3>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePublish} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Título do Snippet</label>
                <input
                  type="text"
                  required
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  maxLength={50}
                  placeholder="Ex: Sistema de Anti-Invite para Discord.js"
                  className="w-full text-sm bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 focus:border-slate-800 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição do Snippet</label>
                <textarea
                  required
                  value={publishDescription}
                  onChange={(e) => setPublishDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Ex: Um script simples em JavaScript para impedir que usuários divulguem outros servidores do Discord no chat."
                  className="min-h-[80px] w-full text-xs bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-slate-350 placeholder-slate-650 focus:border-slate-800 outline-none transition-all resize-y font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Linguagem</label>
                  <select
                    value={publishLanguage}
                    onChange={(e) => setPublishLanguage(e.target.value)}
                    className="w-full text-sm bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-slate-300 outline-none focus:border-slate-800 transition-all font-medium cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value} className="bg-slate-950 text-slate-350">
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Preço (Unicoins)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(parseInt(e.target.value) || 0)}
                    placeholder="0 para Gratuito"
                    className="w-full text-sm bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-650 focus:border-slate-800 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Código</label>
                <textarea
                  required
                  value={publishCode}
                  onChange={(e) => setPublishCode(e.target.value)}
                  maxLength={20000}
                  placeholder="Escreva ou cole seu snippet de código aqui..."
                  className="min-h-[400px] text-xs bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-slate-350 placeholder-slate-650 focus:border-slate-800 outline-none transition-all font-mono whitespace-pre resize-y"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 border-t border-slate-900 pt-3.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPublishModalOpen(false)}
                  disabled={isPublishing}
                  className="h-9 px-4 border-slate-850 text-xs font-bold"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPublishing}
                  className="h-9 px-5 text-xs font-bold bg-amber-550 hover:bg-amber-600 text-white rounded-xl"
                >
                  {isPublishing ? "Publicando..." : "Publicar Código"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
