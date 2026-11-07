import Home from "@/views/Home";
import { tabFromSlug } from "@/lib/projectTypes";
import { fetchJson, getServerApiUrl } from "@/lib/api";
import type { Bot, EventData, Project } from "@/lib/types";

// Lists and votes change often; cache API responses on the server for at most a minute.
const REVALIDATE_SECONDS = 60;

async function loadInitialData() {
  const apiUrl = getServerApiUrl();
  const opts = { next: { revalidate: REVALIDATE_SECONDS } };
  const asArray = <T,>(data: T[]) => (Array.isArray(data) ? data : null);

  const [bots, projects, event] = await Promise.all([
    fetchJson<Bot[]>(`${apiUrl}/api/public/bots`, opts).then(asArray).catch(() => null),
    fetchJson<Project[]>(`${apiUrl}/api/public/projects`, opts).then(asArray).catch(() => null),
    fetchJson<EventData>(`${apiUrl}/api/public/event`, opts).catch(() => null),
  ]);

  return { bots, projects, event };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ bots, projects, event }, { tab }] = await Promise.all([loadInitialData(), searchParams]);

  // Anything the server couldn't load (null) is retried by the client, with an error state if that fails too.
  return <Home initialBots={bots} initialProjects={projects} initialEvent={event} initialTab={tabFromSlug(tab)} />;
}
