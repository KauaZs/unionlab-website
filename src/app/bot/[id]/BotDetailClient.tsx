"use client";

import { useState, useEffect, use } from "react";
import BotProfile from "@/views/BotProfile";
import { useApp } from "@/context/AppContext";

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

export default function BotDetailClient({ params }: { params: Promise<{ id: string }> }) {
  const { id: botId } = use(params);
  const { user, authToken, showToast, showCelebration, recaptchaSiteKey } = useApp();

  const [botDetail, setBotDetail] = useState<Bot | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [voteCooldownText, setVoteCooldownText] = useState<string | null>(null);
  const [cooldownExpires, setCooldownExpires] = useState<number | null>(null);

  // Feedback Form State
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const fetchBot = () => {
    if (!botId) return;
    setLoadingDetail(true);

    const fetchDetail = fetch(`/api/public/bots/${botId}`).then((res) => {
      if (!res.ok) throw new Error("Bot não encontrado");
      return res.json();
    });

    const fetchFeedbacks = fetch(`/api/public/bots/${botId}/feedbacks`).then((res) => res.json());

    Promise.all([fetchDetail, fetchFeedbacks])
      .then(([botData, fbData]) => {
        setBotDetail(botData as Bot);
        setFeedbacks(fbData as Feedback[]);
        setLoadingDetail(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingDetail(false);
      });
  };

  useEffect(() => {
    fetchBot();
  }, [botId]);

  // Cooldown Countdown Timer
  useEffect(() => {
    if (!cooldownExpires) {
      setVoteCooldownText(null);
      return;
    }

    const updateTimer = () => {
      const remaining = cooldownExpires - Date.now();
      if (remaining <= 0) {
        setVoteCooldownText(null);
        setCooldownExpires(null);
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setVoteCooldownText(
          `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cooldownExpires]);

  const handleVote = async (captchaToken?: string | null) => {
    if (!authToken || !botDetail) return;

    try {
      const res = await fetch(`/api/public/bots/${botDetail.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ captchaToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Falha ao registrar voto.", "error");
        if (data.cooldownExpiresAt) {
          setCooldownExpires(data.cooldownExpiresAt);
        }
        return;
      }

      showCelebration(
        "Voto Computado! 🔥",
        `Seu voto no bot ${botDetail.username} foi registrado com sucesso!`,
        `+${data.coinsEarned ?? data.coins ?? 0} Unicoins`,
        data.streakInfo?.message ?? data.streakMessage
      );

      if (data.cooldownExpiresAt) {
        setCooldownExpires(data.cooldownExpiresAt);
      }

      // Refresh bot details
      fetchBot();
    } catch (err) {
      console.error(err);
      showToast("Erro de conexão ao votar.", "error");
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !botDetail) return;

    setSubmittingFeedback(true);
    setFeedbackError(null);

    try {
      const res = await fetch(`/api/public/bots/${botDetail.id}/feedbacks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackError(data.error || "Erro ao enviar avaliação.");
        setSubmittingFeedback(false);
        return;
      }

      showToast("Avaliação enviada com sucesso!", "success");
      setNewComment("");
      setSubmittingFeedback(false);
      fetchBot();
    } catch (err) {
      console.error(err);
      setFeedbackError("Erro de comunicação ao enviar avaliação.");
      setSubmittingFeedback(false);
    }
  };

  const handleEditFeedback = async (rating: number, comment: string) => {
    if (!authToken || !botDetail) return;

    try {
      const res = await fetch(`/api/public/bots/${botDetail.id}/feedbacks`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ rating, comment }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao atualizar avaliação.", "error");
        return;
      }

      showToast("Avaliação atualizada!", "success");
      fetchBot();
    } catch (err) {
      console.error(err);
      showToast("Erro ao editar avaliação.", "error");
    }
  };

  const handleDeleteFeedback = async () => {
    if (!authToken || !botDetail) return;

    try {
      const res = await fetch(`/api/public/bots/${botDetail.id}/feedbacks`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Erro ao deletar avaliação.", "error");
        return;
      }

      showToast("Avaliação removida.", "info");
      fetchBot();
    } catch (err) {
      console.error(err);
      showToast("Erro ao deletar avaliação.", "error");
    }
  };

  if (loadingDetail || !botDetail) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="w-10 h-10 border-4 border-slate-900 border-b-white rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <BotProfile
      botDetail={botDetail}
      feedbacks={feedbacks}
      user={user}
      voteCooldownText={voteCooldownText}
      onVote={handleVote}
      newRating={newRating}
      onRatingChange={setNewRating}
      newComment={newComment}
      onCommentChange={setNewComment}
      feedbackError={feedbackError}
      submittingFeedback={submittingFeedback}
      onSubmitFeedback={handleSubmitFeedback}
      onEditFeedback={handleEditFeedback}
      onDeleteFeedback={handleDeleteFeedback}
      recaptchaSiteKey={recaptchaSiteKey}
    />
  );
}
