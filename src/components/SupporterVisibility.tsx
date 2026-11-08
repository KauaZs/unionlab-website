"use client";

import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { fetchJson } from "@/lib/api";
import { cn } from "@/lib/utils";

interface VipStatus {
  active: boolean;
  vipType?: number;
  showAsSupporter?: boolean;
}

/** Lets an active UNION+ subscriber choose whether the wall and badge show them. Hidden for everyone else. */
export default function SupporterVisibility({
  authToken,
  showToast,
}: {
  authToken: string;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}) {
  const [visible, setVisible] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchJson<VipStatus>("/api/public/vip/status", { headers: { Authorization: `Bearer ${authToken}` } })
      .then((s) => {
        if (s.active && s.vipType === 1) setVisible(s.showAsSupporter !== false);
      })
      .catch((err) => console.error("Error loading VIP status:", err));
  }, [authToken]);

  if (visible === null) return null;

  const toggle = async () => {
    const next = !visible;
    setSaving(true);
    setVisible(next);
    try {
      await fetchJson("/api/public/users/supporter-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
        body: JSON.stringify({ visible: next }),
      });
      showToast(next ? "Você aparece como apoiador UNION+." : "Você não aparece mais como apoiador.", "success");
    } catch {
      setVisible(!next);
      showToast("Não foi possível salvar sua preferência.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-5">
      <div className="flex items-start gap-3">
        <Crown className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
        <div>
          <p className="text-sm font-bold text-slate-200">Mostrar que sou apoiador UNION+</p>
          <p className="mt-0.5 text-xs text-slate-500">Exibe seu nome no mural da página VIP e o selo UNION+ pelo site.</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={visible}
        aria-label="Mostrar que sou apoiador UNION+"
        onClick={toggle}
        disabled={saving}
        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60", visible ? "bg-blue-400" : "bg-slate-700")}
      >
        <span className={cn("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", visible && "translate-x-5")} />
      </button>
    </div>
  );
}
