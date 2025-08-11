import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  BadgeCheck,
  Lock,
  Scale,
  Stethoscope,
  Twitter,
  Github,
  Instagram,
  MessageSquare,
} from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const columns: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Use Cases",
    links: [
      { label: "Sales", href: "#" },
      { label: "Support", href: "#" },
      { label: "Consulting", href: "#" },
      { label: "Recruiting", href: "#" },
    ],
  },
  {
    title: "Enterprise",
    links: [
      { label: "DocMind for Enterprise", href: "#" },
      { label: "Enterprise Security", href: "#" },
      { label: "Vendor Profile", href: "#" },
      { label: "ROI Calculator", href: "#" },
      { label: "Book A Demo", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Pricing", href: "#pricing" },
      { label: "Manifesto", href: "#" },
      { label: "Press", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Bug Bounty", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Marketing", href: "#" },
      { label: "Data Transfer Agreement", href: "#" },
    ],
  },
];

function StatusPill() {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-xs text-foreground/80 bg-background"
      aria-live="polite"
    >
      <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" aria-hidden="true" />
      All systems operational
    </span>
  );
}

function ComplianceBadges() {
  const badgeClass = "bg-secondary text-secondary-foreground border";
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <Badge className={cn(badgeClass)}>
        <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> SOC 2 Type I
      </Badge>
      <Badge className={cn(badgeClass)}>
        <ShieldCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> SOC 2 Type II
      </Badge>
      <Badge className={cn(badgeClass)}>
        <BadgeCheck className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> ISO 27001
      </Badge>
      <Badge className={cn(badgeClass)}>
        <Lock className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> GDPR
      </Badge>
      <Badge className={cn(badgeClass)}>
        <Scale className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> CCPA Compliant
      </Badge>
      <Badge className={cn(badgeClass)}>
        <Stethoscope className="mr-1 h-3.5 w-3.5" aria-hidden="true" /> HIPAA
      </Badge>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-12">
          {/* Left brand + status + badges */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2" aria-label="DocMind AI home">
              <span className="text-lg font-semibold tracking-tight">DocMind AI</span>
            </Link>
            <StatusPill />
            <ComplianceBadges />
          </div>

          {/* Link columns */}
          <nav className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8" aria-label="Footer navigation">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold mb-3">{col.title}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.label === "Terms of Service" ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <button type="button" className="hover:text-foreground">
                              {link.label}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Terms of Service</DialogTitle>
                              <DialogDescription>Last updated: 2025</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh] pr-2">
                              <article className="space-y-4 text-sm leading-6 text-muted-foreground">
                                <section>
                                  <h3 className="font-medium text-foreground">1. Scope & Applicability</h3>
                                  <p>These terms apply to your use of AI-Docu’s services, including any AI-powered tools, document generation, and related features provided on www.ai-docu.com. They form an agreement between you and AI-Docu.</p>
                                </section>
                                <section>
                                  <h3 className="font-medium text-foreground">2. Age & Registration</h3>
                                  <p>You must be at least 13 years old or meet the minimum age of consent in your country.</p>
                                  <p>When registering, you must provide accurate information, not share your account, and you are responsible for all activities conducted under your account.</p>
                                </section>
                                <section>
                                  <h3 className="font-medium text-foreground">3. Permitted & Prohibited Use</h3>
                                  <p>You may use the services in compliance with applicable laws and regulations, and in accordance with all relevant policy pages (such as AI-Docu’s Usage Policies and Privacy Policy).</p>
                                  <p>You may not:</p>
                                  <ul className="list-disc pl-5 space-y-1">
                                    <li>Modify, copy, rent, sell, or distribute the services.</li>
                                    <li>Reverse-engineer or attempt to discover the underlying components of the service.</li>
                                    <li>Automatically extract data or output (such as scraping).</li>
                                    <li>Present output as if it were generated by a human without disclosure that it is AI-generated.</li>
                                    <li>Use output to develop competing AI models.</li>
                                    <li>Sabotage the service or bypass security measures.</li>
                                  </ul>
                                </section>
                                <section>
                                  <h3 className="font-medium text-foreground">4. Content & Ownership</h3>
                                  <p>Input (your questions, prompts, or uploaded data) and Output (the generated responses or documents) together form the “Content.” You are responsible for your Content and guarantee you have the rights to provide it.</p>
                                  <p>You retain ownership of both your input and the generated output. AI-Docu assigns to you all rights it may have to this content.</p>
                                </section>
                                <section>
                                  <h3 className="font-medium text-foreground">5. Use of Content by AI-Docu</h3>
                                  <p>AI-Docu may use your Content to deliver, maintain, and improve the services, comply with the law, prevent misuse, and enforce its terms and policies.</p>
                                </section>
                                <section>
                                  <h3 className="font-medium text-foreground">6. Liability & Warranty</h3>
                                  <p>AI-Docu makes no guarantees regarding accuracy, reliability, or error-free operation. Output may be incorrect or inappropriate—you are responsible for verifying it.</p>
                                  <p>AI-Docu’s liability is limited to the greater of the amount you paid in the past 12 months or $100.</p>
                                </section>
                                <section>
                                  <h3 className="font-medium text-foreground">7. Termination & Suspension</h3>
                                  <p>AI-Docu may terminate or suspend your access in cases of violation of the terms, legal requirements, or if your use poses risks.</p>
                                </section>
                                <section>
                                  <h3 className="font-medium text-foreground">8. Dispute Resolution: Arbitration & Class Action Waiver</h3>
                                  <p>You agree that disputes will be resolved through arbitration and that participation in class actions is waived. You may opt out within 30 days of creating your account or after updates by submitting a form to AI-Docu.</p>
                                </section>
                              </article>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <a href={link.href} className="hover:text-foreground">
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Subprocessors note */}
        <div className="mt-10 text-sm text-muted-foreground">
          Subprocessors include OpenAI, Anthropic, AWS (Deepgram), and Vercel. *In observation period for SOC 2 Type II compliance.
        </div>

        <div className="mt-6 border-t" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} DocMind AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-foreground/90">
            <a href="#" aria-label="X (formerly Twitter)" className="hover:opacity-80 transition-opacity"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="Discord" className="hover:opacity-80 transition-opacity"><MessageSquare className="h-5 w-5" /></a>
            <a href="#" aria-label="Instagram" className="hover:opacity-80 transition-opacity"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="GitHub" className="hover:opacity-80 transition-opacity"><Github className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
