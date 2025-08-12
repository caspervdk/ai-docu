import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Languages, ShieldAlert, Bug, Save, Share2, User2, Rocket, Files, BarChart3, Menu, EyeOff, Table, FileDiff, Presentation, MessageSquare, WandSparkles, FileSearch, Check, Folder, Users, Clock, Star, Trash2, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useRef, useEffect } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatDistanceToNow } from "date-fns";

type Tool = {
  icon: LucideIcon;
  title: string;
  desc: string;
  proOnly: boolean;
  cta?: string;
};

const tools: readonly Tool[] = [
  { icon: FileText, title: "Summarize Long Documents", desc: "Condense long docs into key points.", proOnly: false },
  { icon: Search, title: "Cross-Doc Linker", desc: "Find related documents and link supporting evidence.", proOnly: false },
  { icon: Languages, title: "Translate & Localize", desc: "Translate content and adapt for regions.", proOnly: false },
  { icon: ShieldAlert, title: "Contract Analysis & Risk Detection", desc: "Spot risks and clauses at a glance.", proOnly: true },
  { icon: Bug, title: "Smart Error Detection", desc: "Identify issues and suggest fixes.", proOnly: true },
  { icon: Files, title: "Merge documents", desc: "Combine multiple documents into a single file.", proOnly: true },
  { icon: BarChart3, title: "Analyze data from a file", desc: "Extract insights and metrics from your dataset.", proOnly: true },

  // New PRO tools
  { icon: EyeOff, title: "PII Redaction & Anonymization", desc: "Remove personal data and return a clean copy + audit log. Formats: PDF, DOCX, TXT, PNG/JPG (OCR)", proOnly: true, cta: "Redact my file" },
  { icon: Table, title: "Table & Invoice Extraction", desc: "Detect tables and export structured CSV/JSON (invoice no., date, totals, VAT). Formats: PDF, PNG/JPG, DOCX", proOnly: true, cta: "Extract tables" },
  { icon: FileDiff, title: "Version Diff & Change Summary", desc: "Compare two documents and generate a human-readable changelog. Formats: PDF, DOCX, TXT", proOnly: true, cta: "Compare versions" },
  { icon: Presentation, title: "Doc-to-Slides Generator", desc: "Turn a long document into presentation slides with notes. Formats: DOCX, PDF, TXT → PPTX/Google Slides", proOnly: true, cta: "Create slides" },
  { icon: MessageSquare, title: "Ask-Your-Docs Q&A", desc: "Chat with documents; answers include citations. Formats: PDF, DOCX, TXT, HTML", proOnly: true, cta: "Start Q&A" },
  { icon: WandSparkles, title: "Data Cleaning & Normalization", desc: "Fix missing values, outliers, duplicates; standardize columns. Formats: CSV, XLS/XLSX", proOnly: true, cta: "Clean my data" },
  { icon: FileSearch, title: "Clause Finder & Policy Checker", desc: "Locate key clauses and score against a checklist. Formats: PDF, DOCX, TXT", proOnly: true, cta: "Scan for clauses" },
] as const;

const Dashboard = () => {
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState<(typeof tools)[number] | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [docName, setDocName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [docs, setDocs] = useState<{ name: string; url: string; updatedAt?: string }[]>([]);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [trashDocs, setTrashDocs] = useState<{ name: string; url: string; updatedAt?: string }[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);
  const [lastSavedPair, setLastSavedPair] = useState<{ original?: { name: string; url: string }; output?: { name: string; url: string } } | null>(null);
  const [proPromptTool, setProPromptTool] = useState<(typeof tools)[number] | null>(null);
  const [translateLang, setTranslateLang] = useState("en->nl");
  const [isDragActive, setIsDragActive] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const handleClose = () => {
    setActiveTool(null);
    setInput("");
    setOutput("");
    setSelectedFile(null);
    setIsSending(false);
    setDocName("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);
    if (f && activeTool?.title === "Cross-Doc Linker") {
      await summarizeWithAI(f);
    }
  };
  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchDocs = async () => {
      if (!userId) { setDocs([]); setTrashDocs([]); return; }
      // Root (Recent)
      const { data: files, error } = await supabase.storage
        .from('documents')
        .list(userId, { limit: 50, sortBy: { column: 'updated_at', order: 'desc' } });
      if (error || !files) { setDocs([]); } else {
        const visible = (files || []).filter((f: any) => f.name && f.name !== 'trash' && !f.name.endsWith('/'));
        const items = await Promise.all(visible.map(async (f: any) => {
          const path = `${userId}/${f.name}`;
          const { data: signed } = await supabase.storage.from('documents').createSignedUrl(path, 600);
          return { name: f.name, url: signed?.signedUrl || '#', updatedAt: f.updated_at || f.created_at };
        }));
        setDocs(items);
      }

      // Trash
      const { data: tFiles } = await supabase.storage
        .from('documents')
        .list(`${userId}/trash`, { limit: 50, sortBy: { column: 'updated_at', order: 'desc' } });
      const tItems = await Promise.all((tFiles || []).map(async (f: any) => {
        const path = `${userId}/trash/${f.name}`;
        const { data: signed } = await supabase.storage.from('documents').createSignedUrl(path, 600);
        return { name: f.name, url: signed?.signedUrl || '#', updatedAt: f.updated_at || f.created_at };
      }));
      setTrashDocs(tItems);
    };
    fetchDocs();
  }, [userId]);
  const summarizeWithAI = async (overrideFile?: File) => {
    const file = overrideFile ?? selectedFile;
    if (!file && !input.trim()) {
      setOutput("Please provide text or upload a document.");
      return;
    }
    try {
      setIsSending(true);
      setOutput("Sending to AI...");
      const fd = new FormData();
      if (file) {
        fd.append("file", file, file.name);
      }
      if (activeTool?.title) fd.append("action", activeTool.title);
      if (input) fd.append("message", input);
      if (activeTool?.title === "Translate & Localize" && translateLang) fd.append("language", translateLang);

      const webhookUrl =
        activeTool?.title === "Cross-Doc Linker"
          ? "https://caspervdk.app.n8n.cloud/webhook/6f485cb7-524e-47e6-9c27-77e2af2486b3"
          : activeTool?.title === "Translate & Localize"
          ? "https://caspervdk.app.n8n.cloud/webhook/f820b429-b4a9-4331-b91b-ce89202c05cf"
          : "https://caspervdk.app.n8n.cloud/webhook/analyze-doc";

      const res = await fetch(webhookUrl, {
        method: "POST",
        body: fd,
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(text || `Webhook responded with ${res.status}`);
      setOutput(text || "Success (empty response)");
    } catch (err: any) {
      setOutput(err?.message || "Failed to send to AI.");
    } finally {
      setIsSending(false);
    }
  };

  // Send uploaded document to the Translate & Localize webhook and put response into Output
  const analyzeDocWithWebhook = async () => {
    const file = selectedFile;
    if (!file) { setOutput("Please select a file to upload."); return; }
    try {
      setIsSending(true);
      setOutput("Uploading for translation/localization...");
      const fd = new FormData();
      fd.append("file", file, file.name);
      fd.append("action", "Translate & Localize");
      if (input) fd.append("message", input);
      if (translateLang) fd.append("language", translateLang);

      const res = await fetch("https://caspervdk.app.n8n.cloud/webhook/analyze-doc", {
        method: "POST",
        body: fd,
      });

      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(text || `Webhook responded with ${res.status}`);
      setOutput(text || "Success (empty response)");
    } catch (err: any) {
      setOutput(err?.message || "Failed to send to AI.");
    } finally {
      setIsSending(false);
    }
  };

  // When on Translate & Localize: if a file is selected, send it; otherwise open the picker
  const handleUploadClick = async () => {
    if (activeTool?.title === "Translate & Localize") {
      if (!selectedFile) { triggerFileDialog(); return; }
      await analyzeDocWithWebhook();
    } else {
      triggerFileDialog();
    }
  };
const slugFileName = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/(^[.-]+|[.-]+$)/g, '');
  const saveOutput = async () => {
    if (!output.trim()) {
      toast({ title: "Nothing to save", description: "Run the tool to generate output first." });
      return;
    }
    if (!userId) {
      toast({ title: "Log in required", description: "Please log in to save documents." });
      return;
    }
    try {
      setIsSaving(true);
      const base = slugFileName(docName.trim());
      if (!base) {
        toast({ title: "Enter a file name", description: "Please provide a name before saving." });
        setIsSaving(false);
        return;
      }

      let originalEntry: { name: string; url: string; updatedAt?: string } | undefined;
      let outputEntry: { name: string; url: string; updatedAt?: string } | undefined;
      const newEntries: { name: string; url: string; updatedAt?: string }[] = [];

      const isPdfUpload = selectedFile && /\.pdf$/i.test(selectedFile.name);

      if (selectedFile && isPdfUpload) {
        // Create a single merged PDF: original + Appendix with AI output
        const origBytes = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(origBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        const fontSize = 12;
        const left = 50;
        const topPad = 50;
        const bottomPad = 50;
        const lineHeight = 16;
        const maxWidth = 500; // approx usable width on A4/Letter

        const wrapText = (txt: string) => {
          const words = txt.split(/\s+/);
          const lines: string[] = [];
          let line = "";
          for (const w of words) {
            const test = line ? `${line} ${w}` : w;
            if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
              line = test;
            } else {
              if (line) lines.push(line);
              line = w;
            }
          }
          if (line) lines.push(line);
          return lines;
        };

        const appendixHeader = "Appendix: AI Output";
        const appendixText = `${appendixHeader}\n\n${output}`;
        const lines = appendixText.split(/\n/).flatMap((l) => wrapText(l || " "));

        let i = 0;
        while (i < lines.length) {
          const page = pdfDoc.addPage();
          const { height } = page.getSize();
          let y = height - topPad;
          while (i < lines.length && y > bottomPad) {
            page.drawText(lines[i], { x: left, y, size: fontSize, font, color: rgb(0, 0, 0) });
            y -= lineHeight;
            i++;
          }
        }

        const mergedBytes = await pdfDoc.save();
        const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });
        const outputFilename = base.endsWith('.pdf') ? base : `${base}.pdf`;
        const outputPath = `${userId}/${outputFilename}`;
        const { error: outputErr } = await supabase.storage
          .from('documents')
          .upload(outputPath, mergedBlob, { contentType: 'application/pdf', upsert: false });
        if (outputErr) throw outputErr;
        const { data: outputSigned } = await supabase.storage
          .from('documents')
          .createSignedUrl(outputPath, 600);

        // Also save the original upload as-is for reference
        try {
          const originalName = slugFileName(selectedFile.name);
          const originalPath = `${userId}/${originalName}`;
          const { error: originalErr } = await supabase.storage
            .from('documents')
            .upload(originalPath, selectedFile, { upsert: false });
          if (originalErr) {
            toast({ title: 'Original file not saved', description: originalErr.message, variant: 'destructive' } as any);
          } else {
            const { data: originalSigned } = await supabase.storage
              .from('documents')
              .createSignedUrl(originalPath, 600);
            originalEntry = { name: originalName, url: originalSigned?.signedUrl || '#', updatedAt: new Date().toISOString() };
            newEntries.push(originalEntry);
          }
        } catch (origErr: any) {
          toast({ title: 'Original file not saved', description: origErr?.message || 'Unknown error' } as any);
        }

        outputEntry = { name: outputFilename, url: outputSigned?.signedUrl || '#', updatedAt: new Date().toISOString() };
        newEntries.push(outputEntry);
      } else {
        // Fallback: save AI output as a text file and optionally the original non-PDF
        const outputFilename = base.endsWith('.txt') ? base : `${base}.txt`;
        const outputPath = `${userId}/${outputFilename}`;
        const outputBlob = new Blob([output], { type: 'text/plain;charset=utf-8' });
        const { error: outputErr } = await supabase.storage
          .from('documents')
          .upload(outputPath, outputBlob, { contentType: 'text/plain', upsert: false });
        if (outputErr) throw outputErr;
        const { data: outputSigned } = await supabase.storage
          .from('documents')
          .createSignedUrl(outputPath, 600);

        // Save original if present
        if (selectedFile) {
          try {
            const originalName = slugFileName(selectedFile.name);
            const originalPath = `${userId}/${originalName}`;
            const { error: originalErr } = await supabase.storage
              .from('documents')
              .upload(originalPath, selectedFile, { upsert: false });
            if (originalErr) {
              toast({ title: 'Original file not saved', description: originalErr.message, variant: 'destructive' } as any);
            } else {
              const { data: originalSigned } = await supabase.storage
                .from('documents')
                .createSignedUrl(originalPath, 600);
              originalEntry = { name: originalName, url: originalSigned?.signedUrl || '#', updatedAt: new Date().toISOString() };
              newEntries.push(originalEntry);
            }
          } catch (origErr: any) {
            toast({ title: 'Original file not saved', description: origErr?.message || 'Unknown error' } as any);
          }
        }

        outputEntry = { name: outputFilename, url: outputSigned?.signedUrl || '#', updatedAt: new Date().toISOString() };
        newEntries.push(outputEntry);
      }

      setDocs((prev) => [...newEntries, ...prev]);
      setLastSavedPair({ original: originalEntry, output: outputEntry });
      toast({ title: 'Saved to My documents', description: `${newEntries.length} item(s) added` });
      handleClose();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'Could not save document.', variant: 'destructive' } as any);
    } finally {
      setIsSaving(false);
    }
  };
  const isPdf = (n: string) => /\.pdf$/i.test(n);
  const isImage = (n: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(n);

  const handleDocAction = async (
    action: 'view' | 'share' | 'delete' | 'delete-forever',
    doc: { name: string; url: string; updatedAt?: string },
    isTrash?: boolean
  ) => {
    if (action === 'view') {
      setPreviewDoc(doc);
      return;
    }
    if (action === 'share') {
      try {
        await navigator.clipboard.writeText(doc.url);
        toast({ title: 'Link copied', description: 'Signed link copied to clipboard.' });
      } catch (e) {
        window.open(doc.url, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    if (action === 'delete-forever') {
      if (!userId) {
        toast({ title: 'Log in required', description: 'Please log in to delete documents.' });
        return;
      }
      const confirmPermanent = window.confirm(`Permanently delete ${doc.name}? This cannot be undone.`);
      if (!confirmPermanent) return;

      const path = isTrash ? `${userId}/trash/${doc.name}` : `${userId}/${doc.name}`;
      const { error: removeError } = await supabase.storage.from('documents').remove([path]);
      if (removeError) {
        toast({ title: 'Could not delete', description: (removeError as any).message || 'Unknown error', variant: 'destructive' } as any);
        return;
      }

      if (isTrash) {
        setTrashDocs((prev) => prev.filter((d) => d.name !== doc.name));
      } else {
        setDocs((prev) => prev.filter((d) => d.name !== doc.name));
      }
      toast({ title: 'Deleted forever', description: doc.name });
      return;
    }

    if (action === 'delete') {
      if (!userId) {
        toast({ title: 'Log in required', description: 'Please log in to delete documents.' });
        return;
      }
      const confirmDelete = window.confirm(`Move ${doc.name} to Trash?`);
      if (!confirmDelete) return;
      const fromPath = `${userId}/${doc.name}`;
      let toName = doc.name;
      let toPath = `${userId}/trash/${toName}`;

      const tryMove = async (dst: string) => {
        return await supabase.storage.from('documents').move(fromPath, dst);
      };

      let { error: moveError } = await tryMove(toPath);
      if (moveError) {
        const msg = String((moveError as any).message || '').toLowerCase();
        if (msg.includes('exists')) {
          const dot = toName.lastIndexOf('.');
          const base = dot >= 0 ? toName.slice(0, dot) : toName;
          const ext = dot >= 0 ? toName.slice(dot) : '';
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          toName = `${base} (deleted ${stamp})${ext}`;
          toPath = `${userId}/trash/${toName}`;

          const { error: moveError2 } = await tryMove(toPath);
          if (moveError2) {
            toast({ title: 'Could not move to Trash', description: (moveError2 as any).message || 'Unknown error', variant: 'destructive' } as any);
            return;
          }
        } else {
          toast({ title: 'Could not move to Trash', description: (moveError as any).message || 'Unknown error', variant: 'destructive' } as any);
          return;
        }
      }

      setDocs((prev) => prev.filter((d) => d.name !== doc.name));
      const { data: trashSigned } = await supabase.storage
        .from('documents')
        .createSignedUrl(`${userId}/trash/${toName}`, 600);
      setTrashDocs((prev) => [{ name: toName, url: trashSigned?.signedUrl || '#', updatedAt: new Date().toISOString() }, ...prev]);
      toast({ title: 'Moved to Trash', description: toName });
    }
  };

const getPlaceholder = (title: string) => {
  switch (title) {
    case "Summarize Long Documents":
      return "Upload here your file you want to Summerize";
    case "Cross-Doc Linker":
      return "Provide text or keywords to find and link related evidence across documents...";
    case "Translate & Localize":
      return "Enter text to translate and the target locale (e.g., en->nl)...";
    case "Contract Analysis & Risk Detection":
      return "Paste clauses or contract excerpts to analyze risks...";
    case "Smart Error Detection":
      return "Paste content to scan for issues and suggestions...";
    case "Merge documents":
      return "Upload documents to merge and specify the desired order or rules...";
    case "Analyze data from a file":
      return "Upload a CSV/Excel file and describe what you want analyzed...";
    default:
      return "Enter your text...";
  }
};

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const DOC_QUOTA = 15;
  const usagePct = Math.min(100, Math.round((docs.length / DOC_QUOTA) * 100));

  return (
    <>
      <Helmet>
        <title>AI Tools Dashboard – DocMind AI</title>
        <meta name="description" content="Access AI tools for summarizing, rewriting, and generating content." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex items-center justify-between py-4">
          <h1 className="text-xl font-semibold">AI Tools</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden md:inline-flex"><Save className="mr-2 h-4 w-4" />Save</Button>
            <Button variant="outline" size="sm" className="hidden md:inline-flex"><Share2 className="mr-2 h-4 w-4" />Share</Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}><User2 className="mr-2 h-4 w-4" />Log out</Button>
          </div>
        </nav>
      </header>

      <div className="container grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-6">
        <aside className="space-y-6">
          <div>
            <Button className="w-full">+ New File</Button>
          </div>

          <nav className="space-y-2">
            <section aria-label="My Drive" className="rounded-lg border p-4">
              <div className="text-sm font-medium mb-2">My Drive</div>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="my-documents">
                  <AccordionTrigger className="justify-start gap-2">
                    <span className="inline-flex items-center"><Folder className="mr-2 h-4 w-4" /> My documents</span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in text-sm text-muted-foreground">
                    Access all files you’ve saved to My documents.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shared-with-me">
                  <AccordionTrigger className="justify-start gap-2">
                    <span className="inline-flex items-center"><Users className="mr-2 h-4 w-4" /> Shared with me</span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in text-sm text-muted-foreground">
                    Files others have shared with you.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="recent">
                  <AccordionTrigger className="justify-start gap-2">
                    <span className="inline-flex items-center"><Clock className="mr-2 h-4 w-4" /> Recent</span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in">
                    {docs.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No recent files.</div>
                    ) : (
                      <ul className="space-y-2">
                        {(docs.slice(0, 5)).map((d) => (
                          <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
                            <div className="min-w-0 flex-1">
                              <span className="block truncate" title={d.name}>{d.name}</span>
                              {d.updatedAt && (
                                <span className="block text-[11px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Options">
                                  <Menu className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="z-50">
                                <DropdownMenuItem onClick={() => handleDocAction('view', d)}>View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDocAction('share', d)}>Share</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDocAction('delete', d)}>Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="starred">
                  <AccordionTrigger className="justify-start gap-2">
                    <span className="inline-flex items-center"><Star className="mr-2 h-4 w-4" /> Starred</span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in text-sm text-muted-foreground">
                    Your favorites in one place.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trash">
                  <AccordionTrigger className="justify-start gap-2">
                    <span className="inline-flex items-center"><Trash2 className="mr-2 h-4 w-4" /> Trash</span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in">
                    {trashDocs.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No items in Trash.</div>
                    ) : (
                      <ul className="space-y-2">
                        {trashDocs.slice(0, 10).map((d) => (
                          <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
                            <div className="min-w-0 flex-1">
                              <span className="block truncate" title={d.name}>{d.name}</span>
                              {d.updatedAt && (
                                <span className="block text-[11px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Options">
                                  <Menu className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="z-50">
                                <DropdownMenuItem onClick={() => handleDocAction('view', d)}>View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDocAction('share', d)}>Share</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDocAction('delete-forever', d, true)}>Delete forever</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>
                        ))}
                      </ul>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="tags">
                  <AccordionTrigger className="justify-start gap-2">
                    <span className="inline-flex items-center"><Tags className="mr-2 h-4 w-4" /> Tags</span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in text-sm text-muted-foreground">
                    Organize and filter files with tags.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </nav>

          <section aria-label="Upgrade to Pro" className="rounded-xl border p-4 bg-gradient-subtle shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center rounded-md bg-primary/10 p-2 ring-1 ring-primary/20">
                  <Rocket className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm font-medium">Pro features</div>
                <Badge variant="secondary">PRO</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Unlock all tools and higher limits.</p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />All PRO tools</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />Higher limits & faster processing</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />Priority support</li>
            </ul>
            <Button variant="pro" size="sm" className="w-full mt-3" onClick={() => navigate("/#pricing")}>
              <Rocket className="size-4 mr-2" aria-hidden="true" /> Upgrade to Pro
            </Button>
          </section>

          <section aria-label="Storage usage" className="rounded-xl border p-4 bg-gradient-subtle shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Storage</div>
              <Badge variant="secondary">{docs.length}/{DOC_QUOTA}</Badge>
            </div>
            <Progress value={usagePct} className="h-2" />
            <div className="mt-2 text-xs text-muted-foreground">Usage {usagePct}% • {Math.max(0, DOC_QUOTA - docs.length)} left</div>
          </section>

          <section aria-label="Recent" className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Recent</div>
            {docs.length === 0 ? (
              <div className="text-xs text-muted-foreground">No documents yet.</div>
            ) : (
              <>
                <ul className="space-y-2">
                  {(showAllDocs ? docs : docs.slice(0, 5)).map((d) => (
                    <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <span className="block truncate max-w-[9rem]" title={d.name}>{d.name}</span>
                        {d.updatedAt && (
                          <span className="block text-[11px] text-muted-foreground">
                            {formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Options">
                            <Menu className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50">
                          <DropdownMenuItem onClick={() => handleDocAction('view', d)}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDocAction('share', d)}>Share</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDocAction('delete', d)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  ))}
                </ul>
                {docs.length > 5 && (
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAllDocs((s) => !s)}>
                      {showAllDocs ? "Show less" : "Show all documents"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </aside>

        <main>
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Card key={t.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="relative">
                  <div className="size-12 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                    <t.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <CardTitle className="text-lg">{t.title}</CardTitle>
                    {t.proOnly && (
                      <>
                        <Badge variant="secondary">PRO</Badge>
                        <Button
                          variant="pro"
                          size="sm"
                          className="absolute right-4 top-4 inline-flex"
                          onClick={() => navigate('/#pricing')}
                          aria-label="Upgrade to Pro"
                        >
                          <Rocket className="size-4 mr-2" aria-hidden="true" />
                          Upgrade to Pro
                        </Button>
                      </>
                    )}
                  </div>
                  <CardDescription>
                    {t.desc} {t.proOnly && <span className="ml-1">(Upgrade to Pro to use)</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" onClick={() => (t.proOnly ? setProPromptTool(t) : setActiveTool(t))}>{t.cta ?? "Open AI tool"}</Button>
                </CardContent>
              </Card>
            ))}
          </section>
        <Dialog open={!!activeTool} onOpenChange={(open) => { if (!open) { handleClose(); } }}>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{activeTool?.title}</DialogTitle>
              <DialogDescription>
                Use this AI tool to {activeTool?.desc?.toLowerCase()}. Note: Please import PDF files.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                {activeTool?.title === "Cross-Doc Linker" ? null : (
                  <Label htmlFor="tool-input">{(activeTool?.title === "Translate & Localize" || activeTool?.title === "Summarize Long Documents") ? "Document" : "Input"}</Label>
                )}
                {(activeTool?.title === "Translate & Localize" || activeTool?.title === "Summarize Long Documents") ? (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={triggerFileDialog}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileDialog(); }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) setSelectedFile(f);
                    }}
                    className={`flex w-full items-center justify-center rounded-md border text-sm transition cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : selectedFile ? 'border-border bg-muted/10 py-3' : 'h-28 border-dashed'} hover-scale`}
                    aria-label="Drop your file here or click to upload"
                  >
                    {selectedFile ? (
                      <div className="w-full px-2 animate-fade-in">
                        <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2">
                          <div className="rounded-md bg-primary/10 p-2">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={triggerFileDialog}>Change</Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Remove</Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Drop your file here or click to upload</span>
                    )}
                  </div>
                ) : activeTool?.title === "Cross-Doc Linker" ? null : (
                  <Textarea
                    id="tool-input"
                    placeholder={activeTool ? getPlaceholder(activeTool.title) : ""}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={6}
                  />
                )}
              </div>

              {activeTool?.title === "Translate & Localize" && (
                <div className="space-y-2">
                  <Label>Language</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Select target language">
                        {translateLang}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setTranslateLang("en->nl")}>English → Dutch</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("en->de")}>English → German</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("en->fr")}>English → French</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("nl->en")}>Dutch → English</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("de->en")}>German → English</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("fr->en")}>French → English</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <div className="space-y-2">
                <input
                  id="tool-file"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {activeTool?.title !== "Translate & Localize" && activeTool?.title !== "Summarize Long Documents" && (
                  <>
                    <Label htmlFor="tool-file">Document</Label>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={triggerFileDialog}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileDialog(); }}
                      onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                      onDragLeave={() => setIsDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f) setSelectedFile(f);
                      }}
                      className={`flex w-full items-center justify-center rounded-md border text-sm transition cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : selectedFile ? 'border-border bg-muted/10 py-3' : 'h-28 border-dashed'} hover-scale`}
                      aria-label="Drop your file here or click to upload"
                    >
                      {selectedFile ? (
                        <div className="w-full px-2 animate-fade-in">
                          <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2">
                            <div className="rounded-md bg-primary/10 p-2">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={triggerFileDialog}>Change</Button>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Remove</Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Drop your file here or click to upload</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => summarizeWithAI()} disabled={isSending || (!selectedFile && !input.trim())}>{isSending ? "Sending..." : activeTool?.title === "Translate & Localize" ? "Translate with AI" : activeTool?.title === "Cross-Doc Linker" ? "Search-Doc with AI" : "Summarize with AI"}</Button>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
              </div>

              <div className="space-y-2">
                <Label>Output</Label>
                <div className="min-h-24 rounded-md border p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {output || "Results will appear here."}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-name">Document name</Label>
                <Input id="doc-name" placeholder="Give your document a name" value={docName} onChange={(e) => setDocName(e.target.value)} />
                <p className="text-xs text-muted-foreground">Will be saved in My documents.</p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <Button variant="secondary" onClick={saveOutput} disabled={!output.trim() || !userId || isSaving || !docName.trim()}>
                {isSaving ? "Saving..." : "Save to My documents"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFeedbackOpen(true)}>Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={!!proPromptTool} onOpenChange={(open) => { if (!open) setProPromptTool(null); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upgrade to Pro</DialogTitle>
              <DialogDescription>
                {proPromptTool ? `${proPromptTool.title} is a Pro feature.` : 'This is a Pro feature.'} Upgrade to use it.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setProPromptTool(null)}>Maybe later</Button>
              <Button variant="pro" onClick={() => navigate('/#pricing')}><Rocket className="size-4" aria-hidden="true" /> Upgrade to Pro</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) setPreviewDoc(null); }}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewDoc?.name}</DialogTitle>
              <DialogDescription>Preview</DialogDescription>
            </DialogHeader>
            <div className="min-h-[60vh] relative">
              {previewDoc && (
                isPdf(previewDoc.name)
                  ? <iframe src={previewDoc.url} className="w-full h-[70vh] rounded-md border" />
                  : isImage(previewDoc.name)
                    ? <img src={previewDoc.url} alt={previewDoc.name} className="max-h-[70vh] w-full object-contain rounded-md border" />
                    : <iframe src={previewDoc.url} className="w-full h-[70vh] rounded-md border" />
              )}

              {previewDoc && lastSavedPair && (
                (() => {
                  const isPrevOrig = lastSavedPair.original && previewDoc.name === lastSavedPair.original.name;
                  const isPrevOut = lastSavedPair.output && previewDoc.name === lastSavedPair.output.name;
                  const related = isPrevOrig ? lastSavedPair.output : isPrevOut ? lastSavedPair.original : null;
                  return related ? (
                    <div className="absolute left-4 bottom-4 rounded-md border bg-background/80 backdrop-blur px-3 py-2 shadow-sm max-w-[95%]">
                      <div className="text-xs text-muted-foreground mb-1">Related document</div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm truncate max-w-[220px]" title={related.name}>{related.name}</span>
                        <Button variant="outline" size="sm" onClick={() => setPreviewDoc(related as { name: string; url: string })}>Open</Button>
                      </div>
                    </div>
                  ) : null;
                })()
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" asChild>
                <a href={previewDoc?.url} target="_blank" rel="noopener noreferrer">Open in new tab</a>
              </Button>
              <Button onClick={() => setPreviewDoc(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send feedback</DialogTitle>
              <DialogDescription>Tell us what you think of this summary.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="feedback">Your feedback</Label>
              <Textarea id="feedback" placeholder="Type your feedback..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  if (!feedbackText.trim()) { toast({ title: 'Feedback is empty', description: 'Please add a comment.' }); return; }
                  toast({ title: 'Thank you!', description: 'Your feedback helps us improve.' });
                  setFeedbackText('');
                  setFeedbackOpen(false);
                }}
              >
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
