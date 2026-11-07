import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";

// react-markdown never renders raw HTML from the source, so user content is safe here.

const fullComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-sky-400 underline underline-offset-2 hover:text-sky-300">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc ml-5 my-2 space-y-0.5 text-slate-400">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal ml-5 my-2 space-y-0.5 text-slate-400">{children}</ol>,
  h1: ({ children }) => <h3 className="text-base font-extrabold text-white mt-3 mb-1">{children}</h3>,
  h2: ({ children }) => <h3 className="text-base font-extrabold text-white mt-3 mb-1">{children}</h3>,
  h3: ({ children }) => <h4 className="text-sm font-extrabold text-white mt-3 mb-1">{children}</h4>,
  blockquote: ({ children }) => <blockquote className="border-l-2 border-slate-700 pl-3 my-2 text-slate-400">{children}</blockquote>,
  pre: ({ children }) => (
    <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto my-2 [&_code]:bg-transparent [&_code]:border-0 [&_code]:p-0 [&_code]:text-slate-300">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="bg-slate-900 border border-slate-800/80 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-[11px]">{children}</code>
  ),
};

// Single-line preview (e.g. latest changelog): inline formatting only, block elements flattened.
const inlineComponents: Components = {
  ...fullComponents,
  p: ({ children }) => <>{children} </>,
  ul: ({ children }) => <>{children}</>,
  ol: ({ children }) => <>{children}</>,
  li: ({ children }) => <>• {children} </>,
  h1: ({ children }) => <>{children} </>,
  h2: ({ children }) => <>{children} </>,
  h3: ({ children }) => <>{children} </>,
  blockquote: ({ children }) => <>{children}</>,
  pre: ({ children }) => <>{children}</>,
  br: () => <> </>,
  code: ({ children }) => (
    <code className="bg-slate-900 border border-slate-800/80 px-1 py-0.5 rounded text-cyan-400 font-mono text-[10px]">{children}</code>
  ),
};

interface MarkdownProps {
  children: string;
  className?: string;
  /** Render on a single line (for truncated previews). */
  inline?: boolean;
}

export default function Markdown({ children, className, inline }: MarkdownProps) {
  if (inline) {
    return (
      <span className={className}>
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={inlineComponents}>
          {children}
        </ReactMarkdown>
      </span>
    );
  }
  return (
    <div className={cn("break-words", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]} components={fullComponents}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
