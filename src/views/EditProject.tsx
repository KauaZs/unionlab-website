"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PublishProject from "./PublishProject";
import { useApp } from "@/context/AppContext";
import { fetchJson } from "@/lib/api";
import type { Project } from "@/lib/types";

/** Loads one of the user's own projects (any status) and opens the form in edit mode. */
export default function EditProject({ id }: { id: string }) {
  const { user, authToken } = useApp();
  const [project, setProject] = useState<Project | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "notfound" | "error">("loading");

  useEffect(() => {
    if (!authToken) return;
    fetchJson<Project[]>("/api/public/projects/mine", { headers: { Authorization: `Bearer ${authToken}` } })
      .then((list) => {
        const found = list.find((p) => p.id === id) ?? null;
        setProject(found);
        setState(found ? "ready" : "notfound");
      })
      .catch(() => setState("error"));
  }, [authToken, id]);

  // Not logged in: the form shows its own login prompt.
  if (!user || !authToken) return <PublishProject initialType={null} />;

  if (state === "loading") {
    return <div className="h-64 animate-pulse rounded-3xl bg-zinc-950/60" />;
  }
  if (state !== "ready" || !project) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-lg font-bold text-white">
          {state === "notfound" ? "Você não pode editar este projeto" : "Não foi possível carregar o projeto"}
        </p>
        <Link href="/profile" className="text-xs font-bold text-white underline underline-offset-4">
          Ver meus projetos
        </Link>
      </div>
    );
  }
  return <PublishProject initialType={project.type} editing={project} />;
}
