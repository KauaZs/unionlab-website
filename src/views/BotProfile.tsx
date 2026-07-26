"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, ShieldAlert, ExternalLink, Calendar, Star, Info, User, Trash2 } from "lucide-react";
import Stars from "../components/Stars";
import ReCaptcha from "../components/ReCaptcha";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

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
}

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
}: BotProfileProps) {
  const router = useRouter();
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const existingFeedback = feedbacks.find(f => f.userId === user?.id);

  useEffect(() => {
    if (existingFeedback) {
      onRatingChange(existingFeedback.rating);
      onCommentChange(existingFeedback.comment);
    } else {
      onRatingChange(5);
      onCommentChange("");
    }
  }, [existingFeedback]);

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
          <div className="flex flex-col items-center sm:items-start gap-3.5 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-white font-sans">
              {botDetail.username}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <Badge variant="default">
                {botDetail.language}
              </Badge>
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
          <CardContent className="px-6 pb-6 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {botDetail.description}
          </CardContent>
        </Card>

        {/* Feedback Section */}
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
              <p className="text-center py-8 text-slate-600 text-sm font-medium">
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
                        <span>{new Date(fb.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Column */}
      <div className="space-y-6">
        
        {/* Main CTA */}
        {user ? (
          <div className="space-y-3">
            {recaptchaSiteKey && !voteCooldownText && (
              <ReCaptcha
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
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
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
    </div>
  );
}
