"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Plus, X, PlayCircle, Send, CheckCircle2, LogIn, ArrowRight } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import Markdown from "@/components/Markdown";
import ProjectCard from "@/components/ProjectCard";
import { useApp } from "@/context/AppContext";
import { startLogin } from "@/lib/api";
import { PROJECT_TYPES, PROJECT_TYPE_BY_ID, embedUrlFor } from "@/lib/projectTypes";
import { cn } from "@/lib/utils";
import type { Project, ProjectLink, ProjectType } from "@/lib/types";

const LIMITS = { title: 60, summary: 140, description: 4000, tags: 8, tag: 20, links: 5, screenshots: 6 };

function isHttpUrl(value: string) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const labelClass = "text-xs font-bold uppercase tracking-wider text-slate-400";
const fieldClass =
  "w-full rounded-xl border border-slate-800 bg-zinc-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-slate-600 focus:outline-none";

function Counter({ value, max }: { value: number; max: number }) {
  return <span className={cn("text-[11px] font-semibold", value > max ? "text-red-400" : "text-slate-600")}>{value}/{max}</span>;
}

interface PublishProjectProps {
  initialType: ProjectType | null;
  /** When set, the form edits this project instead of creating one. */
  editing?: Project;
}

export default function PublishProject({ initialType, editing }: PublishProjectProps) {
  const router = useRouter();
  const { user, authToken, showToast } = useApp();

  const [type, setType] = useState<ProjectType | null>(editing?.type ?? initialType);
  const [title, setTitle] = useState(editing?.title ?? "");
  const [summary, setSummary] = useState(editing?.summary ?? "");
  const [url, setUrl] = useState(editing?.url ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [descTab, setDescTab] = useState<"write" | "preview">("write");
  const [tags, setTags] = useState<string[]>(editing?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [links, setLinks] = useState<ProjectLink[]>(editing?.links ?? []);
  const [cover, setCover] = useState<string[]>(editing?.coverImage ? [editing.coverImage] : []);
  const [screenshots, setScreenshots] = useState<string[]>(editing?.screenshots ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; status: Project["status"] } | null>(null);

  const info = type ? PROJECT_TYPE_BY_ID[type] : null;
  const embed = url && isHttpUrl(url) ? embedUrlFor(url) : null;

  const addTag = (raw: string) => {
    const t = raw.trim().slice(0, LIMITS.tag);
    if (!t || tags.length >= LIMITS.tags || tags.some((x) => x.toLowerCase() === t.toLowerCase())) return;
    setTags([...tags, t]);
  };

  const errors = useMemo(() => {
    const e: string[] = [];
    if (!type) e.push("Escolha o tipo de projeto.");
    if (title.trim().length < 2 || title.length > LIMITS.title) e.push(`Título entre 2 e ${LIMITS.title} caracteres.`);
    if (summary.trim().length < 10 || summary.length > LIMITS.summary) e.push(`Resumo entre 10 e ${LIMITS.summary} caracteres.`);
    if (!isHttpUrl(url)) e.push("Link principal válido (http ou https).");
    if (description.length > LIMITS.description) e.push(`Descrição com até ${LIMITS.description} caracteres.`);
    if (links.some((l) => !l.label.trim() || !isHttpUrl(l.url))) e.push("Cada link extra precisa de nome e URL válida.");
    return e;
  }, [type, title, summary, url, description, links]);

  const previewProject: Project | null = type
    ? {
        id: "preview",
        type,
        title: title || "Nome do projeto",
        summary: summary || "Um resumo curto aparece aqui no card.",
        description,
        url: isHttpUrl(url) ? url : "https://example.com",
        links,
        coverImage: cover[0] ?? null,
        screenshots,
        tags,
        ownerId: user?.id ?? "0",
        ownerName: user?.username ?? "Você",
        ownerAvatar: user?.avatar ?? null,
        status: "pending",
        votes: 0,
        addedAt: new Date().toISOString(),
      }
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || errors.length) return;
    setSubmitting(true);
    try {
      const res = await fetch(editing ? `/api/public/projects/${editing.id}` : "/api/public/projects", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({
          type,
          title,
          summary,
          url,
          description,
          tags,
          links,
          coverImage: cover[0] ?? null,
          screenshots,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(data.error || "Não foi possível salvar o projeto.", "error");
        return;
      }
      if (editing && data.changed?.length === 0) {
        showToast("Nenhuma alteração para salvar.", "info");
        return;
      }
      setResult({ id: data.id, status: data.status ?? "pending" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      showToast("Erro de conexão ao enviar o projeto.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !authToken) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <LogIn className="h-10 w-10 text-slate-500" />
        <h1 className="text-2xl font-extrabold text-white">Entre para publicar</h1>
        <p className="text-sm text-slate-400">Faça login com o Discord para enviar seus sites, jogos e músicas para a comunidade.</p>
        <button onClick={startLogin} className="h-11 rounded-xl bg-white px-6 text-sm font-extrabold text-black hover:bg-zinc-200">
          Login com Discord
        </button>
      </div>
    );
  }

  if (result) {
    const live = result.status === "approved";
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        <h1 className="text-2xl font-extrabold text-white">{editing ? "Alterações salvas!" : "Projeto enviado!"}</h1>
        <p className="text-sm text-slate-400">
          {live ? (
            <>As mudanças em <strong className="text-white">{title}</strong> já estão no ar.</>
          ) : (
            <>
              Nossa equipe vai analisar <strong className="text-white">{title}</strong>. Você recebe uma notificação (e uma DM no Discord) assim que ele for aprovado.
            </>
          )}
        </p>
        <div className="flex gap-3">
          <Link href={`/projects/${result.id}`} className="flex h-10 items-center rounded-xl bg-white px-5 text-xs font-extrabold text-black hover:bg-zinc-200">
            Ver página
          </Link>
          <button
            onClick={() => router.push("/")}
            className="flex h-10 items-center rounded-xl border border-slate-800 px-5 text-xs font-bold text-slate-200 hover:bg-slate-900"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">{editing ? `Editar ${editing.title}` : "Publicar projeto"}</h1>
        <p className="text-sm text-slate-400">
          {!editing
            ? "Mostre seu trabalho para a comunidade. Todo projeto passa por uma análise rápida antes de aparecer no site."
            : editing.status === "approved"
              ? "As mudanças entram no ar na hora. A equipe é avisada do que mudou e pode retirar o projeto se algo não seguir as regras."
              : editing.status === "refused"
                ? "Ajuste o que for preciso e salve para reenviar o projeto para análise."
                : "Seu projeto ainda está em análise. As mudanças substituem a versão enviada."}
        </p>
        {editing?.status === "refused" && editing.refusedReason && (
          <p className="rounded-xl border border-red-500/25 bg-red-500/5 px-4 py-3 text-xs font-semibold text-red-200">Motivo da recusa: {editing.refusedReason}</p>
        )}
      </div>

      {/* Type picker */}
      <section className="space-y-3">
        <span className={labelClass}>O que você quer publicar?</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {!editing && (
          <Link
            href="/addbot"
            className="flex flex-col items-center gap-2 rounded-2xl border border-slate-900 bg-zinc-950/60 p-4 text-center text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <Bot className="h-5 w-5" />
            </span>
            <span className="text-sm font-extrabold">Bot</span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
              Outro formulário <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
          )}
          {PROJECT_TYPES.map((t) => {
            const Icon = t.icon;
            const active = type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all",
                  active ? cn(t.bg, t.border, "ring-1 ring-inset ring-current", t.text) : "border-slate-900 bg-zinc-950/60 text-slate-300 hover:border-slate-700 hover:text-white"
                )}
              >
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", t.bg)}>
                  <Icon className={cn("h-5 w-5", t.text)} />
                </span>
                <span className="text-sm font-extrabold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {info && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className={labelClass}>Nome</label>
                <Counter value={title.length} max={LIMITS.title} />
              </div>
              <input id="title" className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={LIMITS.title} placeholder={`Nome do seu ${info.label.toLowerCase()}`} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="summary" className={labelClass}>Resumo</label>
                <Counter value={summary.length} max={LIMITS.summary} />
              </div>
              <input id="summary" className={fieldClass} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={LIMITS.summary} placeholder="Uma frase que aparece no card" />
            </div>

            <div className="space-y-2">
              <label htmlFor="url" className={labelClass}>{info.urlLabel}</label>
              <input id="url" type="url" className={fieldClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder={info.urlPlaceholder} />
              {embed && (
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <PlayCircle className="h-3.5 w-3.5" />
                  Vamos mostrar um player do {embed.kind === "spotify" ? "Spotify" : embed.kind === "youtube" ? "YouTube" : "SoundCloud"} na página do projeto.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span className={labelClass}>Capa</span>
              <ImageUpload
                authToken={authToken}
                value={cover}
                onChange={setCover}
                max={1}
                variant="cover"
                hint="16:9 recomendado • PNG, JPG, WEBP ou GIF"
                onError={(m) => showToast(m, "error")}
              />
            </div>

            <div className="space-y-2">
              <span className={labelClass}>Screenshots <span className="normal-case text-slate-600">(opcional, até {LIMITS.screenshots})</span></span>
              <ImageUpload
                authToken={authToken}
                value={screenshots}
                onChange={setScreenshots}
                max={LIMITS.screenshots}
                variant="gallery"
                hint="PNG, JPG, WEBP ou GIF"
                onError={(m) => showToast(m, "error")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex gap-1 rounded-lg border border-slate-900 p-0.5">
                  {(["write", "preview"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDescTab(t)}
                      className={cn("rounded-md px-3 py-1 text-xs font-bold", descTab === t ? "bg-white text-black" : "text-slate-400 hover:text-white")}
                    >
                      {t === "write" ? "Descrição" : "Prévia"}
                    </button>
                  ))}
                </div>
                <Counter value={description.length} max={LIMITS.description} />
              </div>
              {descTab === "write" ? (
                <textarea
                  className={cn(fieldClass, "min-h-[180px] resize-y font-mono text-[13px]")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Conte mais sobre o projeto. Aceita **markdown**, listas e `código`."
                />
              ) : (
                <div className="min-h-[180px] rounded-xl border border-slate-800 bg-zinc-950/60 p-4 text-sm text-slate-300">
                  {description ? <Markdown>{description}</Markdown> : <p className="text-slate-600">Nada para mostrar ainda.</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={labelClass}>Tags</span>
                <Counter value={tags.length} max={LIMITS.tags} />
              </div>
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-800 bg-zinc-950/60 p-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs font-bold text-white">
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remover ${t}`} className="text-slate-400 hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {tags.length < LIMITS.tags && (
                  <input
                    className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                    value={tagInput}
                    maxLength={LIMITS.tag}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(tagInput);
                        setTagInput("");
                      }
                    }}
                    placeholder="Digite e aperte Enter"
                  />
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {info.suggestedTags
                  .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addTag(s)}
                      disabled={tags.length >= LIMITS.tags}
                      className="rounded-full border border-slate-900 px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:border-slate-700 hover:text-white disabled:opacity-40"
                    >
                      + {s}
                    </button>
                  ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className={labelClass}>Links extras <span className="normal-case text-slate-600">(GitHub, Spotify, loja...)</span></span>
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={cn(fieldClass, "w-36 shrink-0")}
                    value={l.label}
                    maxLength={30}
                    placeholder="Nome"
                    onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <input
                    className={fieldClass}
                    value={l.url}
                    type="url"
                    placeholder="https://"
                    onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))}
                  />
                  <button
                    type="button"
                    onClick={() => setLinks(links.filter((_, j) => j !== i))}
                    aria-label="Remover link"
                    className="shrink-0 rounded-xl border border-slate-800 px-3 text-slate-500 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {links.length < LIMITS.links && (
                <button
                  type="button"
                  onClick={() => setLinks([...links, { label: "", url: "" }])}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar link
                </button>
              )}
            </div>

            <div className="space-y-3 border-t border-slate-900 pt-6">
              {errors.length > 0 && (title || summary || url) && (
                <ul className="space-y-1 text-xs font-semibold text-amber-400">
                  {errors.map((e) => (
                    <li key={e}>• {e}</li>
                  ))}
                </ul>
              )}
              <button
                type="submit"
                disabled={submitting || errors.length > 0}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white text-sm font-extrabold text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
              >
                <Send className="h-4 w-4" />
                {submitting
                  ? "Salvando..."
                  : !editing
                    ? "Enviar para análise"
                    : editing.status === "refused"
                      ? "Salvar e reenviar"
                      : "Salvar alterações"}
              </button>
            </div>
          </form>

          {/* Live preview */}
          <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
            <span className={labelClass}>Prévia do card</span>
            {previewProject && (
              <div className="pointer-events-none select-none">
                <ProjectCard project={previewProject} />
              </div>
            )}
            <p className="text-[11px] text-slate-500">É assim que seu projeto vai aparecer na página inicial.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
