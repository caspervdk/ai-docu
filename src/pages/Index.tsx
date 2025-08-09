import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Languages, ShieldCheck, PenLine, Users, GraduationCap, Star, Plus, Rocket, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [yearly, setYearly] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewKind, setPreviewKind] = useState<'image' | 'pdf' | 'text' | 'other' | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthed(!!session);
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant local preview
    try {
      // Revoke previous preview URL to avoid memory leaks
      setPreviewText(null);
      setUploadedName(null);
      setSelectedAction(null);
      setUploading(true);

      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return prev;
      });

      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      const mime = file.type;
      let kind: 'image' | 'pdf' | 'text' | 'other' = 'other';
      if (mime?.startsWith('image/')) kind = 'image';
      else if (mime === 'application/pdf') kind = 'pdf';
      else if (mime?.startsWith('text/') || /\.txt$/i.test(file.name)) kind = 'text';
      setPreviewKind(kind);

      if (kind === 'text') {
        // Load text content (non-blocking)
        file.text().then((t) => setPreviewText(t.slice(0, 5000))).catch(() => setPreviewText(''));
      }

      // Proceed with upload
      const targetBucket = userId ? 'documents' : 'public_uploads';
      const keyPrefix = userId ?? 'anon';
      const random = Math.random().toString(36).slice(2, 8);
      const filePath = `${keyPrefix}/${Date.now()}-${random}-${file.name}`;

      const { error } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, { upsert: Boolean(userId), contentType: file.type });

      if (error) throw error;
      setUploadedName(file.name);
      toast({
        title: 'Upload complete',
        description: userId
          ? 'Your document was uploaded successfully.'
          : 'Uploaded anonymously. Anyone with the link can view.',
      });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [userId]);

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

  const onContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast({ title: 'Message sent', description: 'We’ll get back to you soon.' });
    (e.currentTarget as HTMLFormElement).reset();
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
            <img src="/lovable-uploads/e443a8b9-e81f-4b9a-815b-1b4745a36b86.png" alt="AI Docu logo" className="h-[3.6rem] w-auto" loading="eager" />
          </a>
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">AI tool</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
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
              <Button size="lg" variant="pro"><Rocket className="size-4" aria-hidden="true" /> Upgrade to AI-Docu Pro</Button>
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
          <div className="mx-auto max-w-3xl text-center mb-6">
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">AI Document Tool</span>
            <h2 className="mt-4 text-3xl font-semibold">Upload your document and choose an AI-powered action:</h2>
            <p className="mt-2 text-sm text-muted-foreground">Supports PDF, DOCX, and TXT — no training needed.</p>
          </div>

          <Card className="mx-auto max-w-5xl shadow-sm animate-fade-in">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle id="get-started" className="text-xl">Get started</CardTitle>
              <CardDescription>Upload on the left, pick an AI action on the right.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:gap-8 md:grid-cols-2">
              {/* Left: Upload area */}
              <div className="space-y-4">
                <label className="flex items-center justify-center rounded-xl border border-dashed bg-muted/30 p-8 cursor-pointer hover:bg-muted/40 transition-colors min-h-48 md:min-h-56">
                  <input id="upload-input" type="file" className="sr-only" aria-label="Upload document" accept=".pdf,.doc,.docx,.txt,image/*" onChange={onFileSelected} disabled={uploading} />
                  {previewUrl ? (
                    <div className="w-full">
                      {previewKind === 'image' && (
                        <img
                          src={previewUrl}
                          alt={uploadedName ? `Preview of ${uploadedName}` : 'Image preview'}
                          className="mx-auto max-h-56 w-auto object-contain rounded-md shadow-sm"
                          loading="lazy"
                        />
                      )}
                      {previewKind === 'pdf' && (
                        <iframe
                          src={previewUrl}
                          title="PDF preview"
                          className="w-full h-56 rounded-md border shadow-sm"
                        />
                      )}
                      {previewKind === 'text' && (
                        <pre className="w-full max-h-56 overflow-auto text-xs bg-muted/40 text-muted-foreground p-3 rounded-md">
                          {previewText ?? 'Loading preview...'}
                        </pre>
                      )}
                      {previewKind === 'other' && (
                        <div className="flex items-center justify-center gap-3 text-muted-foreground">
                          <FileText className="size-5 text-primary" />
                          <span className="text-sm">{uploadedName ?? 'File selected'}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 text-muted-foreground">
                      <Upload className="size-5 text-primary" />
                      <span className="text-sm">Drop a file here or click to upload</span>
                    </div>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <Button size="sm" onClick={() => document.getElementById('upload-input')?.click()} disabled={uploading}>
                    {uploading ? 'Uploading…' : previewUrl ? 'Change Document' : 'Upload Document'}
                  </Button>
                  {(previewUrl || uploadedName) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">Choose AI Action</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="z-50">
                        <DropdownMenuLabel>Select an action</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setSelectedAction('Summarize Long Documents'); toast({ title: 'AI Action', description: 'Summarize Long Documents' }); }} className="flex items-center gap-2">
                          <FileText className="size-4 text-primary" />
                          <span>Summarize Long Documents</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedAction('Make Content Searchable (OCR)'); toast({ title: 'AI Action', description: 'Make Content Searchable (OCR)' }); }} className="flex items-center gap-2">
                          <Upload className="size-4 text-primary" />
                          <span>Make Content Searchable (OCR)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedAction('Translate & Localize'); toast({ title: 'AI Action', description: 'Translate & Localize' }); }} className="flex items-center gap-2">
                          <Languages className="size-4 text-primary" />
                          <span>Translate & Localize</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedAction('Contract Analysis & Risk Detection'); toast({ title: 'AI Action', description: 'Contract Analysis & Risk Detection' }); }} className="flex items-center gap-2">
                          <ShieldCheck className="size-4 text-primary" />
                          <span>Contract Analysis & Risk Detection</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedAction('Smart Error Detection'); toast({ title: 'AI Action', description: 'Smart Error Detection' }); }} className="flex items-center gap-2">
                          <PenLine className="size-4 text-primary" />
                          <span>Smart Error Detection</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                </div>
                <p className="text-xs text-muted-foreground">{uploading ? 'Uploading…' : uploadedName ? `Uploaded: ${uploadedName}` : previewUrl ? 'Previewing selected file. Click "Change Document" to pick another.' : 'Max 10MB per file. Your data stays private.'}</p>
              </div>

              {/* Right: Actions list */}
              <div className="space-y-3">
                <ul className="space-y-3">
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45">
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <FileText className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Summarize Long Documents</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">
                          Condense lengthy reports or contracts into key points so you can quickly grasp the essentials.
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45">
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <Upload className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Make Content Searchable (OCR)</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Extract text from scanned PDFs or images and make it keyword-searchable.</p>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45">
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <Languages className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Translate & Localize</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Automatically translate documents into multiple languages while preserving layout and formatting.</p>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45">
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Contract Analysis & Risk Detection</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Scan legal documents to identify clauses, obligations, and potential risks.</p>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45">
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <PenLine className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">Smart Error Detection</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Spot spelling, grammar, and numerical inconsistencies and suggest corrections.</p>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>


        {/* Workflow */}
        <section id="how-it-works" className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10 animate-fade-in">
            <h2 className="text-3xl font-semibold">How it works</h2>
            <p className="text-muted-foreground">Go from upload to insights in four simple steps.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">1</span>
                <Upload className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">Upload Your Document</h3>
            </article>

            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in [animation-delay:60ms]">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">2</span>
                <FileText className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">Choose an AI Processing Option</h3>
            </article>

            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in [animation-delay:120ms]">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">3</span>
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">AI Processes Your Document</h3>
            </article>

            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in [animation-delay:180ms]">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">4</span>
                <PenLine className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">Review Your Results</h3>
            </article>
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
                  {p.name === 'Pro' ? (
                    <Button variant="pro" size="lg" className="mt-6 w-full hover-scale" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                      <Rocket className="size-4" aria-hidden="true" /> Upgrade to Pro
                    </Button>
                  ) : (
                    <Button variant="secondary" className="mt-6 w-full" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Contact us</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pro Benefits */}
        <section id="pro-benefits" className="container py-14 md:py-24 relative">
          <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-subtle ring-1 ring-primary/10 shadow-glow"></div>
          <div className="relative rounded-3xl">
            <div className="mx-auto max-w-3xl text-center mb-10 animate-fade-in">
              <h2 className="text-3xl font-semibold">Upgrade to Pro</h2>
              <p className="text-muted-foreground">Get unlimited access and more features.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Great to try things out</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-muted-foreground"></span><span>5 uploads per day</span></li>
                    <li className="flex items-start gap-2"><span className="mt-1 size-1.5 rounded-full bg-muted-foreground"></span><span>Basic AI tools</span></li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="shadow-glow border-none bg-[image:var(--gradient-pro)] text-primary-foreground overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Pro <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/20 ring-1 ring-primary/30">Best value</span></CardTitle>
                  <CardDescription className="text-primary-foreground/80">Everything in Free, plus</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4" aria-hidden="true" /><span>Unlimited uploads</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4" aria-hidden="true" /><span>Cloud storage</span></li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="size-4" aria-hidden="true" /><span>More AI features</span></li>
                  </ul>
                  <Button variant="pro" size="lg" className="mt-6 w-full hover-scale" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>
                    <Rocket className="size-4" aria-hidden="true" /> Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="container py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">Get in touch</span>
              <h2 className="text-3xl font-semibold">Contact our team</h2>
              <p className="text-sm text-muted-foreground">Questions about pricing, features, or onboarding? Send us a message and we’ll reply within 1 business day.</p>
              <div className="text-sm text-muted-foreground">
                <p>Email: hello@docmind.ai</p>
              </div>
            </div>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={onContactSubmit} className="space-y-4" aria-label="Contact form">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Your name</Label>
                      <Input id="contact-name" name="name" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input id="contact-email" name="email" type="email" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input id="contact-subject" name="subject" placeholder="How can we help?" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea id="contact-message" name="message" placeholder="Tell us a bit about your question..." rows={5} required />
                  </div>
                  <Button type="submit" className="w-full hover-scale">Send message</Button>
                </form>
              </CardContent>
            </Card>
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
