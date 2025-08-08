import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Upload, Sparkles, FileText, Languages, ShieldCheck, PenLine, Users, GraduationCap, Star } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [yearly, setYearly] = useState(false);

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
          <a href="#" className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            <span className="font-semibold">DocMind AI</span>
          </a>
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#use-cases" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Use Cases</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Button variant="outline">Log in</Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Smarter Documents. Powered by AI.
            </h1>
            <p className="text-lg text-muted-foreground max-w-prose">
              Upload contracts, reports, or notes — and let AI do the reading, thinking, and rewriting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg">Try for Free</Button>
              <Button size="lg" variant="outline">Watch Demo →</Button>
            </div>
            <p className="text-sm text-muted-foreground">Trusted by 1,000+ teams</p>
          </div>
          <div className="relative">
            <img
              src="/placeholder.svg"
              alt="AI document analysis mockup"
              loading="lazy"
              className="w-full rounded-lg border shadow-sm"
            />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl font-semibold">Everything you need for smarter docs</h2>
            <p className="text-muted-foreground">Clean, fast, and built for clarity and trust.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[{
              icon: Upload, title: 'Document Upload', desc: 'Drag and drop PDF, Word, or TXT files'
            },{
              icon: FileText, title: 'Instant Analysis', desc: 'Get highlights, risks, and summaries'
            },{
              icon: PenLine, title: 'Smart Rewrite', desc: 'Let AI suggest improvements or rewrites'
            },{
              icon: Languages, title: 'Multilingual Support', desc: 'Translate documents in one click'
            },{
              icon: ShieldCheck, title: 'Compliance Checker', desc: 'Scan for legal/industry risks'
            }].map((f, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="size-9 rounded-md bg-secondary text-secondary-foreground flex items-center justify-center">
                    <f.icon className="size-5" />
                  </div>
                  <CardTitle className="mt-2 text-xl">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
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
              <Sparkles className="text-primary" />
              <span className="font-semibold">DocMind AI</span>
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
