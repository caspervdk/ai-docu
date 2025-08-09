import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Mail, FileText, Mic, MessageSquare, Wand2, Brain, Save, Share2, User2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const tools = [
  { icon: Mail, title: "Improve Emails", desc: "Enhance clarity, tone, and engagement." },
  { icon: FileText, title: "Create Flyer", desc: "Design a flyer with layout and graphics." },
  { icon: Mic, title: "Record to Text", desc: "Transcribe audio into editable text." },
  { icon: MessageSquare, title: "Summarize", desc: "Condense long docs into key points." },
  { icon: Wand2, title: "Enhance Writing", desc: "Refine and polish your content." },
  { icon: Brain, title: "Brainstorm Ideas", desc: "Generate creative ideas and solutions." },
];

const Dashboard = () => {
  const navigate = useNavigate();

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
                  <Button variant="outline" size="sm">Open</Button>
                </CardContent>
              </Card>
            ))}
          </section>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
