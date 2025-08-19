import React, { useState } from "react";
import { WandSparkles, Copy, Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type OutputPanelProps = {
  title?: string;
  content: string;
  emptyText?: string;
};

export function OutputPanel({ title = "AI summary", content, emptyText = "Results will appear here." }: OutputPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();
  
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

  const handleCopy = async () => {
    const textToCopy = jsonPretty || displayValue;
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy text to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleEdit = () => {
    setEditedContent(jsonPretty || displayValue);
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you could add logic to save the edited content
    // For now, we'll just update the display
    setIsEditing(false);
    toast({
      title: "Saved!",
      description: "Changes saved successfully",
      duration: 2000,
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent("");
  };

  return (
    <section aria-label={title} className="animate-fade-in">
      <div className="rounded-2xl border border-primary/20 bg-gradient-subtle p-4 sm:p-6 shadow-sm">
        <header className="mb-3 flex items-center justify-between text-primary">
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-primary/30 p-1">
              <WandSparkles className="h-4 w-4" aria-hidden="true" />
            </div>
            <h3 className="text-xs font-semibold tracking-wide uppercase">{title}</h3>
          </div>
          {!isEmpty && (
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSave}
                    className="h-7 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="h-7 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 px-2 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-7 px-2 text-xs"
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          )}
        </header>

        <div className="max-h-80 overflow-y-auto rounded-xl bg-background/60 p-4">
          {isEmpty ? (
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          ) : isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] resize-none text-sm"
              placeholder="Edit your text here..."
            />
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
