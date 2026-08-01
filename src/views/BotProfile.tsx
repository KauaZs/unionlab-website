"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, ShieldAlert, ExternalLink, Calendar, Star, Info, User, Trash2, Settings, X, Plus, Terminal, History, Pencil } from "lucide-react";
import Stars from "../components/Stars";
import ReCaptcha from "../components/ReCaptcha";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

interface BotCommand {
  name: string;
  description: string;
  usage?: string;
  type: "slash" | "prefix";
}

interface BotChangelog {
  version: string;
  title: string;
  content: string;
  date: string;
}

interface Bot {
  id: string;
  username: string;
  avatar: string | null;
  prefix: string;
  language: string;
  description: string;
  votes: number;
  rating?: number;
  feedbackCount?: number;
  ownerId?: string;
  ownerName?: string;
  ownerAvatar?: string | null;
  commands?: BotCommand[];
  changelogs?: BotChangelog[];
  tags?: string[];
}

interface Feedback {
  id: string;
  userId: string;
  username: string;
  avatar: string | null;
  rating: number;
  comment: string;
  date: string;
}

interface BotProfileProps {
  botDetail: Bot;
  feedbacks: Feedback[];
  user: any;
  voteCooldownText: string | null;
  onVote: (captchaToken?: string | null) => void;
  newRating: number;
  onRatingChange: (val: number) => void;
  newComment: string;
  onCommentChange: (val: string) => void;
  feedbackError: string | null;
  submittingFeedback: boolean;
  onSubmitFeedback: (e: React.FormEvent) => void;
  onEditFeedback: (rating: number, comment: string) => void;
  onDeleteFeedback: () => void;
  recaptchaSiteKey?: string | null;
  onSaveBotDetails: (updatedData: {
    prefix: string;
    language: string;
    description: string;
    commands: BotCommand[];
    changelogs: BotChangelog[];
    tags: string[];
  }) => Promise<boolean>;
}

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const cleanStr = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  return new Date(cleanStr);
};

const parseMarkdownToHtml = (text: string) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-[11px]'>$1</code>");

  // Code Blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, "<pre class='bg-slate-900 border border-slate-850 p-3 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto my-2 whitespace-pre-wrap'><code>$1</code></pre>");

  // Bullet Points (- item or * item)
  html = html.replace(/^\s*-\s+(.*?)$/gm, "<li class='list-disc ml-5 text-slate-400'>$1</li>");
  html = html.replace(/^\s*\*\s+(.*?)$/gm, "<li class='list-disc ml-5 text-slate-400'>$1</li>");

  // Line breaks
  html = html.replace(/\n/g, "<br />");

  return html;
};

const parseMarkdownToHtmlWidget = (text: string) => {
  if (!text) return "";
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, "<code class='bg-slate-900 border border-slate-800/80 px-1 py-0.5 rounded text-cyan-400 font-mono text-[10px]'>$1</code>");

  return html;
};

export default function BotProfile({
  botDetail,
  feedbacks,
  user,
  voteCooldownText,
  onVote,
  newRating,
  onRatingChange,
  newComment,
  onCommentChange,
  feedbackError,
  submittingFeedback,
  onSubmitFeedback,
  onEditFeedback,
  onDeleteFeedback,
  recaptchaSiteKey,
  onSaveBotDetails,
}: BotProfileProps) {
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const existingFeedback = feedbacks.find(f => f.userId === user?.id);

  // Tab & Edit states
  const [activeTab, setActiveTab] = useState<"commands" | "feedbacks" | "changelogs">("feedbacks");
  const [isEditingBot, setIsEditingBot] = useState(false);

  // Edit form states
  const [editPrefix, setEditPrefix] = useState(botDetail.prefix || "");
  const [editLanguage, setEditLanguage] = useState(botDetail.language || "");
  const [editDescription, setEditDescription] = useState(botDetail.description || "");
  const [editCommands, setEditCommands] = useState<BotCommand[]>(botDetail.commands || []);
  const [editChangelogs, setEditChangelogs] = useState<BotChangelog[]>(botDetail.changelogs || []);
  const [editTags, setEditTags] = useState<string[]>(botDetail.tags || []);
  const [savingBot, setSavingBot] = useState(false);

  // New command states
  const [newCmdName, setNewCmdName] = useState("");
  const [newCmdDesc, setNewCmdDesc] = useState("");
  const [newCmdUsage, setNewCmdUsage] = useState("");
  const [newCmdType, setNewCmdType] = useState<"slash" | "prefix">("slash");

  // New changelog states
  const [newLogVersion, setNewLogVersion] = useState("");
  const [newLogTitle, setNewLogTitle] = useState("");
  const [newLogContent, setNewLogContent] = useState("");
  const [editingLogIndex, setEditingLogIndex] = useState<number | null>(null);

  // New custom tag state
  const [newCustomTag, setNewCustomTag] = useState("");

  // Keep edit form in sync when botDetail changes
  useEffect(() => {
    if (botDetail) {
      setEditPrefix(botDetail.prefix || "");
      setEditLanguage(botDetail.language || "");
      setEditDescription(botDetail.description || "");
      setEditCommands(botDetail.commands || []);
      setEditChangelogs(botDetail.changelogs || []);
      setEditTags(botDetail.tags || []);
      setEditingLogIndex(null);
      setNewLogVersion("");
      setNewLogTitle("");
      setNewLogContent("");
      setNewCustomTag("");
    }
  }, [botDetail]);

  const isOwner = user && botDetail && user.id === botDetail.ownerId;

  useEffect(() => {
    if (existingFeedback) {
      onRatingChange(existingFeedback.rating);
      onCommentChange(existingFeedback.comment);
    } else {
      onRatingChange(5);
      onCommentChange("");
    }
  }, [existingFeedback]);

  const latestChangelog = botDetail.changelogs && botDetail.changelogs.length > 0
    ? [...botDetail.changelogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;

  const getAvatarUrl = (id: string, hash: string | null) => {
    if (!hash) return "https://cdn.discordapp.com/embed/avatars/0.png";
    return `https://cdn.discordapp.com/avatars/${id}/${hash}.png`;
  };

  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${botDetail.id}&permissions=8&scope=bot%20applications.commands`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-900">
          <img 
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900 border border-slate-900 object-cover shadow-2xl" 
            src={getAvatarUrl(botDetail.id, botDetail.avatar)} 
            alt={botDetail.username} 
          />
          <div className="flex flex-col items-center sm:items-start gap-3.5 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 w-full justify-center sm:justify-start">
              <h2 className="text-3xl font-extrabold text-white font-sans">
                {botDetail.username}
              </h2>
              {isOwner && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingBot(true)}
                  className="flex items-center gap-1.5 h-8 text-xs font-bold border-slate-800 hover:bg-slate-900 mt-1 sm:mt-0"
                >
                  <Settings className="w-3.5 h-3.5 animate-spin-hover" />
                  Editar Bot
                </Button>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Badge variant="default">
                {botDetail.language}
              </Badge>
              {botDetail.tags && botDetail.tags.map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="outline" 
                  className="text-[10px] font-semibold border-slate-900 bg-slate-950/10 text-slate-400 py-0.5 px-2.5 rounded-full select-none"
                >
                  {tag}
                </Badge>
              ))}
              {botDetail.rating ? (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold text-amber-400 shadow-md shadow-amber-500/5">
                  <Stars rating={botDetail.rating} size={13} />
                  <span>{botDetail.rating} ({botDetail.feedbackCount})</span>
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-semibold border border-slate-900 px-3 py-1 rounded-full">
                  Sem avaliações
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description box */}
        <Card className="border border-slate-900 bg-slate-950/20">
          <CardHeader className="flex flex-row items-center gap-2 p-6 pb-4">
            <Info className="w-4 h-4 text-zinc-400" />
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Sobre o Bot
            </CardTitle>
          </CardHeader>
          <CardContent 
            className="px-6 pb-6 text-slate-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: botDetail.description 
                ? parseMarkdownToHtml(botDetail.description) 
                : "Nenhuma descrição informada." 
            }}
          />
        </Card>

        {latestChangelog && (
          <div 
            onClick={() => setActiveTab("changelogs")}
            className="flex items-center justify-between gap-4 p-3.5 rounded-xl border border-slate-900 bg-slate-950/20 hover:bg-slate-950/40 transition-colors duration-200 cursor-pointer group select-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Minimal version tag */}
              <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-500">
                {latestChangelog.version}
              </span>
              
              {/* Info text */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-slate-200 truncate shrink-0">
                  {latestChangelog.title}
                </span>
                <span className="text-slate-700 text-xs shrink-0">&bull;</span>
                <div 
                  className="text-slate-400 text-xs truncate font-medium flex-1"
                  dangerouslySetInnerHTML={{ __html: parseMarkdownToHtmlWidget(latestChangelog.content) }}
                />
              </div>
            </div>

            {/* Date and tiny arrow */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-slate-550 font-medium">
                {parseLocalDate(latestChangelog.date).toLocaleDateString("pt-BR")}
              </span>
              <span className="text-slate-650 group-hover:text-slate-450 group-hover:translate-x-0.5 transition-all duration-200 text-xs">
                &rarr;
              </span>
            </div>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex border-b border-slate-900 gap-1 pb-px">
          {[
            { id: "feedbacks", label: `Avaliações (${feedbacks.length})`, icon: Star },
            { id: "commands", label: "Comandos", icon: Terminal },
            { id: "changelogs", label: `Atualizações (${botDetail.changelogs?.length || 0})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "border-white text-white bg-slate-950/20"
                    : "border-transparent text-slate-500 hover:text-slate-350"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "commands" && (
          <Card className="border border-slate-900 bg-slate-950/20">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-zinc-400" />
                Comandos do Bot
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-4">
              {!botDetail.commands || botDetail.commands.length === 0 ? (
                <div className="text-center py-8 text-slate-550 text-sm font-medium">
                  Este bot ainda não tem comandos cadastrados pelo desenvolvedor.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5">
                  {botDetail.commands.map((cmd, i) => (
                    <div
                      key={i}
                      className="border border-slate-900/60 bg-slate-950/40 rounded-2xl p-4 space-y-2 hover:border-slate-800 transition-all duration-200"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-white bg-slate-900 border border-slate-850 px-2 py-0.5 rounded-lg">
                            {cmd.type === "slash" ? "/" : botDetail.prefix || "!"}
                            {cmd.name}
                          </code>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold py-0">
                            {cmd.type}
                          </Badge>
                        </div>
                        {cmd.usage && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            Uso: {cmd.usage}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed">
                        {cmd.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "changelogs" && (
          <Card className="border border-slate-900 bg-slate-950/20">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                Notas de Atualização (Changelogs)
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {!botDetail.changelogs || botDetail.changelogs.length === 0 ? (
                <div className="text-center py-8 text-slate-550 text-sm font-medium">
                  Este bot ainda não tem notas de atualização publicadas pelo desenvolvedor.
                </div>
              ) : (
                <div className="relative border-l border-slate-900 ml-3.5 space-y-8 py-2">
                  {[...botDetail.changelogs]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log, idx) => (
                      <div key={idx} className="relative pl-7 group">
                        {/* Timeline node dot */}
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-950 border border-slate-800 group-hover:border-amber-500 transition-colors" />
                        
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-lg shadow-sm">
                              {log.version}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              {parseLocalDate(log.date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          
                          <h4 className="text-sm font-extrabold text-white">{log.title}</h4>
                          <div 
                            className="text-slate-400 text-xs leading-relaxed bg-slate-950/40 border border-slate-950/80 rounded-2xl p-4 mt-2"
                            dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(log.content) }}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "feedbacks" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white border-l-4 border-zinc-300 pl-3">
              Avaliações da Comunidade
            </h3>

            {user ? (
              <Card className="border border-slate-900 bg-slate-950/20">
                <CardHeader className="p-6 pb-2">
                  <CardTitle className="text-sm font-bold text-slate-200">
                    {existingFeedback ? "Edite sua avaliação" : "Escreva um feedback"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (existingFeedback) {
                        onEditFeedback(newRating, newComment);
                      } else {
                        onSubmitFeedback(e);
                      }
                    }} 
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => onRatingChange(star)}
                          className="p-0.5 hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Star 
                            className={`w-6 h-6 ${
                              newRating >= star 
                                ? "text-amber-400 fill-amber-400" 
                                : "text-slate-700 hover:text-slate-500"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      placeholder="Conte sua experiência utilizando o bot..."
                      value={newComment}
                      onChange={(e) => onCommentChange(e.target.value)}
                      maxLength={500}
                      className="min-h-[100px]"
                    />
                    {feedbackError && (
                      <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-xl">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{feedbackError}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button type="submit" variant="default" disabled={submittingFeedback || newComment.trim().length === 0}>
                        {submittingFeedback ? "Processando..." : existingFeedback ? "Salvar Alterações" : "Enviar Avaliação"}
                      </Button>
                      {existingFeedback && (
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={submittingFeedback}
                          onClick={onDeleteFeedback}
                          className="flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center p-6 border border-slate-900 rounded-2xl text-slate-500 text-sm font-medium">
                Você precisa estar logado para deixar uma avaliação.
              </div>
            )}

            {/* Feedback list */}
            <div className="space-y-4">
              {feedbacks.length === 0 ? (
                <p className="text-center py-8 text-slate-650 text-sm font-medium">
                  Nenhum feedback ainda. Seja o primeiro a apoiar!
                </p>
              ) : (
                feedbacks.map((fb) => (
                  <Card key={fb.id} className="border border-slate-900 bg-slate-950/10">
                    <CardContent className="p-5 flex gap-4">
                      <img 
                        className="w-10 h-10 rounded-full border border-slate-900 shrink-0 object-cover" 
                        src={getAvatarUrl(fb.userId, fb.avatar)} 
                        alt={fb.username} 
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-200">
                            {fb.username}
                          </span>
                          <Stars rating={fb.rating} size={11} />
                        </div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                          {fb.comment}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-semibold">
                          <Calendar className="w-3 h-3" />
                          <span>{parseLocalDate(fb.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Column */}
      <div className="space-y-6">
        
        {/* Main CTA */}
        {user ? (
          <div className="space-y-3">
            {recaptchaSiteKey && !voteCooldownText && (
              <ReCaptcha
                key={recaptchaSiteKey}
                siteKey={recaptchaSiteKey}
                onChange={setCaptchaToken}
              />
            )}
            <Button 
              className="w-full h-12 text-sm font-bold" 
              variant="premium"
              onClick={() => {
                onVote(captchaToken);
                setCaptchaToken(null);
              }} 
              disabled={!!voteCooldownText || (!!recaptchaSiteKey && !captchaToken)}
            >
              {voteCooldownText ? `Cooldown: ${voteCooldownText}` : "Votar no Bot 🔥"}
            </Button>
          </div>
        ) : (
          <Button 
            className="w-full h-12 text-sm font-bold" 
            variant="premium"
            onClick={() => {
              localStorage.setItem("redirect_target", window.location.hash);
              window.location.href = "/api/auth/login";
            }}
          >
            Faça Login para Votar
          </Button>
        )}

        <Button 
          className="w-full h-12 text-sm font-bold" 
          variant="outline"
          onClick={() => window.open(inviteUrl, "_blank", "noopener,noreferrer")}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Adicionar ao Servidor
        </Button>

        {/* Bot Information Card */}
        <Card className="border border-slate-900 bg-slate-950/20">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Especificações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-xs text-slate-400 font-semibold">Votos totais</span>
              <span className="flex items-center gap-1 text-sm font-bold text-orange-400">
                <Flame className="w-4 h-4" />
                <span>{botDetail.votes}</span>
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-xs text-slate-400 font-semibold">Prefixo</span>
              <code className="bg-slate-900 text-cyan-400 border border-slate-800 px-2 py-0.5 rounded font-mono text-xs font-bold">
                {botDetail.prefix}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">ID do Client</span>
              <span className="font-mono text-[10px] text-slate-500 font-bold select-all">
                {botDetail.id}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Owner Card */}
        <Card className="border border-slate-900 bg-slate-950/20">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-404">
              Desenvolvedor
            </CardTitle>
          </CardHeader>
          <CardContent 
            className="p-6 pt-0 flex items-center gap-3 cursor-pointer hover:opacity-90 select-none group/owner"
            onClick={() => router.push(`/user/${botDetail.ownerId}`)}
          >
            <img 
              className="w-11 h-11 rounded-full border border-slate-900 shrink-0 object-cover group-hover/owner:border-zinc-500 transition-colors" 
              src={getAvatarUrl(botDetail.ownerId || "", botDetail.ownerAvatar || null)} 
              alt={botDetail.ownerName} 
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5 group-hover/owner:text-white transition-colors">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                <span>{botDetail.ownerName}</span>
              </span>
              <span className="font-mono text-[10px] text-slate-500 font-bold select-all">
                {botDetail.ownerId}
              </span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* EDIT BOT MODAL */}
      {isEditingBot && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-xl max-h-[85vh] overflow-y-auto border border-slate-900 bg-slate-950 p-6 shadow-2xl flex flex-col space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3.5">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" />
                Editar Informações do Bot
              </h3>
              <button 
                onClick={() => setIsEditingBot(false)} 
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-450 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4">
              {/* Prefix & Language side-by-side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Prefixo</label>
                  <input
                    type="text"
                    value={editPrefix}
                    onChange={(e) => setEditPrefix(e.target.value)}
                    maxLength={10}
                    placeholder="Ex: u!"
                    className="w-full text-sm bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-650 focus:border-slate-800 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Linguagem</label>
                  <input
                    type="text"
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    maxLength={50}
                    placeholder="Ex: JavaScript, Python"
                    className="w-full text-sm bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-650 focus:border-slate-800 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição do Bot</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Descreva as funções do seu bot para os usuários..."
                  className="min-h-[100px] text-sm bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2.5 text-slate-350 placeholder-slate-650 focus:border-slate-800 outline-none transition-all"
                />
              </div>

              {/* Category Tags Manager */}
              <div className="space-y-3 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Categorias / Tags ({editTags.length}/10)
                  </label>
                </div>

                {/* Selected Tags list */}
                <div className="flex flex-wrap gap-2 min-h-[40px] border border-slate-900/60 rounded-xl p-3 bg-slate-900/20">
                  {editTags.length === 0 ? (
                    <div className="text-slate-600 text-xs font-medium self-center w-full text-center">
                      Nenhuma tag atribuída. Adicione tags abaixo!
                    </div>
                  ) : (
                    editTags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="flex items-center gap-1.5 text-[11px] font-semibold bg-amber-500/10 border border-amber-500/25 text-amber-400 px-3 py-1 rounded-full select-none"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => setEditTags(editTags.filter((_, i) => i !== idx))}
                          className="hover:text-red-400 font-extrabold text-[12px] ml-0.5 outline-none"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Default/Recommended Tags */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">Tags Sugeridas (Clique para Adicionar)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Moderação", "Música", "Diversão", "Economia", "Utilidades", "Anime", "RPG", "Ticket", "Social", "Outro"]
                      .filter(tag => !editTags.includes(tag))
                      .map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (editTags.length >= 10) return;
                            setEditTags([...editTags, tag]);
                          }}
                          disabled={editTags.length >= 10}
                          className="text-[10px] font-bold border border-slate-900 bg-slate-950/40 text-slate-400 hover:text-white hover:border-slate-800 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
                        >
                          + {tag}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Add Custom Tag */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomTag}
                    onChange={(e) => setNewCustomTag(e.target.value)}
                    maxLength={20}
                    placeholder="Adicionar tag personalizada..."
                    className="flex-1 text-xs bg-slate-900/60 border border-slate-900/80 rounded-xl px-3.5 py-2 text-white outline-none"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      const trimmed = newCustomTag.trim();
                      if (!trimmed) return;
                      if (editTags.includes(trimmed)) {
                        alert("Essa tag já foi adicionada.");
                        return;
                      }
                      if (editTags.length >= 10) {
                        alert("Você pode adicionar no máximo 10 tags.");
                        return;
                      }
                      setEditTags([...editTags, trimmed]);
                      setNewCustomTag("");
                    }}
                    disabled={editTags.length >= 10}
                    variant="outline"
                    className="h-8 text-[11px] font-bold border-slate-800 bg-slate-950/40 hover:bg-slate-900 px-3"
                  >
                    Adicionar Tag
                  </Button>
                </div>
              </div>

              {/* Commands Manager */}
              <div className="space-y-3.5 pt-2 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gerenciar Comandos ({editCommands.length})</label>
                </div>

                {/* Commands list inside modal */}
                <div className="max-h-[160px] overflow-y-auto space-y-2 border border-slate-900/60 rounded-xl p-3 bg-slate-900/20">
                  {editCommands.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-600 font-medium">
                      Nenhum comando adicionado. Adicione um abaixo!
                    </div>
                  ) : (
                    editCommands.map((cmd, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-950/40 border border-slate-900/80 rounded-xl px-3 py-2 text-xs">
                        <div className="flex items-center gap-2">
                          <code className="font-mono font-bold text-white bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded-md">
                            {cmd.type === "slash" ? "/" : editPrefix || "!"}{cmd.name}
                          </code>
                          <span className="text-slate-500 font-bold uppercase text-[9px]">{cmd.type}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditCommands(editCommands.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-slate-900 text-slate-500 hover:text-red-400 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new command form fields */}
                <div className="bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1">
                    <span className="text-[10px] font-black uppercase text-slate-500">Novo Comando</span>
                    {/* Command Type Selector */}
                    <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-850">
                      <button
                        type="button"
                        onClick={() => setNewCmdType("slash")}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                          newCmdType === "slash" ? "bg-slate-850 text-white" : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Slash (/)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCmdType("prefix")}
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                          newCmdType === "prefix" ? "bg-slate-850 text-white" : "text-slate-500 hover:text-slate-350"
                        }`}
                      >
                        Prefixo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Nome</label>
                      <input
                        type="text"
                        value={newCmdName}
                        onChange={(e) => setNewCmdName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                        maxLength={32}
                        placeholder="help"
                        className="w-full text-xs bg-slate-950/60 border border-slate-900/80 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Exemplo de Uso (Opcional)</label>
                      <input
                        type="text"
                        value={newCmdUsage}
                        onChange={(e) => setNewCmdUsage(e.target.value)}
                        maxLength={100}
                        placeholder="help [bot]"
                        className="w-full text-xs bg-slate-950/60 border border-slate-900/80 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Descrição</label>
                    <input
                      type="text"
                      value={newCmdDesc}
                      onChange={(e) => setNewCmdDesc(e.target.value)}
                      maxLength={100}
                      placeholder="Mostra a lista de comandos úteis do bot."
                      className="w-full text-xs bg-slate-950/60 border border-slate-900/80 rounded-xl px-3 py-2 text-slate-350 outline-none"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      if (!newCmdName.trim()) return;
                      if (!newCmdDesc.trim()) return;
                      setEditCommands([
                        ...editCommands,
                        {
                          name: newCmdName.trim(),
                          description: newCmdDesc.trim(),
                          usage: newCmdUsage.trim(),
                          type: newCmdType,
                        },
                      ]);
                      setNewCmdName("");
                      setNewCmdDesc("");
                      setNewCmdUsage("");
                    }}
                    variant="outline"
                    className="w-full h-8 text-[11px] font-bold border-slate-800 bg-slate-950/40 hover:bg-slate-900 flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Comando
                  </Button>
                </div>
              </div>

              {/* Changelogs Manager */}
              <div className="space-y-3.5 pt-4 border-t border-slate-900">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Notas de Atualização ({editChangelogs.length})</label>
                </div>

                {/* Changelogs list inside modal */}
                <div className="max-h-[140px] overflow-y-auto space-y-2 border border-slate-900/60 rounded-xl p-3 bg-slate-900/20">
                  {editChangelogs.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-600 font-medium">
                      Nenhuma nota de atualização cadastrada. Publique uma abaixo!
                    </div>
                  ) : (
                    [...editChangelogs]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950/40 border border-slate-900/80 rounded-xl px-3 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md text-[10px]">
                              {log.version}
                            </span>
                            <span className="text-slate-200 font-extrabold truncate max-w-[200px]">{log.title}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setNewLogVersion(log.version);
                                setNewLogTitle(log.title);
                                setNewLogContent(log.content);
                                const idx = editChangelogs.findIndex(x => x.version === log.version);
                                setEditingLogIndex(idx);
                              }}
                              className="p-1 hover:bg-slate-900 text-slate-500 hover:text-cyan-400 rounded-md transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditChangelogs(editChangelogs.filter((_, i) => editChangelogs[i].version !== log.version));
                                if (editingLogIndex !== null && editChangelogs[editingLogIndex]?.version === log.version) {
                                  setEditingLogIndex(null);
                                  setNewLogVersion("");
                                  setNewLogTitle("");
                                  setNewLogContent("");
                                }
                              }}
                              className="p-1 hover:bg-slate-900 text-slate-500 hover:text-red-400 rounded-md transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Add new changelog form fields */}
                <div className="bg-slate-900/40 border border-slate-900/60 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1">
                    <span className="text-[10px] font-black uppercase text-slate-500">
                      {editingLogIndex !== null ? "Editando Nota de Atualização" : "Nova Versão / Notas"}
                    </span>
                    {editingLogIndex !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingLogIndex(null);
                          setNewLogVersion("");
                          setNewLogTitle("");
                          setNewLogContent("");
                        }}
                        className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase transition-colors"
                      >
                        Cancelar Edição
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Versão</label>
                      <input
                        type="text"
                        value={newLogVersion}
                        onChange={(e) => setNewLogVersion(e.target.value)}
                        maxLength={16}
                        placeholder="v1.2.0"
                        className="w-full text-xs bg-slate-950/60 border border-slate-900/80 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Título da Atualização</label>
                      <input
                        type="text"
                        value={newLogTitle}
                        onChange={(e) => setNewLogTitle(e.target.value)}
                        maxLength={64}
                        placeholder="Novos comandos e otimizações"
                        className="w-full text-xs bg-slate-950/60 border border-slate-900/80 rounded-xl px-3 py-2 text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Conteúdo das Notas de Atualização</label>
                    <Textarea
                      value={newLogContent}
                      onChange={(e) => setNewLogContent(e.target.value)}
                      maxLength={1000}
                      placeholder="Descreva o que mudou nessa versão..."
                      className="min-h-[70px] text-xs bg-slate-950/60 border border-slate-900/80 rounded-xl px-3 py-2 text-slate-305 outline-none focus:border-slate-800 transition-all"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => {
                      if (!newLogVersion.trim()) return;
                      if (!newLogTitle.trim()) return;
                      if (!newLogContent.trim()) return;
                      
                      if (editingLogIndex !== null) {
                        const isDuplicate = editChangelogs.some((log, idx) => idx !== editingLogIndex && log.version === newLogVersion.trim());
                        if (isDuplicate) {
                          alert("Essa versão já está cadastrada.");
                          return;
                        }
                        const updated = [...editChangelogs];
                        updated[editingLogIndex] = {
                          ...updated[editingLogIndex],
                          version: newLogVersion.trim(),
                          title: newLogTitle.trim(),
                          content: newLogContent.trim(),
                        };
                        setEditChangelogs(updated);
                        setEditingLogIndex(null);
                      } else {
                        if (editChangelogs.some(log => log.version === newLogVersion.trim())) {
                          alert("Essa versão já está cadastrada.");
                          return;
                        }

                        setEditChangelogs([
                          ...editChangelogs,
                          {
                            version: newLogVersion.trim(),
                            title: newLogTitle.trim(),
                            content: newLogContent.trim(),
                            date: new Date().toISOString(),
                          },
                        ]);
                      }
                      setNewLogVersion("");
                      setNewLogTitle("");
                      setNewLogContent("");
                    }}
                    variant="outline"
                    className="w-full h-8 text-[11px] font-bold border-slate-800 bg-slate-950/40 hover:bg-slate-900 flex items-center justify-center gap-1.5"
                  >
                    {editingLogIndex !== null ? (
                      <>
                        <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Salvar Alterações da Nota</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Notas</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-slate-900 pt-3.5">
              <Button
                variant="outline"
                onClick={() => setIsEditingBot(false)}
                disabled={savingBot}
                className="h-9 px-4 border-slate-850 text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button
                onClick={async () => {
                  setSavingBot(true);
                  const success = await onSaveBotDetails({
                    prefix: editPrefix,
                    language: editLanguage,
                    description: editDescription,
                    commands: editCommands,
                    changelogs: editChangelogs,
                    tags: editTags,
                  });
                  setSavingBot(false);
                  if (success) {
                    setIsEditingBot(false);
                  }
                }}
                disabled={savingBot}
                className="h-9 px-5 text-xs font-bold"
              >
                {savingBot ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}
