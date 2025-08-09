import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const onLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const email = (formData.get('loginEmail') as string)?.trim();
      const password = (formData.get('loginPassword') as string) ?? "";

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully');
        navigate('/');
      }
    } catch (err) {
      toast.error('Unexpected error signing in.');
    } finally {
      setLoading(false);
    }
  };
  const onSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const firstName = (data.get('firstName') as string)?.trim();
    const lastName = (data.get('lastName') as string)?.trim();
    const email = (data.get('email') as string)?.trim();
    const password = data.get('password') as string;
    const confirmPassword = data.get('confirmPassword') as string;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        if (signUpData.session?.user) {
          await supabase.from('profiles').upsert({
            id: signUpData.session.user.id,
            first_name: firstName,
            last_name: lastName,
          });
          toast.success('Account created! Redirecting...');
          navigate('/');
        } else {
          toast.info('Please check your email to confirm your account.');
        }
      }
    } catch (err) {
      toast.error('Unexpected error creating account.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Helmet>
        <title>Sign in or create an account – DocMind AI</title>
        <meta name="description" content="Sign in or create an account to use DocMind AI." />
        <link rel="canonical" href="/login" />
      </Helmet>

      <main>
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-semibold tracking-tight mb-6">Sign in or create an account</h1>
            <Card className="shadow-sm">
              <CardHeader>
                <p className="text-sm text-muted-foreground">Choose an option to continue.</p>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="login">Sign in</TabsTrigger>
                    <TabsTrigger value="signup">Create account</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={onLoginSubmit} className="space-y-4" aria-label="Login form">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" name="loginEmail" type="email" placeholder="you@example.com" required autoComplete="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="loginPassword" type="password" placeholder="••••••••" required autoComplete="current-password" />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                      </Button>
                      <div className="text-sm text-muted-foreground flex items-center justify-between">
                        <a href="#" className="hover:text-foreground">Forgot your password?</a>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={onSignupSubmit} className="space-y-4" aria-label="Signup form">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">First name</Label>
                          <Input id="first-name" name="firstName" type="text" placeholder="John" required autoComplete="given-name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Last name</Label>
                          <Input id="last-name" name="lastName" type="text" placeholder="Doe" required autoComplete="family-name" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email address</Label>
                        <Input id="signup-email" name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input id="signup-password" name="password" type="password" placeholder="••••••••" required autoComplete="new-password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm password</Label>
                          <Input id="confirm-password" name="confirmPassword" type="password" placeholder="••••••••" required autoComplete="new-password" />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Processing..." : "Create account"}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">By creating an account you agree to our terms.</p>
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
