"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

export default function HelpFAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "Como funciona o sistema de votos?",
      answer: "O sistema de votos ajuda a promover bots em nossa comunidade. Qualquer usuário logado pode votar em um bot uma vez a cada 5 horas (cooldown padrão). Usuários com cargos VIP no servidor do Discord desfrutam de tempos de espera reduzidos e votos extras por clique."
    },
    {
      question: "O que são Unicoins e para que servem?",
      answer: "Unicoins são as moedas virtuais oficiais da nossa rede. Ao votar em bots pelo site ou participar dos quizzes e eventos do chat, você acumula Unicoins. Elas podem ser usadas para comprar banners exclusivos, badges personalizados no seu perfil e outras recompensas em nosso servidor do Discord."
    },
    {
      question: "Como funcionam as Streaks de Voto?",
      answer: "A Streak é o seu contador de votos consecutivos dia após dia. Se você votar hoje e votar novamente amanhã, sua streak aumenta em +1. Se passar um dia inteiro sem votar, sua streak será dada como perdida (encerrada com uma data final) e um novo contador de streak será criado no seu próximo voto."
    },
    {
      question: "Como faço para cadastrar meu próprio bot na Union?",
      answer: "Para adicionar um bot, você deve usar o comando de adicionar bot no nosso servidor do Discord. Após isso, nossa equipe de verificadores/checkers analisará as funcionalidades e a segurança do seu bot. Uma vez aprovado por eles, seu bot aparecerá automaticamente aqui no site para receber votos de toda a comunidade!"
    }
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Title */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xl mx-auto">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-blue-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
          Central de Dúvidas
        </h1>
        <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
          Tire suas principais dúvidas sobre o funcionamento de moedas, cooldowns, aprovações de bots e streaks.
        </p>
      </div>

      {/* FAQ items list */}
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <Card 
              key={index} 
              className={`cursor-pointer overflow-hidden border-slate-900 bg-slate-950/10 transition-all duration-200 ${
                isOpen ? "border-blue-500/20 shadow-lg shadow-blue-500/[0.02]" : "hover:border-slate-800/80"
              }`}
              onClick={() => toggleFAQ(index)}
            >
              <CardHeader className="p-5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <HelpCircle className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isOpen ? "text-blue-400" : "text-slate-500"}`} />
                  <CardTitle className="text-sm font-bold text-slate-200 leading-snug">
                    {faq.question}
                  </CardTitle>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-blue-400" : "rotate-0"
                }`} />
              </CardHeader>
              
              {isOpen && (
                <CardContent className="px-5 pb-5 pt-0 text-xs md:text-sm text-slate-400 leading-relaxed border-t border-slate-900/50 mt-2.5">
                  <p className="pt-4">{faq.answer}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
