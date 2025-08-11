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
              <img src="/lovable-uploads/a7b1bee9-2646-4fcd-81c2-e4eceadd26f0.png" alt="AI Docu logo" className="h-[4.5rem] w-auto" loading="lazy" width={288} height={72} />
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
                        ) : link.label === "Privacy Policy" ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <button type="button" className="hover:text-foreground">
                                {link.label}
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Privacy Policy – AI-Docu</DialogTitle>
                                <DialogDescription>Effective Date: 12-08-2025</DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[60vh] pr-2">
                                <article className="space-y-4 text-sm leading-6 text-muted-foreground">
                                  <p>This Privacy Policy explains how AI-Docu (“we,” “our,” or “us”) collects, uses, stores, and protects your personal information when you use our services, including AI-powered tools, document generation, and other features available on www.ai-docu.com.</p>
                                  <p>By using our services, you agree to the terms described in this Privacy Policy.</p>
                                  <section>
                                    <h3 className="font-medium text-foreground">1. Information We Collect</h3>
                                    <p>We may collect the following types of information:</p>
                                    <h4 className="mt-2 font-medium text-foreground">a. Personal Information</h4>
                                    <p>When you create an account or use our services, we may collect:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      <li>Name</li>
                                      <li>Contact details (e.g., email address, phone number)</li>
                                      <li>Login credentials</li>
                                      <li>Payment and transaction details</li>
                                      <li>Any content you upload (text, files, images, audio, etc.)</li>
                                    </ul>
                                    <h4 className="mt-2 font-medium text-foreground">b. Usage and Technical Data</h4>
                                    <p>We automatically collect information such as:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      <li>IP address</li>
                                      <li>Browser type and settings</li>
                                      <li>Timestamps of usage</li>
                                      <li>Device information</li>
                                      <li>Location data (via IP address or, if enabled, GPS)</li>
                                      <li>Usage patterns and interaction data</li>
                                    </ul>
                                    <h4 className="mt-2 font-medium text-foreground">c. Cookies and Similar Technologies</h4>
                                    <p>We use cookies and similar technologies to operate our services, improve your user experience, and analyze traffic.</p>
                                  </section>
                                  <section>
                                    <h3 className="font-medium text-foreground">2. How We Use Your Information</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                      <li>Deliver, operate, and maintain our services</li>
                                      <li>Manage accounts and process transactions</li>
                                      <li>Improve service quality, research, and develop new features</li>
                                      <li>Communicate with you about updates, features, or service changes</li>
                                      <li>Ensure security, prevent fraud, and comply with legal obligations</li>
                                      <li>Produce anonymized and aggregated statistical insights for research and analytics</li>
                                    </ul>
                                  </section>
                                  <section>
                                    <h3 className="font-medium text-foreground">3. Content Ownership, AI Training & Data Processing</h3>
                                    <p>You retain all rights to the content you provide (“Input”) and the output generated by our services (“Output”).</p>
                                    <p>AI-Docu only obtains the rights necessary to operate and provide our services, comply with laws, and prevent misuse.</p>
                                    <p className="mt-2">AI-Docu Web and App Users: Your input may be used to improve our AI models unless you explicitly opt out via your account settings.</p>
                                    <p>API Users (Business Clients): Data provided via our API is not used for AI training by default, unless explicitly agreed otherwise. We also offer a Zero Data Retention (ZDR) option for API use.</p>
                                  </section>
                                  <section>
                                    <h3 className="font-medium text-foreground">4. Data Security & Compliance</h3>
                                    <p>We apply strict security measures, including:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      <li>Encryption at rest (AES-256) and in transit (TLS 1.2 or higher)</li>
                                      <li>Regular security audits and monitoring</li>
                                      <li>Compliance with industry standards such as SOC 2 Type II, GDPR, CCPA, HIPAA</li>
                                      <li>A dedicated security portal for compliance transparency</li>
                                    </ul>
                                  </section>
                                  <section>
                                    <h3 className="font-medium text-foreground">5. Your Privacy Rights</h3>
                                    <p>Depending on your location, you may have the right to:</p>
                                    <ul className="list-disc pl-5 space-y-1">
                                      <li>Access, correct, or delete your personal data</li>
                                      <li>Request a copy of your data</li>
                                      <li>Restrict or object to certain processing activities</li>
                                      <li>Opt out of AI training on your data</li>
                                      <li>Use our Temporary Chat Mode to have conversations automatically deleted</li>
                                    </ul>
                                    <p>You can exercise these rights via our Privacy Portal or by contacting our support team.</p>
                                  </section>
                                  <section>
                                    <h3 className="font-medium text-foreground">6. Limitations & Privacy Risks</h3>
                                    <p>Conversations and data exchanged with AI-Docu are not protected by professional privilege (e.g., as in attorney–client or doctor–patient relationships).</p>
                                    <p>While we take strong precautions, no online service is completely risk-free.</p>
                                    <p>External integrations (“Actions”) used within AI-Docu may collect additional data, and their privacy practices are governed by their own policies.</p>
                                  </section>
                                  <section>
                                    <h3 className="font-medium text-foreground">7. Changes to This Policy</h3>
                                    <p>We may update this Privacy Policy from time to time. Significant changes will be communicated via email or on our website before taking effect.</p>
                                  </section>
                                  <section>
                                    <h3 className="font-medium text-foreground">8. Contact Us</h3>
                                    <p>If you have questions about this Privacy Policy or our data practices, please contact:</p>
                                    <p>AI-Docu – Privacy Office</p>
                                    <p>Website: www.ai-docu.com</p>
                                    <p>Contact Form: You can also submit your inquiry directly via the contact form available on our website.</p>
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
