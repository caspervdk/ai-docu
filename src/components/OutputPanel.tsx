import React from "react";
import { WandSparkles } from "lucide-react";

type OutputPanelProps = {
  title?: string;
  content: string;
  emptyText?: string;
};

export function OutputPanel({ title = "AI summary", content, emptyText = "Results will appear here." }: OutputPanelProps) {
  const raw = (content || "").trim();
  let isEmpty = raw.length === 0;

  let displayValue = raw;
  let jsonPretty: string | null = null;

  // Try to parse JSON and extract useful content
  if (!isEmpty && (raw.startsWith("{") || raw.startsWith("["))) {
    try {
      const parsed = JSON.parse(raw);
      const extracted = parsed && !Array.isArray(parsed) && typeof parsed === "object" && ("output" in parsed)
        ? (parsed as any).output
        : parsed;
      if (typeof extracted === "string") {
        displayValue = extracted.trim();
      } else {
        jsonPretty = JSON.stringify(extracted, null, 2);
      }
    } catch {
      // fall back to non-JSON handling below
    }
  }

  // Remove the word "output" from any text content (case-insensitive)
  if (!jsonPretty) {
    displayValue = displayValue.replace(/\boutput\b/gi, "").trim();
    isEmpty = displayValue.length === 0;
  }

  // Fallback to line list
  const lines = !isEmpty && !jsonPretty ? displayValue.split(/\n+/).map((l) => l.trim()).filter(Boolean) : [];

  return (
    <section aria-label="AI summary" className="animate-fade-in">
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
            <p className="text-sm leading-7 text-foreground whitespace-pre-wrap">{displayValue}</p>
          )}
        </div>
      </div>
    </section>
  );
}
