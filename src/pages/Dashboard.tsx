import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Languages, ShieldAlert, Bug, Save, Share2, User2, Rocket, Files, BarChart3, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useState, useRef, useEffect } from "react";

const tools = [
  { icon: FileText, title: "Summarize Long Documents", desc: "Condense long docs into key points.", proOnly: false },
  { icon: Search, title: "Cross-Doc Linker", desc: "Find related documents and link supporting evidence.", proOnly: false },
  { icon: Languages, title: "Translate & Localize", desc: "Translate content and adapt for regions.", proOnly: false },
  { icon: ShieldAlert, title: "Contract Analysis & Risk Detection", desc: "Spot risks and clauses at a glance.", proOnly: true },
  { icon: Bug, title: "Smart Error Detection", desc: "Identify issues and suggest fixes.", proOnly: true },
  { icon: Files, title: "Merge documents", desc: "Combine multiple documents into a single file.", proOnly: true },
  { icon: BarChart3, title: "Analyze data from a file", desc: "Extract insights and metrics from your dataset.", proOnly: true },
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
  const [docs, setDocs] = useState<{ name: string; url: string }[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; url: string } | null>(null);
  const [proPromptTool, setProPromptTool] = useState<(typeof tools)[number] | null>(null);

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
      if (!userId) { setDocs([]); return; }
      const { data: files, error } = await supabase.storage
        .from('documents')
        .list(userId, { limit: 20, sortBy: { column: 'name', order: 'desc' } });
      if (error || !files) { setDocs([]); return; }
      const items = await Promise.all(files.map(async (f) => {
        const path = `${userId}/${f.name}`;
        const { data: signed } = await supabase.storage.from('documents').createSignedUrl(path, 600);
        return { name: f.name, url: signed?.signedUrl || '#' };
      }));
      setDocs(items);
    };
    fetchDocs();
  }, [userId]);
  const summarizeWithAI = async (overrideFile?: File) => {
    const file = overrideFile ?? selectedFile;
    if (!file) return;
    try {
      setIsSending(true);
      setOutput("Sending to AI...");
      const fd = new FormData();
      fd.append("file", file, file.name);
      if (activeTool?.title) fd.append("action", activeTool.title);
      if (input) fd.append("message", input);

      const res = await fetch("https://caspervdk.app.n8n.cloud/webhook-test/analyze-doc", {
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

      const res = await fetch("https://caspervdk.app.n8n.cloud/webhook-test/analyze-doc", {
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
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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
      const base = slug(docName.trim());
      if (!base) {
        toast({ title: "Enter a file name", description: "Please provide a name before saving." });
        setIsSaving(false);
        return;
      }
      const filename = `${base}.txt`;
      const path = `${userId}/${filename}`;
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
      const { error } = await supabase.storage.from('documents').upload(path, blob, { contentType: 'text/plain', upsert: false });
      if (error) throw error;
      const { data: signed } = await supabase.storage.from('documents').createSignedUrl(path, 600);
      setDocs((prev) => [{ name: filename, url: signed?.signedUrl || '#' }, ...prev]);
      toast({ title: 'Saved to My documents', description: filename });
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'Could not save document.', variant: 'destructive' } as any);
    } finally {
      setIsSaving(false);
    }
  };

  const isPdf = (n: string) => /\.pdf$/i.test(n);
  const isImage = (n: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(n);

  const handleDocAction = async (
    action: 'view' | 'share' | 'delete',
    doc: { name: string; url: string }
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
    if (action === 'delete') {
      if (!userId) {
        toast({ title: 'Log in required', description: 'Please log in to delete documents.' });
        return;
      }
      const confirmDelete = window.confirm(`Delete ${doc.name}?`);
      if (!confirmDelete) return;
      const path = `${userId}/${doc.name}`;
      const { error } = await supabase.storage.from('documents').remove([path]);
      if (error) {
        toast({ title: 'Delete failed', description: error.message, variant: 'destructive' } as any);
      } else {
        setDocs((prev) => prev.filter((d) => d.name !== doc.name));
        toast({ title: 'Deleted', description: doc.name });
      }
    }
  };

const getPlaceholder = (title: string) => {
  switch (title) {
    case "Summarize Long Documents":
      return "Paste the document text or key sections to summarize...";
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
            <Button variant="outline" className="w-full justify-start">Dashboard</Button>
          </nav>

          <section aria-label="Upgrade to Pro" className="rounded-lg border p-4 bg-gradient-subtle">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">Pro features</div>
              <Badge variant="secondary">PRO</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Unlock all tools and higher limits.</p>
            <Button variant="pro" size="sm" className="w-full mt-3" onClick={() => navigate("/#pricing")}>
              <Rocket className="size-4" aria-hidden="true" /> Upgrade to Pro
            </Button>
          </section>

          <section aria-label="Storage usage" className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Storage</div>
            <Progress value={27} className="h-2" />
            <div className="mt-2 text-xs text-muted-foreground">Usage 27%</div>
          </section>

          <section aria-label="My documents" className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">My documents</div>
            {docs.length === 0 ? (
              <div className="text-xs text-muted-foreground">No documents yet.</div>
            ) : (
              <ul className="space-y-2">
                {docs.slice(0, 5).map((d) => (
                  <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate max-w-[9rem]" title={d.name}>{d.name}</span>
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
          </section>
        </aside>

        <main>
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((t) => (
              <Card key={t.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="size-12 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                    <t.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <CardTitle className="text-lg">{t.title}</CardTitle>
                    {t.proOnly && <Badge variant="secondary">PRO</Badge>}
                  </div>
                  <CardDescription>
                    {t.desc} {t.proOnly && <span className="ml-1">(Upgrade to Pro to use)</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" onClick={() => (t.proOnly ? setProPromptTool(t) : setActiveTool(t))}>Open AI tool</Button>
                </CardContent>
              </Card>
            ))}
          </section>
        <Dialog open={!!activeTool} onOpenChange={(open) => { if (!open) { handleClose(); } }}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{activeTool?.title}</DialogTitle>
              <DialogDescription>
                Use this AI tool to {activeTool?.desc?.toLowerCase()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool-input">Input</Label>
                <Textarea
                  id="tool-input"
                  placeholder={activeTool ? getPlaceholder(activeTool.title) : ""}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-file">Document</Label>
                <input
                  id="tool-file"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={handleUploadClick}>Upload</Button>
                  <span className="text-sm text-muted-foreground">{selectedFile ? selectedFile.name : "No file selected"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => summarizeWithAI()} disabled={!selectedFile || isSending}>{isSending ? "Sending..." : "Summarize with AI"}</Button>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
              </div>

              <div className="space-y-2">
                <Label>Output</Label>
                <div className="min-h-24 rounded-md border p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {output || "Results will appear here."}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-name">File name</Label>
                <Input id="doc-name" placeholder="e.g., summary-q3" value={docName} onChange={(e) => setDocName(e.target.value)} />
                <p className="text-xs text-muted-foreground">Will be saved as .txt in My documents.</p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <Button variant="secondary" onClick={saveOutput} disabled={!output.trim() || !userId || isSaving || !docName.trim()}>
                {isSaving ? "Saving..." : "Save to My documents"}
              </Button>
              <div className="text-xs text-muted-foreground">Note: Demo UI. Connect to your AI backend to enable live results.</div>
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
            <div className="min-h-[60vh]">
              {previewDoc && (
                isPdf(previewDoc.name)
                  ? <iframe src={previewDoc.url} className="w-full h-[70vh] rounded-md border" />
                  : isImage(previewDoc.name)
                    ? <img src={previewDoc.url} alt={previewDoc.name} className="max-h-[70vh] w-full object-contain rounded-md border" />
                    : <iframe src={previewDoc.url} className="w-full h-[70vh] rounded-md border" />
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
        </main>
      </div>
    </>
  );
};

export default Dashboard;
