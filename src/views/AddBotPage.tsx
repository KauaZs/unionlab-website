"use client";

import React, { useState } from "react";
import { Bot, Send, Cpu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface AddBotPageProps {
  user: {
    id: string;
    username: string;
    avatar: string | null;
    unicoins: number;
  } | null;
  onUpdateUser: () => void;
  showToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AddBotPage({ user, onUpdateUser, showToast }: AddBotPageProps) {
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [botId, setBotId] = useState("");
  const [prefix, setPrefix] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("javascript");

  const supportedLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c#", label: "C#" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "php", label: "PHP" },
    { value: "c++", label: "C++" },
    { value: "rust", label: "Rust" },
    { value: "bdfd", label: "BDFD" },
    { value: "bdscript", label: "BDScript" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    // Client-side validations
    if (!/^\d{17,19}$/.test(botId)) {
      showToast("ID do Bot deve conter entre 17 e 19 caracteres numéricos.", "error");
      return;
    }

    if (prefix.length < 1 || prefix.length > 3) {
      showToast("O prefixo deve conter entre 1 e 3 caracteres.", "error");
      return;
    }

    if (description.length < 5 || description.length > 400) {
      showToast("A descrição deve ter entre 5 e 400 caracteres.", "error");
      return;
    }

    setSubmitting(true);
    fetch("/api/public/bots/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        botId,
        prefix,
        description,
        language,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao adicionar bot");
        return data;
      })
      .then(() => {
        showToast("Bot enviado para análise com sucesso!", "success");
        onUpdateUser();
        // Clear fields
        setBotId("");
        setPrefix("");
        setDescription("");
        setLanguage("javascript");
      })
      .catch((err: any) => {
        showToast(err.message || "Erro ao enviar solicitação.", "error");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 py-12">
        <div className="w-16 h-16 rounded-full bg-zinc-950 border border-slate-900 flex items-center justify-center mx-auto shadow-md">
          <Bot className="w-8 h-8 text-zinc-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Login Necessário</h2>
          <p className="text-slate-400 text-xs leading-relaxed">
            Você precisa estar logado com o Discord para poder adicionar novos bots à lista.
          </p>
        </div>
        <Button
          onClick={() => {
            localStorage.setItem("redirect_target", window.location.hash);
            window.location.href = "/api/auth/login";
          }}
          variant="premium"
          className="w-full h-10 font-bold text-xs"
        >
          Entrar com o Discord
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-lg mx-auto">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-md">
          <Cpu className="w-5 h-5 text-indigo-500" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Adicionar Novo Bot
        </h1>
        <p className="text-slate-400 text-sm leading-normal">
          Cadastre seu bot no Union Bot List. Ele será submetido à equipe de análise antes de aparecer na home.
        </p>
      </div>

      <Card className="border border-slate-900 bg-slate-950/10">
        <CardHeader className="p-6">
          <CardTitle className="text-base font-bold text-slate-200">Formulário de Cadastro</CardTitle>
          <CardDescription className="text-xs">
            Preencha todos os campos obrigatórios.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ID do Bot */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ID do Bot</label>
              <Input
                type="text"
                placeholder="Ex: 1037820166274297856"
                value={botId}
                onChange={(e) => setBotId(e.target.value)}
                disabled={submitting}
                required
                maxLength={19}
              />
              <span className="block text-[9px] text-slate-500 font-bold">
                Você pode obter o ID nas configurações de desenvolvedor do Discord (Developer Portal).
              </span>
            </div>

            {/* Prefixo & Linguagem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prefixo</label>
                <Input
                  type="text"
                  placeholder="Ex: u."
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  disabled={submitting}
                  required
                  maxLength={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Linguagem Principal</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={submitting}
                  className="w-full h-9 rounded-xl border border-slate-900 bg-slate-950 px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-slate-800 transition-all duration-200"
                >
                  {supportedLanguages.map((lang) => (
                    <option key={lang.value} value={lang.value} className="bg-slate-950 text-slate-200">
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição Curta</label>
              <textarea
                placeholder="Ex: Um bot de moderação avançado com economia e música (mín. 5, máx. 400 caracteres)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                required
                maxLength={400}
                rows={4}
                className="w-full rounded-xl border border-slate-900 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-slate-800 transition-all duration-200 resize-none"
              />
              <div className="flex justify-between text-[9px] text-slate-500 font-bold">
                <span>Não utilize formatação Markdown ou links.</span>
                <span>{description.length}/400</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="premium"
              className="w-full h-10 text-xs font-bold"
              disabled={submitting || botId.length < 17 || prefix.length < 1 || description.length < 5}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              {submitting ? "Enviando..." : "Enviar Solicitação"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
