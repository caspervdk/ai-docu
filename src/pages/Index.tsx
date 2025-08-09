import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, FileText, Languages, ShieldCheck, PenLine, Users, GraduationCap, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [yearly, setYearly] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setIsAuthed(!!session));
    return () => subscription.unsubscribe();
  }, []);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DocMind AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: [
      { "@type": "Offer", price: "0", priceCurrency: "USD", name: "Free" },
      { "@type": "Offer", price: yearly ? "144" : "15", priceCurrency: "USD", name: "Pro" },
      { "@type": "Offer", price: yearly ? "468" : "49", priceCurrency: "USD", name: "Team" }
    ]
  };

  return (
    <>
      <Helmet>
        <title>AI Document Assistant – Smarter Documents</title>
        <meta name="description" content="Upload contracts, reports, or notes — let our AI read, analyze, summarize, translate, and improve your documents." />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>

      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex items-center justify-between py-5">
          <a href="#" className="flex items-center gap-2" aria-label="DocMind AI home">
            <img src="/lovable-uploads/e443a8b9-e81f-4b9a-815b-1b4745a36b86.png" alt="AI Docu logo" className="h-[3.6rem] w-auto" loading="eager" fetchPriority="high" />
          </a>
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            {isAuthed ? (
              <Button variant="outline" asChild><a href="/dashboard">Dashboard</a></Button>
            ) : (
              <Button variant="outline" asChild><a href="/login">Log in</a></Button>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center bg-gradient-subtle rounded-2xl">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6 md:mb-8">
              Smarter Documents. Powered by AI.
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-prose">
              Upload contracts, reports, or notes — and let AI do the reading, thinking, and rewriting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Try for Free</Button>
              <Button size="lg" variant="outline">Watch Demo →</Button>
            </div>
            <p className="text-sm text-muted-foreground">Trusted by 1,000+ teams</p>
          </div>
          <div className="relative">
            <img
              src="/lovable-uploads/8e6290ce-6740-43f8-9480-ee864f724a65.png"
              alt="DocMind AI document analysis illustration"
              loading="lazy"
              className="w-[70%] mx-auto rounded-lg border shadow-sm"
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container py-12 md:py-20 rounded-2xl border bg-gradient-subtle shadow-glow">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl font-semibold">Upload your document and choose an AI-powered action:</h2>
          </div>
          <ul className="mx-auto max-w-4xl space-y-4 text-left">
            <li>
              <p className="font-medium">Summarize Long Documents</p>
              <p className="text-sm text-muted-foreground">Condense lengthy reports or contracts into key points so you can quickly grasp the essentials.</p>
            </li>
            <li>
              <p className="font-medium">Make Content Searchable (OCR)</p>
              <p className="text-sm text-muted-foreground">Extract text from scanned PDFs or images and make it keyword-searchable.</p>
            </li>
            <li>
              <p className="font-medium">Translate & Localize</p>
              <p className="text-sm text-muted-foreground">Automatically translate documents into multiple languages while preserving layout and formatting.</p>
            </li>
            <li>
              <p className="font-medium">Contract Analysis & Risk Detection</p>
              <p className="text-sm text-muted-foreground">Scan legal documents to identify clauses, obligations, and potential risks.</p>
            </li>
            <li>
              <p className="font-medium">Smart Error Detection</p>
              <p className="text-sm text-muted-foreground">Spot spelling, grammar, and numerical inconsistencies and suggest corrections.</p>
            </li>
          </ul>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl font-semibold">Built for your workflow</h2>
          </div>
          {/* Changed layout: all cards next to each other in one row with horizontal scroll */}
          <div className="flex flex-nowrap gap-6 overflow-x-auto snap-x snap-mandatory">
            {[{
              icon: ShieldCheck, title: 'Legal Teams', desc: 'Spot risks and clauses faster'
            },{
              icon: PenLine, title: 'Content Editors', desc: 'Rewrite for clarity and tone'
            },{
              icon: Users, title: 'HR & Policy', desc: 'Standardize docs in minutes'
            },{
              icon: GraduationCap, title: 'Freelancers & Students', desc: 'Summaries and translations'
            }].map((c, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow min-w-[240px] snap-start">
                <CardHeader>
                  <div className="size-9 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center">
                    <c.icon className="size-5" />
                  </div>
                  <CardTitle className="mt-2 text-xl">For {c.title}</CardTitle>
                  <CardDescription>{c.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl font-semibold">Loved by modern teams</h2>
            <p className="text-muted-foreground">“A game changer for document-heavy work.”</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/100?img=${i}`} alt="Customer avatar" className="size-10 rounded-full" loading="lazy" />
                    <div>
                      <CardTitle className="text-base">Alex Johnson</CardTitle>
                      <CardDescription>ACME Inc.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">“DocMind AI helped our legal team catch issues we’d miss — and rewrite clauses in seconds.”</p>
                  <div className="mt-3 flex gap-1 text-yellow-500" aria-label="5 star rating">
                    {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} className="size-4" />)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl font-semibold">Simple pricing</h2>
            <p className="text-muted-foreground">Switch to yearly and save.</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className={`text-sm ${!yearly ? 'font-semibold' : 'text-muted-foreground'}`}>Monthly</span>
              <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly pricing" />
              <span className={`text-sm ${yearly ? 'font-semibold' : 'text-muted-foreground'}`}>Yearly</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Free', price: yearly ? 0 : 0, period: yearly ? '/yr' : '/mo', features: ['1 doc/month', 'Basic analysis'] },
              { name: 'Pro', price: yearly ? 144 : 15, period: yearly ? '/yr' : '/mo', features: ['20 docs', 'All features', 'Priority support'], highlight: true },
              { name: 'Team', price: yearly ? 468 : 49, period: yearly ? '/yr' : '/mo', features: ['Unlimited docs', 'Collaboration tools', 'SSO'] }
            ].map((p, i) => (
              <Card key={i} className={`flex flex-col ${p.highlight ? 'border-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-xl">{p.name}</CardTitle>
                  <CardDescription>For growing teams</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-4xl font-bold">${p.price}<span className="text-base font-normal text-muted-foreground">{p.period}</span></div>
                  <ul className="mt-4 space-y-2 text-sm">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1 size-1.5 rounded-full bg-primary"></span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full">Get Started</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30">
        <div className="container py-12 grid md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/0a2fcf98-0bdf-4d5f-b111-c4aeb1ff03ba.png" alt="DocMind AI logo" className="h-8 w-auto" loading="lazy" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">AI-powered document assistant to read, analyze, summarize, translate, and improve your documents.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Watch Demo</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Support</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3">Stay in touch</h3>
              <p className="text-sm text-muted-foreground">hello@docmind.ai</p>
            </div>
          </div>
        </div>
        <div className="border-t">
          <div className="container py-6 text-xs text-muted-foreground">© {new Date().getFullYear()} DocMind AI. All rights reserved.</div>
        </div>
      </footer>
    </>
  );
};

export default Index;
