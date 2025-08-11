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
import { ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
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
        navigate('/dashboard');
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
          }, { onConflict: 'id' });
          toast.success('Account created! Redirecting...');
          navigate('/dashboard');
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

  const onResetSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const email = (formData.get("resetEmail") as string)?.trim() || resetEmail.trim();
      if (!email) {
        toast.error("Please enter your email address.");
        return;
      }
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent. Check your inbox.");
        setResetOpen(false);
      }
    } catch (err) {
      toast.error("Unexpected error sending reset email.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset or sign in – DocMind AI</title>
        <meta name="description" content="Reset your password or sign in to your DocMind AI account." />
        <link rel="canonical" href="/login" />
      </Helmet>

      <main>
        <section className="container py-16 md:py-24">
          <div className="mx-auto max-w-md">
            <div className="mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" />Go back home</Link>
              </Button>
            </div>
            <a href="/" className="flex items-center justify-center mb-6" aria-label="AI Docu home">
              <img src="/lovable-uploads/e443a8b9-e81f-4b9a-815b-1b4745a36b86.png" alt="AI Docu logo" className="h-14 w-auto" loading="eager" />
            </a>
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
                        <button type="button" className="hover:text-foreground underline" onClick={() => setResetOpen(true)}>Forgot your password?</button>
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
                      <p className="text-xs text-muted-foreground text-center">By creating an account you agree to <button type="button" className="underline hover:text-foreground" onClick={() => setTermsOpen(true)}>our terms</button>.</p>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
           <Dialog open={resetOpen} onOpenChange={setResetOpen}>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Reset your password</DialogTitle>
                 <DialogDescription>
                   Enter your email address and we will send you a password reset link.
                 </DialogDescription>
               </DialogHeader>
               <form onSubmit={onResetSubmit} className="space-y-4" aria-label="Password reset form">
                 <div className="space-y-2">
                   <Label htmlFor="reset-email">Email address</Label>
                   <Input
                     id="reset-email"
                     name="resetEmail"
                     type="email"
                     placeholder="you@example.com"
                     value={resetEmail}
                     onChange={(e) => setResetEmail(e.target.value)}
                     required
                     autoComplete="email"
                   />
                 </div>
                 <DialogFooter>
                   <Button type="button" variant="outline" onClick={() => setResetOpen(false)}>
                     Cancel
                   </Button>
                   <Button type="submit" disabled={resetLoading}>
                     {resetLoading ? "Sending..." : "Send reset link"}
                   </Button>
                 </DialogFooter>
               </form>
             </DialogContent>
            </Dialog>
            <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                  <DialogDescription>Last updated: 2025</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-2"><div className="space-y-4 text-sm leading-6">
                  <section>
                    <h3 className="font-semibold">1. Scope & Applicability</h3>
                    <p>These terms apply to your use of AI-Docu’s services, including any AI-powered tools, document generation, and related features provided on www.ai-docu.com. They form an agreement between you and AI-Docu.</p>
                  </section>
                  <section>
                    <h3 className="font-semibold">2. Age & Registration</h3>
                    <p>You must be at least 13 years old or meet the minimum age of consent in your country.</p>
                    <p>When registering, you must provide accurate information, not share your account, and you are responsible for all activities conducted under your account.</p>
                  </section>
                  <section>
                    <h3 className="font-semibold">3. Permitted & Prohibited Use</h3>
                    <p>You may use the services in compliance with applicable laws and regulations, and in accordance with all relevant policy pages (such as AI-Docu’s Usage Policies and Privacy Policy).</p>
                    <p className="mt-2">You may not:</p>
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
                    <h3 className="font-semibold">4. Content & Ownership</h3>
                    <p>Input (your questions, prompts, or uploaded data) and Output (the generated responses or documents) together form the “Content.” You are responsible for your Content and guarantee you have the rights to provide it.</p>
                    <p>You retain ownership of both your input and the generated output. AI-Docu assigns to you all rights it may have to this content.</p>
                  </section>
                  <section>
                    <h3 className="font-semibold">5. Use of Content by AI-Docu</h3>
                    <p>AI-Docu may use your Content to deliver, maintain, and improve the services, comply with the law, prevent misuse, and enforce its terms and policies.</p>
                  </section>
                  <section>
                    <h3 className="font-semibold">6. Liability & Warranty</h3>
                    <p>AI-Docu makes no guarantees regarding accuracy, reliability, or error-free operation. Output may be incorrect or inappropriate—you are responsible for verifying it.</p>
                    <p>AI-Docu’s liability is limited to the greater of the amount you paid in the past 12 months or $100.</p>
                  </section>
                  <section>
                    <h3 className="font-semibold">7. Termination & Suspension</h3>
                    <p>AI-Docu may terminate or suspend your access in cases of violation of the terms, legal requirements, or if your use poses risks.</p>
                  </section>
                  <section>
                    <h3 className="font-semibold">8. Dispute Resolution: Arbitration & Class Action Waiver</h3>
                    <p>You agree that disputes will be resolved through arbitration and that participation in class actions is waived. You may opt out within 30 days of creating your account or after updates by submitting a form to AI-Docu.</p>
                  </section>
                </div></ScrollArea>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setTermsOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
        </section>
      </main>
    </>
  );
};

export default Login;
