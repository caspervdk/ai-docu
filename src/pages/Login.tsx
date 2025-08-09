import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.info("Inloggen is nog niet geconfigureerd. Wil je dat ik Supabase-auth inschakel?");
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Log in – DocMind AI</title>
        <meta name="description" content="Log in to DocMind AI to access your AI-powered document assistant." />
        <link rel="canonical" href="/login" />
      </Helmet>

      <main>
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-semibold tracking-tight mb-6">Log in</h1>
            <Card className="shadow-sm">
              <CardHeader>
                <p className="text-sm text-muted-foreground">Welkom terug. Vul je gegevens in om verder te gaan.</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4" aria-label="Login form">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input id="email" type="email" placeholder="jij@voorbeeld.com" required autoComplete="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Wachtwoord</Label>
                    <Input id="password" type="password" placeholder="••••••••" required autoComplete="current-password" />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Bezig met inloggen..." : "Log in"}
                  </Button>
                  <div className="text-sm text-muted-foreground flex items-center justify-between">
                    <a href="#" className="hover:text-foreground">Wachtwoord vergeten?</a>
                    <span>
                      Nieuw hier? <Link to="/" className="text-primary hover:underline">Maak een account</Link>
                    </span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
};

export default Login;
