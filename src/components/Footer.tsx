import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  BadgeCheck,
  Lock,
  Scale,
  Stethoscope,
  Orbit,
  Twitter,
  Github,
  Instagram,
  MessageSquare,
} from "lucide-react";

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
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background">
                <Orbit className="h-5 w-5" aria-hidden="true" />
              </span>
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
                      <a href={link.href} className="hover:text-foreground">
                        {link.label}
                      </a>
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
