import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Languages, ShieldCheck, PenLine, Users, GraduationCap, Star, Plus, Rocket, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import Footer from "@/components/Footer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [startingAI, setStartingAI] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null);
  const [webhookError, setWebhookError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  
  // Language and translation system
  const [currentLanguage, setCurrentLanguage] = useState<string>("English");
  
  const languageData = {
    English: {
      "AI tool": "AI tool",
      "How it works": "How it works", 
      "Pricing": "Pricing",
      "Log in": "Log in",
      "Dashboard": "Dashboard",
      "Translate": "Translate",
      
      // Dialog labels
      "Select Language": "Select Language",
      
      // Hero section
      "Smarter Documents. Powered by AI.": "Smarter Documents. Powered by AI.",
      "Upload contracts, reports, or notes — and let AI do the reading, thinking, and rewriting.": "Upload contracts, reports, or notes — and let AI do the reading, thinking, and rewriting.",
      "Try for Free": "Try for Free",
      "Upgrade to AI-Docu Pro": "Upgrade to AI-Docu Pro",
      "Trusted by 1,000+ teams": "Trusted by 1,000+ teams",
      
      // AI Tools section
      "AI Document Tool": "AI Document Tool",
      "Upload your document and choose an AI-powered action:": "Upload your document and choose an AI-powered action:",
      "Supports PDF, DOCX, and TXT — no training needed.": "Supports PDF, DOCX, and TXT — no training needed.",
      "Get started": "Get started",
      "Choose a tool below, then upload your document and Start AI.": "Choose a tool below, then upload your document and Start AI.",
      "Show All PRO AI Tools": "Show All PRO AI Tools",
      "Log in required": "Log in required",
      "You must log in to use the AI tools.": "You must log in to use the AI tools.",
      
      // Action buttons/labels
      "Summarize Long Documents": "Summarize Long Documents",
      "Cross-Doc Linker": "Cross-Doc Linker", 
      "Translate & Localize": "Translate & Localize",
      "Contract Analysis & Risk Detection": "Contract Analysis & Risk Detection",
      "Smart Error Detection": "Smart Error Detection",
      
      // How it works
      "Go from upload to insights in four simple steps.": "Go from upload to insights in four simple steps.",
      "Upload Your Document": "Upload Your Document",
      "Choose an AI Processing Option": "Choose an AI Processing Option", 
      "AI Processes Your Document": "AI Processes Your Document",
      "Review Your Results": "Review Your Results",
      
      // Pricing
      "Simple pricing": "Simple pricing",
      "Switch to yearly and save.": "Switch to yearly and save.",
      "Monthly": "Monthly",
      "Yearly": "Yearly",
      "Free": "Free",
      "For growing teams": "For growing teams",
      "Pro": "Pro",
      "Team": "Team",
      "Contact us": "Contact us", 
      "Upgrade to Pro": "Upgrade to Pro",
      "Get unlimited access and more features.": "Get unlimited access and more features.",
      "Great to try things out": "Great to try things out",
      "Best value": "Best value",
      "Everything in Free, plus": "Everything in Free, plus",
      "Upgrade Now": "Upgrade Now",
      
      // Contact form
      "Get in touch": "Get in touch",
      "Contact our team": "Contact our team",
      "Questions about pricing, features, or onboarding? Send us a message and we'll reply within 1 business day.": "Questions about pricing, features, or onboarding? Send us a message and we'll reply within 1 business day.",
      "Your name": "Your name",
      "Email": "Email", 
      "Subject": "Subject",
      "How can we help?": "How can we help?",
      "Message": "Message",
      "Tell us a bit about your question...": "Tell us a bit about your question...",
      "Send message": "Send message"
    },
    Dutch: {
      "AI tool": "AI-tool",
      "How it works": "Hoe het werkt",
      "Pricing": "Prijzen", 
      "Log in": "Inloggen",
      "Dashboard": "Dashboard",
      "Translate": "Vertalen",
      
      // Dialog labels  
      "Select Language": "Selecteer Taal",
      
      // Hero section
      "Smarter Documents. Powered by AI.": "Slimmere Documenten. Aangedreven door AI.",
      "Upload contracts, reports, or notes — and let AI do the reading, thinking, and rewriting.": "Upload contracten, rapporten of notities — en laat AI het lezen, denken en herschrijven doen.",
      "Try for Free": "Gratis Proberen",
      "Upgrade to AI-Docu Pro": "Upgrade naar AI-Docu Pro",
      "Trusted by 1,000+ teams": "Vertrouwd door 1.000+ teams",
      
      // AI Tools section
      "AI Document Tool": "AI Document Tool",
      "Upload your document and choose an AI-powered action:": "Upload je document en kies een AI-actie:",
      "Supports PDF, DOCX, and TXT — no training needed.": "Ondersteunt PDF, DOCX en TXT — geen training nodig.",
      "Get started": "Aan de slag",
      "Choose a tool below, then upload your document and Start AI.": "Kies een tool hieronder, upload je document en start AI.",
      "Show All PRO AI Tools": "Toon Alle PRO AI Tools",
      "Log in required": "Inloggen vereist",
      "You must log in to use the AI tools.": "Je moet inloggen om de AI-tools te gebruiken.",
      
      // Action buttons/labels
      "Summarize Long Documents": "Lange Documenten Samenvatten",
      "Cross-Doc Linker": "Cross-Document Linker",
      "Translate & Localize": "Vertalen & Lokaliseren", 
      "Contract Analysis & Risk Detection": "Contract Analyse & Risicodetectie",
      "Smart Error Detection": "Slimme Foutdetectie",
      
      // How it works
      "Go from upload to insights in four simple steps.": "Van upload naar inzichten in vier eenvoudige stappen.",
      "Upload Your Document": "Upload Je Document",
      "Choose an AI Processing Option": "Kies een AI Verwerkingsoptie",
      "AI Processes Your Document": "AI Verwerkt Je Document", 
      "Review Your Results": "Bekijk Je Resultaten",
      
      // Pricing
      "Simple pricing": "Eenvoudige prijzen",
      "Switch to yearly and save.": "Schakel over naar jaarlijks en bespaar.",
      "Monthly": "Maandelijks",
      "Yearly": "Jaarlijks", 
      "Free": "Gratis",
      "For growing teams": "Voor groeiende teams",
      "Pro": "Pro",
      "Team": "Team",
      "Contact us": "Neem contact op",
      "Upgrade to Pro": "Upgrade naar Pro", 
      "Get unlimited access and more features.": "Krijg onbeperkte toegang en meer functies.",
      "Great to try things out": "Geweldig om dingen uit te proberen",
      "Best value": "Beste waarde",
      "Everything in Free, plus": "Alles in Gratis, plus",
      "Upgrade Now": "Nu Upgraden",
      
      // Contact form
      "Get in touch": "Neem contact op",
      "Contact our team": "Neem contact op met ons team", 
      "Questions about pricing, features, or onboarding? Send us a message and we'll reply within 1 business day.": "Vragen over prijzen, functies of onboarding? Stuur ons een bericht en we antwoorden binnen 1 werkdag.",
      "Your name": "Je naam",
      "Email": "E-mail",
      "Subject": "Onderwerp", 
      "How can we help?": "Hoe kunnen we helpen?",
      "Message": "Bericht",
      "Tell us a bit about your question...": "Vertel ons iets over je vraag...",
      "Send message": "Bericht versturen"
    }
  };

  const getTranslation = (key: string): string => {
    try {
      const result = languageData[currentLanguage as keyof typeof languageData]?.[key] || key;
      return result;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key;
    }
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };
  
  const ACTIONS = [
    { id: 'summarize', label: 'Summarize Long Documents' },
    { id: 'ocr', label: 'Cross-Doc Linker' },
    { id: 'translate', label: 'Translate & Localize' },
    { id: 'contract', label: 'Contract Analysis & Risk Detection' },
    { id: 'errors', label: 'Smart Error Detection' },
  ] as const;

  const WEBHOOK_URL = 'https://caspervdk.app.n8n.cloud/webhook-test/90b5f2e5-a5d8-4afe-abeb-fb259f01b25b';
  const postFileToWebhook = async (file: File, meta: Record<string, string> = {}) => {
    const fd = new FormData();
    fd.append('file', file, file.name);
    Object.entries(meta).forEach(([k, v]) => fd.append(k, v));
    try {
      const res = await fetch(WEBHOOK_URL, { method: 'POST', body: fd });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(t || `Webhook responded with ${res.status}`);
      }
    } catch (e) {
      console.error('Webhook upload failed', e);
      throw e;
    }
  };

  type UploadKind = 'image' | 'pdf' | 'text' | 'other';
  type UploadInfo = {
    file: File | null;
    uploadedName: string | null;
    previewUrl: string | null;
    previewKind: UploadKind | null;
    previewText: string | null;
    uploading: boolean;
  };

  const [uploads, setUploads] = useState<Record<(typeof ACTIONS)[number]['id'], UploadInfo>>({
    summarize: { file: null, uploadedName: null, previewUrl: null, previewKind: null, previewText: null, uploading: false },
    ocr: { file: null, uploadedName: null, previewUrl: null, previewKind: null, previewText: null, uploading: false },
    translate: { file: null, uploadedName: null, previewUrl: null, previewKind: null, previewText: null, uploading: false },
    contract: { file: null, uploadedName: null, previewUrl: null, previewKind: null, previewText: null, uploading: false },
    errors: { file: null, uploadedName: null, previewUrl: null, previewKind: null, previewText: null, uploading: false },
  });

  const [dragKey, setDragKey] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const labelToId = (label: string | null): (typeof ACTIONS)[number]['id'] | null => {
    const m = ACTIONS.find(a => a.label === label);
    return m ? m.id : null;
  };

  useEffect(() => {
    return () => {
      Object.values(uploads).forEach(u => { if (u.previewUrl) URL.revokeObjectURL(u.previewUrl); });
    };
  }, []);
  

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

  const makeOnFileSelected = (forcedId?: (typeof ACTIONS)[number]['id']) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const id = forcedId ?? pendingKey ?? labelToId(selectedAction) ?? 'summarize';
    try {
      // reset and set uploading
      setUploads((prev) => {
        const prevUrl = prev[id].previewUrl;
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return {
          ...prev,
          [id]: { ...prev[id], uploading: true, previewText: null },
        };
      });

      const objectUrl = URL.createObjectURL(file);
      const mime = file.type;
      const kind: UploadKind = mime?.startsWith('image/')
        ? 'image'
        : mime === 'application/pdf'
        ? 'pdf'
        : mime?.startsWith('text/') || /\.txt$/i.test(file.name)
        ? 'text'
        : 'other';

      if (kind === 'text') {
        file
          .text()
          .then((t) =>
            setUploads((prev) => ({ ...prev, [id]: { ...prev[id], previewText: t.slice(0, 5000) } }))
          )
          .catch(() => {});
      }

      setUploads((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          file,
          uploadedName: file.name,
          previewUrl: objectUrl,
          previewKind: kind,
        },
      }));

      // Proceed with upload to Supabase
      const targetBucket = userId ? 'documents' : 'public_uploads';
      const keyPrefix = userId ?? 'anon';
      const random = Math.random().toString(36).slice(2, 8);
      const filePath = `${keyPrefix}/${Date.now()}-${random}-${file.name}`;

      const { error } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, { upsert: Boolean(userId), contentType: file.type });

      if (error) throw error;
      toast({
        title: 'Upload complete',
        description: userId
          ? 'Your document was uploaded successfully.'
          : 'Uploaded anonymously. Anyone with the link can view.',
      });
      try {
        await postFileToWebhook(file, {
          event: 'upload',
          source: 'file_input',
          action_id: id,
          action_label: (ACTIONS.find(a => a.id === id)?.label) || String(id),
          user_id: userId ?? 'anon',
          file_name: file.name,
          mime_type: file.type || '',
        });
      } catch (e: any) {
        console.error('Webhook POST failed:', e);
        toast({ title: 'Webhook error', description: e?.message ?? 'Could not notify webhook.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setUploads((prev) => ({ ...prev, [id]: { ...prev[id], uploading: false } }));
      setPendingKey(null);
    }
  };

  const onDropFor = (id: (typeof ACTIONS)[number]['id']) => async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    try {
      setUploads((prev) => {
        const prevUrl = prev[id].previewUrl;
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return { ...prev, [id]: { ...prev[id], uploading: true, previewText: null } };
      });

      const objectUrl = URL.createObjectURL(file);
      const mime = file.type;
      const kind: UploadKind = mime?.startsWith('image/')
        ? 'image'
        : mime === 'application/pdf'
        ? 'pdf'
        : mime?.startsWith('text/') || /\.txt$/i.test(file.name)
        ? 'text'
        : 'other';

      if (kind === 'text') {
        file
          .text()
          .then((t) => setUploads((prev) => ({ ...prev, [id]: { ...prev[id], previewText: t.slice(0, 5000) } })))
          .catch(() => {});
      }

      setUploads((prev) => ({
        ...prev,
        [id]: { ...prev[id], file, uploadedName: file.name, previewUrl: objectUrl, previewKind: kind },
      }));

      const targetBucket = userId ? 'documents' : 'public_uploads';
      const keyPrefix = userId ?? 'anon';
      const random = Math.random().toString(36).slice(2, 8);
      const filePath = `${keyPrefix}/${Date.now()}-${random}-${file.name}`;

      const { error } = await supabase.storage
        .from(targetBucket)
        .upload(filePath, file, { upsert: Boolean(userId), contentType: file.type });

      if (error) throw error;
      toast({
        title: 'Upload complete',
        description: userId ? 'Your document was uploaded successfully.' : 'Uploaded anonymously. Anyone with the link can view.',
      });
      try {
        await postFileToWebhook(file, {
          event: 'upload',
          source: 'drag_drop',
          action_id: id,
          action_label: (ACTIONS.find(a => a.id === id)?.label) || String(id),
          user_id: userId ?? 'anon',
          file_name: file.name,
          mime_type: file.type || '',
        });
      } catch (e: any) {
        console.error('Webhook POST failed:', e);
        toast({ title: 'Webhook error', description: e?.message ?? 'Could not notify webhook.', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err?.message ?? 'Something went wrong', variant: 'destructive' });
    } finally {
      setUploads((prev) => ({ ...prev, [id]: { ...prev[id], uploading: false } }));
      setDragKey(null);
      setPendingKey(null);
    }
  };

  const loginRequiredToast = () => {
    console.log('Login required toast called');
    toast({ title: 'Log in required', description: 'Please log in to upload and use the AI tools.' });
  };

  const handleUploadClick = (actionLabel: string) => () => {
    console.log('Upload clicked, isAuthed:', isAuthed);
    setSelectedAction(actionLabel);
    if (!isAuthed) { loginRequiredToast(); return; }
    document.getElementById('upload-input')?.click();
  };

  const onDropGuarded = (id: (typeof ACTIONS)[number]['id'], actionLabel: string) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setSelectedAction(actionLabel);
    setDragActive(false);
    if (!isAuthed) { loginRequiredToast(); return; }
    onDropFor(id)(e as any);
  };

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

const isLikelyJSON = (t: string) => {
  const s = t.trim();
  if (!(s.startsWith("{") || s.startsWith("["))) return false;
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
};

const onStartAI = async (overrideAction?: string) => {
    try {
      if (!selectedFile) {
        toast({ title: 'No file selected', description: 'Please upload a file first.', variant: 'destructive' });
        return;
      }

      const action = overrideAction ?? selectedAction;
      if (!action) {
        toast({ title: 'No action selected', description: 'Please choose an AI action.', variant: 'destructive' });
        return;
      }

      setStartingAI(true);

      const fd = new FormData();
      fd.append('file', selectedFile, selectedFile.name);
      fd.append('action', action);
      fd.append('user_id', userId ?? 'anon');
      fd.append('file_name', selectedFile.name);
      fd.append('mime_type', selectedFile.type || '');
      fd.append('message', `Action: ${action}`);
      if (action === 'Translate & Localize') {
        fd.append('target_language', selectedLanguage);
      }

      const res = await fetch('https://caspervdk.app.n8n.cloud/webhook-test/90b5f2e5-a5d8-4afe-abeb-fb259f01b25b', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || `Webhook responded with ${res.status}`);
      }

      // Read response body and format it nicely for display
      const contentType = res.headers.get('content-type') || '';
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch (_) {
        bodyText = '';
      }
      let display = bodyText;
      const trimmed = bodyText.trim();
      if (contentType.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(bodyText);
          const pickField = (obj: any): string | null => {
            const keys = ['output','result','message','content','text'];
            for (const k of keys) if (typeof obj?.[k] === 'string') return obj[k];
            return null;
          };
          let picked: string | null = pickField(parsed);
          if (!picked && Array.isArray(parsed) && parsed.length) {
            picked = pickField(parsed[0]);
          }
          display = picked || JSON.stringify(parsed, null, 2);
        } catch {
          display = trimmed;
        }
      }

      setWebhookError(null);
      setWebhookResponse(display || 'Success (empty response body)');
      toast({ title: 'AI responded', description: `Action: ${action}` });
    } catch (err: any) {
      toast({ title: 'Failed to start', description: err?.message ?? 'Could not send to AI.', variant: 'destructive' });
    } finally {
      setStartingAI(false);
    }
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
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 hover-scale border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-md" 
                  aria-label="Select language"
                >
                  <Languages className="h-4 w-4 text-primary animate-pulse" />
                  <span className="hidden sm:inline font-medium text-primary">{getTranslation("Translate")}</span>
                  <span className="text-xs opacity-60 hidden md:inline">
                    {currentLanguage === "English" ? "EN" : "NL"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 min-w-[160px] bg-background/95 backdrop-blur-md border-primary/20 shadow-xl">
                <DropdownMenuLabel className="text-primary font-semibold">{getTranslation("Select Language")}</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => handleLanguageChange("English")}
                  className={`cursor-pointer hover:bg-primary/10 ${currentLanguage === "English" ? "bg-primary/5 text-primary font-medium" : ""}`}
                >
                  <span className="mr-2">🇬🇧</span>
                  English
                  {currentLanguage === "English" && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleLanguageChange("Dutch")}
                  className={`cursor-pointer hover:bg-primary/10 ${currentLanguage === "Dutch" ? "bg-primary/5 text-primary font-medium" : ""}`}
                >
                  <span className="mr-2">🇳🇱</span>
                  Nederlands
                  {currentLanguage === "Dutch" && <span className="ml-auto text-primary">✓</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a href="#features" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors">{getTranslation("AI tool")}</a>
            <a href="#how-it-works" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors">{getTranslation("How it works")}</a>
            <a href="#pricing" className="hidden md:inline text-sm text-muted-foreground hover:text-foreground transition-colors">{getTranslation("Pricing")}</a>
            
            {isAuthed ? (
              <Button variant="outline" asChild><a href="/dashboard">{getTranslation("Dashboard")}</a></Button>
            ) : (
              <Button variant="outline" asChild><a href="/login">{getTranslation("Log in")}</a></Button>
            )}
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center bg-gradient-subtle rounded-2xl">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6 md:mb-8">
              {getTranslation("Smarter Documents. Powered by AI.")}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-prose">
              {getTranslation("Upload contracts, reports, or notes — and let AI do the reading, thinking, and rewriting.")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>{getTranslation("Try for Free")}</Button>
              <Button size="lg" variant="pro" onClick={() => { setYearly(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><Rocket className="size-4" aria-hidden="true" /> {getTranslation("Upgrade to AI-Docu Pro")}</Button>
            </div>
            <p className="text-sm text-muted-foreground">{getTranslation("Trusted by 1,000+ teams")}</p>
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
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">{getTranslation("AI Document Tool")}</span>
            <h2 className="mt-4 text-3xl font-semibold">{getTranslation("Upload your document and choose an AI-powered action:")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{getTranslation("Supports PDF, DOCX, and TXT — no training needed.")}</p>
          </div>

          <Card className="mx-auto max-w-5xl shadow-sm animate-fade-in">
            <CardHeader className="pb-2 md:pb-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle id="get-started" className="text-xl">{getTranslation("Get started")}</CardTitle>
                  <CardDescription>{getTranslation("Choose a tool below, then upload your document and Start AI.")}</CardDescription>
                </div>
                <Button size="sm" variant="pro">
                  <Rocket className="mr-2 h-4 w-4" aria-hidden="true" />
                  {getTranslation("Show All PRO AI Tools")}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6 md:gap-8">
              {!isAuthed && (
                <Alert className="border-dashed">
                  <AlertTitle>{getTranslation("Log in required")}</AlertTitle>
                  <AlertDescription>
                    {getTranslation("You must log in to use the AI tools.")}
                    <Button size="sm" className="ml-2" asChild>
                      <a href="/login">{getTranslation("Log in")}</a>
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              {/* Hidden upload input for per-tool buttons */}
              <input id="upload-input" type="file" className="sr-only" aria-hidden="true" accept=".pdf,.doc,.docx,.txt,image/*" onChange={makeOnFileSelected()} disabled={uploading} />

              {/* Right: Actions list */}
              <div className="space-y-3">
                <ul className="space-y-3">
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => { setSelectedAction('Summarize Long Documents'); toast({ title: 'AI tool selected', description: 'Summarize Long Documents' }); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45 ${selectedAction === 'Summarize Long Documents' ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
                        >
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <FileText className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getTranslation("Summarize Long Documents")}</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">
                          Condense lengthy reports or contracts into key points so you can quickly grasp the essentials.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={uploading}
                             onClick={handleUploadClick('Summarize Long Documents')}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                          >
                            Upload
                          </Button>
                          {selectedFile && (
                            <Button size="sm" variant="accent" disabled={startingAI}
                              onClick={() => onStartAI('Summarize Long Documents')}>
                              Start AI
                            </Button>
                          )}
                        </div>
                        {selectedFile && selectedAction === 'Summarize Long Documents' && previewKind === 'image' && previewUrl && (
                          <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                            <img src={previewUrl} alt="Uploaded image preview for Summarize Long Documents" loading="lazy" className="max-h-48 w-full object-contain rounded-md" />
                          </div>
                        )}
                        <div
                          className={`mt-3 flex items-center justify-center rounded-xl border border-dashed p-6 transition-colors ${dragActive ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-muted/30 hover:bg-muted/40'}`}
                           onClick={handleUploadClick('Summarize Long Documents')}
                           onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleUploadClick('Summarize Long Documents')(); } }}
                          role="button"
                          tabIndex={0}
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                          onDrop={onDropGuarded('summarize', 'Summarize Long Documents')}
                          aria-label="Drag and drop a file here or click to upload"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Upload className="size-5 text-primary" />
                            <span className="text-sm">{uploading ? 'Uploading…' : uploadedName ? `Selected: ${uploadedName}` : 'Drag & drop a file or click to upload'}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => { setSelectedAction('Cross-Doc Linker'); toast({ title: 'AI tool selected', description: 'Cross-Doc Linker' }); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45 ${selectedAction === 'Cross-Doc Linker' ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
                        >
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <Upload className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getTranslation("Cross-Doc Linker")}</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Find related documents and link supporting evidence.</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" variant="secondary" disabled={uploading}
                            onClick={handleUploadClick('Cross-Doc Linker')}>
                            Upload
                          </Button>
                          {selectedFile && (
                            <Button size="sm" variant="accent" disabled={startingAI}
                              onClick={() => onStartAI('Cross-Doc Linker')}>
                              Start AI
                            </Button>
                          )}
                        </div>
                        {selectedFile && selectedAction === 'Cross-Doc Linker' && previewKind === 'image' && previewUrl && (
                          <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                            <img src={previewUrl} alt="Uploaded image preview for Cross-Doc Linker" loading="lazy" className="max-h-48 w-full object-contain rounded-md" />
                          </div>
                        )}
                        <div
                          className={`mt-3 flex items-center justify-center rounded-xl border border-dashed p-6 transition-colors ${dragActive ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-muted/30 hover:bg-muted/40'}`}
                            onClick={handleUploadClick('Cross-Doc Linker')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleUploadClick('Cross-Doc Linker')(); } }}
                          role="button"
                          tabIndex={0}
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                          onDrop={onDropGuarded('ocr', 'Cross-Doc Linker')}
                          aria-label="Drag and drop a file here or click to upload"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Upload className="size-5 text-primary" />
                            <span className="text-sm">{uploading ? 'Uploading…' : uploadedName ? `Selected: ${uploadedName}` : 'Drag & drop a file or click to upload'}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => { setSelectedAction('Translate & Localize'); toast({ title: 'AI tool selected', description: 'Translate & Localize' }); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45 ${selectedAction === 'Translate & Localize' ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
                        >
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <Languages className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{getTranslation("Translate & Localize")}</p>
                          </div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Automatically translate documents into multiple languages while preserving layout and formatting.</p>
                         <div className="mt-3 flex items-center gap-2">
                           <Button size="sm" variant="secondary" disabled={uploading}
                             onClick={handleUploadClick('Translate & Localize')}>
                             Upload
                           </Button>
                           <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                               <Button size="sm" variant="outline">Language: {selectedLanguage}</Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="start" className="z-50 bg-background">
                               <DropdownMenuLabel>Choose language</DropdownMenuLabel>
                               <DropdownMenuItem onClick={() => setSelectedLanguage('English')}>English</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setSelectedLanguage('Dutch')}>Dutch</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setSelectedLanguage('German')}>German</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setSelectedLanguage('French')}>French</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setSelectedLanguage('Spanish')}>Spanish</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setSelectedLanguage('Italian')}>Italian</DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setSelectedLanguage('Portuguese')}>Portuguese</DropdownMenuItem>
                             </DropdownMenuContent>
                           </DropdownMenu>
                           {selectedFile && (
                             <Button size="sm" variant="accent" disabled={startingAI}
                               onClick={() => onStartAI('Translate & Localize')}>
                               Start AI
                             </Button>
                           )}
                           </div>
                           {selectedFile && selectedAction === 'Translate & Localize' && previewKind === 'image' && previewUrl && (
                             <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                               <img src={previewUrl} alt="Uploaded image preview for Translate & Localize" loading="lazy" className="max-h-48 w-full object-contain rounded-md" />
                             </div>
                           )}
                        <div
                          className={`mt-3 flex items-center justify-center rounded-xl border border-dashed p-6 transition-colors ${dragActive ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-muted/30 hover:bg-muted/40'}`}
                              onClick={handleUploadClick('Translate & Localize')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleUploadClick('Translate & Localize')(); } }}
                          role="button"
                          tabIndex={0}
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                          onDrop={onDropGuarded('translate', 'Translate & Localize')}
                          aria-label="Drag and drop a file here or click to upload"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Upload className="size-5 text-primary" />
                            <span className="text-sm">{uploading ? 'Uploading…' : uploadedName ? `Selected: ${uploadedName}` : 'Drag & drop a file or click to upload'}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => { setSelectedAction('Contract Analysis & Risk Detection'); toast({ title: 'AI tool selected', description: 'Contract Analysis & Risk Detection' }); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45 ${selectedAction === 'Contract Analysis & Risk Detection' ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
                        >
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <ShieldCheck className="size-4" />
                          </div>
<div className="flex-1">
  <div className="flex items-center gap-2">
    <p className="font-medium">{getTranslation("Contract Analysis & Risk Detection")}</p>
    <Badge variant="secondary">PRO</Badge>
  </div>
</div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Scan legal documents to identify clauses, obligations, and potential risks.</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" variant="secondary" disabled={uploading}
                            onClick={handleUploadClick('Contract Analysis & Risk Detection')}>
                            Upload
                          </Button>
                          {selectedFile && (
                            <Button size="sm" variant="accent" disabled={startingAI}
                              onClick={() => onStartAI('Contract Analysis & Risk Detection')}>
                              Start AI
                            </Button>
                          )}
                         </div>
                         {selectedFile && selectedAction === 'Contract Analysis & Risk Detection' && previewKind === 'image' && previewUrl && (
                           <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                             <img src={previewUrl} alt="Uploaded image preview for Contract Analysis & Risk Detection" loading="lazy" className="max-h-48 w-full object-contain rounded-md" />
                           </div>
                         )}
                        <div
                          className={`mt-3 flex items-center justify-center rounded-xl border border-dashed p-6 transition-colors ${dragActive ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-muted/30 hover:bg-muted/40'}`}
                             onClick={handleUploadClick('Contract Analysis & Risk Detection')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleUploadClick('Contract Analysis & Risk Detection')(); } }}
                          role="button"
                          tabIndex={0}
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                          onDrop={onDropGuarded('contract', 'Contract Analysis & Risk Detection')}
                          aria-label="Drag and drop a file here or click to upload"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Upload className="size-5 text-primary" />
                            <span className="text-sm">{uploading ? 'Uploading…' : uploadedName ? `Selected: ${uploadedName}` : 'Drag & drop a file or click to upload'}</span>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </li>
                  <li className="p-0">
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <button
                          onClick={() => { setSelectedAction('Smart Error Detection'); toast({ title: 'AI tool selected', description: 'Smart Error Detection' }); }}
                          className={`w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 transition-colors text-left [&[data-state=open]>svg]:rotate-45 ${selectedAction === 'Smart Error Detection' ? 'bg-primary/5 ring-1 ring-primary/30' : ''}`}
                        >
                          <div className="size-9 rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                            <PenLine className="size-4" />
                          </div>
<div className="flex-1">
  <div className="flex items-center gap-2">
    <p className="font-medium">{getTranslation("Smart Error Detection")}</p>
    <Badge variant="secondary">PRO</Badge>
  </div>
</div>
                          <Plus className="size-4 text-muted-foreground transition-transform" />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3 overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <p className="text-sm text-muted-foreground">Spot spelling, grammar, and numerical inconsistencies and suggest corrections.</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Button size="sm" variant="secondary" disabled={uploading}
                            onClick={handleUploadClick('Smart Error Detection')}>
                            Upload
                          </Button>
                          {selectedFile && (
                            <Button size="sm" variant="accent" disabled={startingAI}
                              onClick={() => onStartAI('Smart Error Detection')}>
                              Start AI
                            </Button>
                          )}
                         </div>
                         {selectedFile && selectedAction === 'Smart Error Detection' && previewKind === 'image' && previewUrl && (
                           <div className="mt-3 rounded-lg border bg-muted/20 p-3">
                             <img src={previewUrl} alt="Uploaded image preview for Smart Error Detection" loading="lazy" className="max-h-48 w-full object-contain rounded-md" />
                           </div>
                         )}
                        <div
                          className={`mt-3 flex items-center justify-center rounded-xl border border-dashed p-6 transition-colors ${dragActive ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-muted/30 hover:bg-muted/40'}`}
                             onClick={handleUploadClick('Smart Error Detection')}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleUploadClick('Smart Error Detection')(); } }}
                          role="button"
                          tabIndex={0}
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                          onDrop={onDropGuarded('errors', 'Smart Error Detection')}
                          aria-label="Drag and drop a file here or click to upload"
                        >
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Upload className="size-5 text-primary" />
                            <span className="text-sm">{uploading ? 'Uploading…' : uploadedName ? `Selected: ${uploadedName}` : 'Drag & drop a file or click to upload'}</span>
                          </div>
                        </div>
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
            <h2 className="text-3xl font-semibold">{getTranslation("How it works")}</h2>
            <p className="text-muted-foreground">{getTranslation("Go from upload to insights in four simple steps.")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">1</span>
                <Upload className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">{getTranslation("Upload Your Document")}</h3>
            </article>

            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in [animation-delay:60ms]">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">2</span>
                <FileText className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">{getTranslation("Choose an AI Processing Option")}</h3>
            </article>

            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in [animation-delay:120ms]">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">3</span>
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">{getTranslation("AI Processes Your Document")}</h3>
            </article>

            <article className="rounded-xl border bg-card text-card-foreground p-6 hover-scale animate-fade-in [animation-delay:180ms]">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 font-semibold">4</span>
                <PenLine className="size-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-medium">{getTranslation("Review Your Results")}</h3>
            </article>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="container py-12 md:py-20">
          <div className="mx-auto max-w-3xl text-center mb-10">
            <h2 className="text-3xl font-semibold">{getTranslation("Simple pricing")}</h2>
            <p className="text-muted-foreground">{getTranslation("Switch to yearly and save.")}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className={`text-sm ${!yearly ? 'font-semibold' : 'text-muted-foreground'}`}>{getTranslation("Monthly")}</span>
              <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Toggle yearly pricing" />
              <span className={`text-sm ${yearly ? 'font-semibold' : 'text-muted-foreground'}`}>{getTranslation("Yearly")}</span>
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
              </div>
            </div>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <form onSubmit={onContactSubmit} className="space-y-4" aria-label="Contact form">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">{getTranslation("Your name")}</Label>
                      <Input id="contact-name" name="name" placeholder="Jane Doe" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">{getTranslation("Email")}</Label>
                      <Input id="contact-email" name="email" type="email" placeholder="you@example.com" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">{getTranslation("Subject")}</Label>
                    <Input id="contact-subject" name="subject" placeholder={getTranslation("How can we help?")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">{getTranslation("Message")}</Label>
                    <Textarea id="contact-message" name="message" placeholder={getTranslation("Tell us a bit about your question...")} rows={5} required />
                  </div>
                  <Button type="submit" className="w-full hover-scale">{getTranslation("Send message")}</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Index;
