import React from "react";
import { WandSparkles } from "lucide-react";

type OutputPanelProps = {
  title?: string;
  content: string;
  emptyText?: string;
};

export function OutputPanel({ title = "AI Analysis", content, emptyText = "Results will appear here." }: OutputPanelProps) {
  const value = (content || "").trim();
  const isEmpty = value.length === 0;

  // Try JSON pretty print
  let jsonPretty: string | null = null;
  if (!isEmpty && (value.startsWith("{") || value.startsWith("["))) {
    try {
      jsonPretty = JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      jsonPretty = null;
    }
  }

  // Fallback to line list
  const lines = !isEmpty && !jsonPretty ? value.split(/\n+/).map((l) => l.trim()).filter(Boolean) : [];

  return (
    <section aria-label="AI output" className="animate-fade-in">
      <div className="rounded-2xl border border-primary/20 bg-gradient-subtle p-4 sm:p-6 shadow-sm">
        <header className="mb-3 flex items-center gap-2 text-primary">
          <div className="rounded-full border border-primary/30 p-1">
            <WandSparkles className="h-4 w-4" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-semibold tracking-wide uppercase">{title}</h3>
        </header>

        <div className="max-h-80 overflow-y-auto rounded-xl bg-background/60 p-4">
          {isEmpty ? (
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          ) : jsonPretty ? (
            <pre className="text-sm leading-6 whitespace-pre-wrap text-foreground">
              {jsonPretty}
            </pre>
          ) : lines.length > 1 ? (
            <ol className="ml-5 list-decimal space-y-2 text-sm leading-7 text-foreground">
              {lines.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ol>
          ) : (
            <p className="text-sm leading-7 text-foreground whitespace-pre-wrap">{value}</p>
          )}
        </div>
      </div>
    </section>
  );
}
