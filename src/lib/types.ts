export interface Bot {
  id: string;
  username: string;
  avatar: string | null;
  prefix: string;
  language: string;
  description: string;
  votes: number;
  rating?: number;
  feedbackCount?: number;
  tags?: string[];
  /** When the bot was listed on Union Lab (ISO date). */
  addedAt?: string;
}

export interface EventData {
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

export type ProjectType = "website" | "game" | "music" | "other";

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  id: string;
  type: ProjectType;
  title: string;
  summary: string;
  description: string;
  url: string;
  links: ProjectLink[];
  coverImage: string | null;
  screenshots: string[];
  tags: string[];
  ownerId: string;
  ownerName: string | null;
  ownerAvatar: string | null;
  status: "pending" | "approved" | "refused";
  votes: number;
  addedAt: string;
  /** Only on /projects/mine. */
  refusedReason?: string | null;
}
