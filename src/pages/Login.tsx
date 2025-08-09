import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [loading, setLoading] = useState(false);

  const onLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.info("Inloggen is nog niet geconfigureerd. Zal ik Supabase-auth inschakelen?");
      setLoading(false);
    }, 500);
  };

  const onSignupSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.info("Account aanmaken is nog niet geconfigureerd. Zal ik Supabase-auth inschakelen?");
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <Helmet>
        <title>Inloggen of account aanmaken – DocMind AI</title>
        <meta name="description" content="Log in of maak een account aan bij DocMind AI om je AI-documentassistent te gebruiken." />
        <link rel="canonical" href="/login" />
      </Helmet>

      <main>
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-semibold tracking-tight mb-6">Inloggen of account aanmaken</h1>
            <Card className="shadow-sm">
              <CardHeader>
                <p className="text-sm text-muted-foreground">Kies een optie om door te gaan.</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="login">Log in</TabsTrigger>
                    <TabsTrigger value="signup">Maak account</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={onLoginSubmit} className="space-y-4" aria-label="Login form">
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
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={onSignupSubmit} className="space-y-4" aria-label="Signup form">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">E-mailadres</Label>
                        <Input id="signup-email" type="email" placeholder="jij@voorbeeld.com" required autoComplete="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Wachtwoord</Label>
                        <Input id="signup-password" type="password" placeholder="••••••••" required autoComplete="new-password" />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Bezig..." : "Account aanmaken"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">Door een account te maken ga je akkoord met onze voorwaarden.</p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
};

export default Login;
