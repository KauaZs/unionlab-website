import type { ReactNode } from "react";
import { AlertTriangle, RotateCw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortOption<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

export function SortTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: SortOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-900 bg-zinc-950/60 p-1">
      {options.map((o) => {
        const Icon = o.icon;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200",
              value === o.id ? "bg-white text-black shadow-md" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">{children}</h2>
      {action}
    </div>
  );
}

/** Loading skeleton, error with retry, empty state, or the grid itself. */
export function GridState({
  loading,
  error,
  onRetry,
  isEmpty,
  emptyMessage,
  onClearFilters,
  skeletonHeight = 268,
  children,
}: {
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  isEmpty: boolean;
  emptyMessage: string;
  onClearFilters?: () => void;
  skeletonHeight?: number;
  children: ReactNode;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ height: skeletonHeight }} className="animate-pulse rounded-2xl border border-slate-900 bg-zinc-950/60" />
        ))}
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <div className="space-y-1">
          <p className="font-bold text-white">Não foi possível carregar.</p>
          <p className="text-sm text-slate-500">Nossos servidores podem estar instáveis. Tente novamente em instantes.</p>
        </div>
        <button
          onClick={onRetry}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-white px-4 text-xs font-bold text-black transition-colors hover:bg-zinc-200"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Tentar novamente
        </button>
      </div>
    );
  }
  if (isEmpty) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="font-medium text-slate-500">{emptyMessage}</p>
        {onClearFilters && (
          <button onClick={onClearFilters} className="text-xs font-bold text-white underline underline-offset-4">
            Limpar filtros
          </button>
        )}
      </div>
    );
  }
  return <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{children}</div>;
}

export function matchesSearch(query: string, fields: (string | undefined | null)[]) {
  if (!query) return true;
  return fields.some((f) => normalize(f ?? "").includes(query));
}

export function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}
