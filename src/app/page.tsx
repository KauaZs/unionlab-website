"use client";

import { useState, useEffect } from "react";
import Home from "@/views/Home";
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
}

interface EventData {
  active: boolean;
  key: string;
  type: string;
  name: string;
  multiplier: number;
  progress?: {
    current: number;
    target: number;
  } | null;
}

export default function HomePage() {
  const { isMobileMenuOpen } = useApp();
  const [bots, setBots] = useState<Bot[]>([]);
  const [search, setSearch] = useState("");
  const [loadingBots, setLoadingBots] = useState(true);
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);

  useEffect(() => {
    setLoadingBots(true);
    fetch("/api/public/bots")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBots(data as Bot[]);
        setLoadingBots(false);
      })
      .catch((err) => {
        console.error("Error loading bots:", err);
        setLoadingBots(false);
      });

    fetch("/api/public/event")
      .then((res) => res.json())
      .then((data) => setActiveEvent(data as EventData))
      .catch((err) => console.error("Error loading event:", err));
  }, []);

  return (
    <Home
      bots={bots}
      search={search}
      onSearchChange={setSearch}
      loadingBots={loadingBots}
      activeEvent={activeEvent}
      onBotClick={(id) => {
        window.location.href = `/bot/${id}`;
      }}
    />
  );
}
