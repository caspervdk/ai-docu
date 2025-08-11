import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Languages, ShieldAlert, Bug, Save, Share2, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const tools = [
  { icon: FileText, title: "Summarize Long Documents", desc: "Condense long docs into key points." },
  { icon: Search, title: "Cross-Doc Linker", desc: "Find related documents and link supporting evidence." },
  { icon: Languages, title: "Translate & Localize", desc: "Translate content and adapt for regions." },
  { icon: ShieldAlert, title: "Contract Analysis & Risk Detection", desc: "Spot risks and clauses at a glance." },
  { icon: Bug, title: "Smart Error Detection", desc: "Identify issues and suggest fixes." },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const [activeTool, setActiveTool] = useState<(typeof tools)[number] | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleClose = () => {
    setActiveTool(null);
    setInput("");
    setOutput("");
  };

  const handleRun = () => {
    setOutput("Processing...");
    setTimeout(() => {
      setOutput(`Sample output for "${activeTool?.title}" based on your input.`);
    }, 800);
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

          <section aria-label="Storage usage" className="rounded-lg border p-4">
            <div className="text-sm font-medium mb-2">Storage</div>
            <Progress value={27} className="h-2" />
            <div className="mt-2 text-xs text-muted-foreground">Usage 27%</div>
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
                  <CardTitle className="text-lg mt-2">{t.title}</CardTitle>
                  <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" onClick={() => setActiveTool(t)}>Open AI tool</Button>
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

              <div className="flex items-center gap-2">
                <Button onClick={handleRun}>Run</Button>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
              </div>

              <div className="space-y-2">
                <Label>Output</Label>
                <div className="min-h-24 rounded-md border p-3 text-sm text-muted-foreground whitespace-pre-wrap">
                  {output || "Results will appear here."}
                </div>
              </div>
            </div>

            <DialogFooter>
              <div className="text-xs text-muted-foreground">
                Note: Demo UI. Connect to your AI backend to enable live results.
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
