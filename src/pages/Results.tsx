import { Helmet } from "react-helmet-async";
import { useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LocationState {
  action?: string | null;
  fileName?: string | null;
}

const Results = () => {
  const location = useLocation();
  const state = (location.state as LocationState) || {};

  return (
    <>
      <Helmet>
        <title>AI Results – DocMind</title>
        <meta name="description" content="View the AI processing results for your uploaded document." />
        <link rel="canonical" href="/results" />
      </Helmet>

      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex items-center justify-between py-5">
          <a href="/" className="flex items-center gap-2" aria-label="DocMind AI home">
            <img src="/lovable-uploads/e443a8b9-e81f-4b9a-815b-1b4745a36b86.png" alt="DocMind AI logo" className="h-[2.6rem] w-auto" loading="eager" />
          </a>
          <div className="hidden md:flex items-center gap-4">
            <Button asChild variant="outline"><Link to="/">Home</Link></Button>
          </div>
        </nav>
      </header>

      <main className="container py-12 md:py-20">
        <section className="mx-auto max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">AI Results</h1>
          <p className="text-sm text-muted-foreground mb-6">Your request has been sent. This page will display the output when available.</p>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Processing started</CardTitle>
              <CardDescription>
                {state.action ? `Action: ${state.action}` : "Action: —"}
                {state.fileName ? ` • File: ${state.fileName}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border bg-muted/30 p-4">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {`[
{
  "name": "First item",
  "code": 1
},
{
  "name": "Second item",
  "code": 2
}
]`}
                  </pre>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="secondary"><Link to="/">Go to Home</Link></Button>
                  <Button onClick={() => window.location.reload()}>Refresh</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container py-8 text-xs text-muted-foreground">© {new Date().getFullYear()} DocMind AI</div>
      </footer>
    </>
  );
};

export default Results;
