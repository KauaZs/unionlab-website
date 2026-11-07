"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ShieldAlert, Calendar, Star, Info, Trash2, Settings, X, Plus, Terminal, History, Pencil, Copy, Check, Code2, Sparkles, ChevronRight, Image as ImageIcon } from "lucide-react";
import Stars from "../components/Stars";
import ReCaptcha from "../components/ReCaptcha";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { startLogin } from "@/lib/api";
import Markdown from "@/components/Markdown";
import ImageUpload from "@/components/ImageUpload";
import ImageGallery from "@/components/ImageGallery";
import { useApp } from "@/context/AppContext";
import { botAvatarUrl } from "@/components/BotCard";
import { categoriesOf, categoryForTag } from "@/lib/categories";
import { cn } from "@/lib/utils";

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
  /** Custom banner image; falls back to the blurred avatar. */
  banner?: string | null;
  /** Images of the bot in action. */
  screenshots?: string[];
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
    banner: string | null;
    screenshots: string[];
  }) => Promise<boolean>;
}

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return new Date();
  const cleanStr = dateStr.endsWith("Z") ? dateStr.slice(0, -1) : dateStr;
  return new Date(cleanStr);
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
  const { authToken, showToast } = useApp();
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
  const [editBanner, setEditBanner] = useState<string[]>(botDetail.banner ? [botDetail.banner] : []);
  const [editScreenshots, setEditScreenshots] = useState<string[]>(botDetail.screenshots || []);
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
      setEditBanner(botDetail.banner ? [botDetail.banner] : []);
      setEditScreenshots(botDetail.screenshots || []);
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

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, key: string) => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(key);
        setTimeout(() => setCopied(null), 1500);
      })
      .catch(() => {});
  };

  const avatar = botAvatarUrl(botDetail.id, botDetail.avatar).replace("size=128", "size=256");
  const categories = categoriesOf(botDetail.tags);
  const extraTags = (botDetail.tags ?? []).filter((t) => !categoryForTag(t));
  const commandCount = botDetail.commands?.length ?? 0;
  const changelogCount = botDetail.changelogs?.length ?? 0;
  const hasRating = !!botDetail.rating && !!botDetail.feedbackCount;

  const tabs = [
    { id: "feedbacks" as const, label: "Avaliações", count: feedbacks.length, icon: Star },
    { id: "commands" as const, label: "Comandos", count: commandCount, icon: Terminal },
    { id: "changelogs" as const, label: "Atualizações", count: changelogCount, icon: History },
  ];

  const panel = "rounded-2xl border border-slate-900 bg-zinc-950/60 backdrop-blur-sm";
  const sectionTitle = "flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400";

  return (
    <div className="space-y-6">
      {/* Hero: blurred-avatar cover, big avatar, name, chips and actions */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-900 bg-zinc-950/70">
        <div className={cn("relative overflow-hidden", botDetail.banner ? "h-44 sm:h-64" : "h-36 sm:h-48")}>
          {botDetail.banner ? (
            <img src={botDetail.banner} alt={`Banner de ${botDetail.username}`} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <>
              <img src={avatar} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-150 object-cover opacity-70 blur-3xl saturate-150" />
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.09)_1px,transparent_1px)] opacity-40 [background-size:18px_18px]" />
            </>
          )}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>

        <div className="relative -mt-16 flex flex-col gap-5 px-6 pb-6 md:flex-row md:items-end md:justify-between md:px-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
            <img
              src={avatar}
              alt={botDetail.username}
              className="h-28 w-28 shrink-0 rounded-3xl border-4 border-zinc-950 bg-zinc-900 object-cover shadow-2xl shadow-black/60 sm:h-32 sm:w-32"
            />
            <div className="min-w-0 space-y-2.5 pb-1">
              <h1 className="break-words text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{botDetail.username}</h1>
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                <span className="rounded-full border border-slate-800 bg-slate-900/70 px-2.5 py-0.5 text-[11px] font-bold text-slate-300">
                  {botDetail.language}
                </span>
                {categories.map((c) => {
                  const Icon = c.icon;
                  return (
                    <span key={c.id} className={cn("flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold", c.text, c.bg, c.border)}>
                      <Icon className="h-3 w-3" />
                      {c.label}
                    </span>
                  );
                })}
                {extraTags.map((t) => (
                  <span key={t} className="rounded-full border border-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end md:pb-1">
            {isOwner && (
              <button
                onClick={() => setIsEditingBot(true)}
                className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-800 bg-zinc-950/60 px-4 text-xs font-bold text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Editar bot
              </button>
            )}
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-1.5 rounded-xl bg-white px-5 text-xs font-extrabold text-black shadow-lg shadow-black/40 transition-colors hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Adicionar ao servidor
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className={cn(panel, "flex items-center gap-3 p-4")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <Flame className="h-5 w-5 text-orange-400" />
          </span>
          <div>
            <p className="text-xl font-black leading-none text-white">{botDetail.votes.toLocaleString("pt-BR")}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">votos</p>
          </div>
        </div>
        <div className={cn(panel, "flex items-center gap-3 p-4")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
            <Star className="h-5 w-5 fill-amber-400/30 text-amber-400" />
          </span>
          <div>
            <p className="text-xl font-black leading-none text-white">{hasRating ? botDetail.rating!.toFixed(1) : "—"}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              {botDetail.feedbackCount ? `${botDetail.feedbackCount} avaliações` : "sem avaliações"}
            </p>
          </div>
        </div>
        <div className={cn(panel, "flex items-center gap-3 p-4")}>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
            <Terminal className="h-5 w-5 text-indigo-300" />
          </span>
          <div>
            <p className="text-xl font-black leading-none text-white">{commandCount}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">comandos</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => copy(botDetail.prefix, "prefix")}
          title="Copiar prefixo"
          className={cn(panel, "group flex items-center gap-3 p-4 text-left transition-colors hover:border-slate-700")}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <Code2 className="h-5 w-5 text-cyan-300" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-mono text-xl font-black leading-none text-white">{botDetail.prefix}</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              {copied === "prefix" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />}
              {copied === "prefix" ? "copiado!" : "prefixo"}
            </p>
          </div>
        </button>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-6">
          <section className={cn(panel, "p-6")}>
            <h2 className={sectionTitle}>
              <Info className="h-4 w-4" />
              Sobre o bot
            </h2>
            <div className="mt-4 text-sm leading-relaxed text-slate-300">
              {botDetail.description ? <Markdown>{botDetail.description}</Markdown> : <p className="text-slate-500">Nenhuma descrição informada.</p>}
            </div>
          </section>

          {(botDetail.screenshots?.length ?? 0) > 0 && (
            <section className={cn(panel, "p-6")}>
              <h2 className={sectionTitle}>
                <ImageIcon className="h-4 w-4" />
                Bot em ação
              </h2>
              <ImageGallery images={botDetail.screenshots!} label={botDetail.username} className="mt-4" />
            </section>
          )}

          {latestChangelog && (
            <button
              type="button"
              onClick={() => setActiveTab("changelogs")}
              className={cn(panel, "group flex w-full items-center gap-3 overflow-hidden px-4 py-3 text-left transition-colors hover:border-slate-700")}
            >
              <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 font-mono text-[11px] font-black text-amber-400">
                <Sparkles className="h-3 w-3" />
                {latestChangelog.version}
              </span>
              <span className="shrink-0 text-sm font-bold text-slate-200">{latestChangelog.title}</span>
              <span className="hidden min-w-0 flex-1 truncate text-xs text-slate-500 sm:block">
                <Markdown inline>{latestChangelog.content}</Markdown>
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                {parseLocalDate(latestChangelog.date).toLocaleDateString("pt-BR")}
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          )}

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-900 bg-zinc-950/60 p-1.5 [scrollbar-width:none]">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "flex flex-1 shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200",
                    active ? "bg-white text-black shadow-md" : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  <span className={cn("rounded-md px-1.5 text-[10px] font-black", active ? "bg-black/10 text-zinc-700" : "bg-slate-900 text-slate-500")}>
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === "commands" &&
            (commandCount === 0 ? (
              <p className={cn(panel, "py-12 text-center text-sm font-medium text-slate-500")}>
                Este bot ainda não tem comandos cadastrados pelo desenvolvedor.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {botDetail.commands!.map((cmd, i) => (
                  <div key={i} className={cn(panel, "space-y-2 p-4 transition-colors hover:border-slate-700")}>
                    <div className="flex items-center justify-between gap-2">
                      <code className="truncate rounded-lg border border-slate-800 bg-slate-900 px-2 py-0.5 font-mono text-sm font-bold text-white">
                        {cmd.type === "slash" ? "/" : botDetail.prefix || "!"}
                        {cmd.name}
                      </code>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                          cmd.type === "slash" ? "bg-indigo-500/10 text-indigo-300" : "bg-cyan-500/10 text-cyan-300"
                        )}
                      >
                        {cmd.type === "slash" ? "slash" : "prefixo"}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">{cmd.description}</p>
                    {cmd.usage && <p className="font-mono text-[11px] text-slate-500">Uso: {cmd.usage}</p>}
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "changelogs" &&
            (changelogCount === 0 ? (
              <p className={cn(panel, "py-12 text-center text-sm font-medium text-slate-500")}>
                Este bot ainda não tem notas de atualização publicadas pelo desenvolvedor.
              </p>
            ) : (
              <div className={cn(panel, "p-6")}>
                <div className="relative ml-2 space-y-8 border-l border-slate-800 py-1">
                  {[...botDetail.changelogs!]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((log, idx) => (
                      <div key={idx} className="relative pl-6">
                        <span className={cn("absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-950", idx === 0 ? "bg-amber-400" : "bg-slate-700")} />
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-black text-amber-400">
                            {log.version}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">{parseLocalDate(log.date).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-extrabold text-white">{log.title}</h4>
                        <Markdown className="mt-2 text-xs leading-relaxed text-slate-400">{log.content}</Markdown>
                      </div>
                    ))}
                </div>
              </div>
            ))}

          {activeTab === "feedbacks" && (
            <div className="space-y-4">
              {user ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (existingFeedback) onEditFeedback(newRating, newComment);
                    else onSubmitFeedback(e);
                  }}
                  className={cn(panel, "space-y-4 p-5")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-200">{existingFeedback ? "Sua avaliação" : "Avalie este bot"}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => onRatingChange(star)}
                          aria-label={star === 1 ? "1 estrela" : `${star} estrelas`}
                          className="p-0.5 transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star className={cn("h-6 w-6", newRating >= star ? "fill-amber-400 text-amber-400" : "text-slate-700 hover:text-slate-500")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    placeholder="Conte sua experiência utilizando o bot..."
                    value={newComment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    maxLength={500}
                    className="min-h-[96px]"
                  />
                  {feedbackError && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-400">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      <span>{feedbackError}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="submit" variant="default" disabled={submittingFeedback || newComment.trim().length === 0}>
                      {submittingFeedback ? "Processando..." : existingFeedback ? "Salvar alterações" : "Enviar avaliação"}
                    </Button>
                    {existingFeedback && (
                      <Button type="button" variant="destructive" disabled={submittingFeedback} onClick={onDeleteFeedback} className="flex items-center gap-1.5">
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={startLogin}
                  className={cn(panel, "w-full p-5 text-center text-sm font-medium text-slate-400 transition-colors hover:border-slate-700 hover:text-white")}
                >
                  Faça login para deixar uma avaliação
                </button>
              )}

              {feedbacks.length === 0 ? (
                <p className="py-8 text-center text-sm font-medium text-slate-500">Nenhuma avaliação ainda. Seja o primeiro!</p>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className={cn(panel, "flex gap-4 p-5")}>
                    <img className="h-10 w-10 shrink-0 rounded-full object-cover" src={getAvatarUrl(fb.userId, fb.avatar)} alt="" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-200">{fb.username}</span>
                        <Stars rating={fb.rating} size={12} />
                      </div>
                      <p className="break-words text-sm leading-relaxed text-slate-400">{fb.comment}</p>
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                        <Calendar className="h-3 w-3" />
                        {parseLocalDate(fb.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className={cn(panel, "space-y-4 p-5")}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Votos</p>
                <p className="mt-1 flex items-center gap-1.5 text-3xl font-black text-white">
                  <Flame className="h-6 w-6 text-orange-500" />
                  {botDetail.votes.toLocaleString("pt-BR")}
                </p>
              </div>
              {hasRating && (
                <div className="text-right">
                  <Stars rating={botDetail.rating!} size={13} />
                  <p className="mt-1 text-[11px] font-semibold text-slate-500">{botDetail.feedbackCount} avaliações</p>
                </div>
              )}
            </div>
            {user ? (
              <>
                {recaptchaSiteKey && !voteCooldownText && <ReCaptcha key={recaptchaSiteKey} siteKey={recaptchaSiteKey} onChange={setCaptchaToken} />}
                <button
                  onClick={() => {
                    onVote(captchaToken);
                    setCaptchaToken(null);
                  }}
                  disabled={!!voteCooldownText || (!!recaptchaSiteKey && !captchaToken)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-sm font-extrabold text-black shadow-lg shadow-orange-500/20 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {voteCooldownText ? `Próximo voto em ${voteCooldownText}` : "Votar no bot 🔥"}
                </button>
                <p className="text-center text-[11px] text-slate-500">Votar rende unicoins e ajuda o bot a subir no ranking.</p>
              </>
            ) : (
              <button
                onClick={startLogin}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-800 text-sm font-bold text-white transition-colors hover:bg-slate-900"
              >
                Faça login para votar
              </button>
            )}
          </div>

          {botDetail.ownerId && (
            <Link href={`/user/${botDetail.ownerId}`} className={cn(panel, "group flex items-center gap-3 p-4 transition-colors hover:border-slate-700")}>
              <img className="h-11 w-11 shrink-0 rounded-full object-cover" src={getAvatarUrl(botDetail.ownerId, botDetail.ownerAvatar || null)} alt="" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Desenvolvedor</p>
                <p className="truncate text-sm font-bold text-slate-200 group-hover:text-white">{botDetail.ownerName ?? "Desconhecido"}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-300" />
            </Link>
          )}

          <div className={cn(panel, "divide-y divide-slate-900 text-xs")}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-semibold text-slate-500">Linguagem</span>
              <span className="font-bold text-slate-200">{botDetail.language}</span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-semibold text-slate-500">ID do bot</span>
              <button
                type="button"
                onClick={() => copy(botDetail.id, "id")}
                title="Copiar ID"
                className="flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-bold text-slate-300 hover:text-white"
              >
                <span className="truncate">{botDetail.id}</span>
                {copied === "id" ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 shrink-0" />}
              </button>
            </div>
          </div>
        </aside>
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

              {/* Banner & screenshots */}
              <div className="space-y-4 border-t border-slate-900 pt-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Banner do perfil</label>
                  <p className="text-[11px] text-slate-500">Aparece no topo do perfil e no card da página inicial. Sem banner, usamos o avatar desfocado.</p>
                  {authToken && (
                    <ImageUpload
                      kind="bot"
                      authToken={authToken}
                      value={editBanner}
                      onChange={setEditBanner}
                      max={1}
                      variant="cover"
                      hint="Recomendado 1500×500 • PNG, JPG, WEBP ou GIF"
                      onError={(m) => showToast(m, "error")}
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Imagens do bot funcionando ({editScreenshots.length}/6)
                  </label>
                  <p className="text-[11px] text-slate-500">Prints de comandos, painéis e respostas do bot. Aparecem numa galeria no perfil.</p>
                  {authToken && (
                    <ImageUpload
                      kind="bot"
                      authToken={authToken}
                      value={editScreenshots}
                      onChange={setEditScreenshots}
                      max={6}
                      variant="gallery"
                      hint="PNG, JPG, WEBP ou GIF"
                      onError={(m) => showToast(m, "error")}
                    />
                  )}
                </div>
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
                    banner: editBanner[0] ?? null,
                    screenshots: editScreenshots,
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
