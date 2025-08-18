import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, Rocket, ArrowLeft, Star, Zap, Shield, HeadphonesIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Check authentication status
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthed(!!session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthed(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const plans = [
    {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      description: 'Perfect for getting started',
      features: [
        'Basic AI tools',
        '5 documents per month',
        'Standard processing speed',
        'Email support',
        '1GB storage'
      ],
      popular: false,
      cta: 'Current Plan',
      disabled: true
    },
    {
      name: 'Pro',
      price: { monthly: 29, yearly: 24 },
      description: 'Best for professionals',
      features: [
        'All AI tools included',
        'Unlimited documents',
        'Priority processing',
        'Advanced analytics',
        '100GB storage',
        'Priority support',
        'API access',
        'Custom templates'
      ],
      popular: true,
      cta: 'Upgrade to Pro',
      disabled: false
    },
    {
      name: 'Enterprise',
      price: { monthly: 99, yearly: 84 },
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Admin dashboard',
        'SSO integration',
        'Unlimited storage',
        'Dedicated support',
        'Custom integrations',
        'White-label options',
        'SLA guarantee'
      ],
      popular: false,
      cta: 'Contact Sales',
      disabled: false
    }
  ];

  const handleUpgrade = async (planName: string) => {
    if (!isAuthed) {
      toast({
        title: "Authentication required",
        description: "Please log in to upgrade your plan.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (planName === 'Enterprise') {
      // Scroll to contact section or navigate to contact
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setLoading(true);
    
    try {
      // Here you would integrate with your payment processor (Stripe, etc.)
      // For now, we'll show a success message
      toast({
        title: "Upgrade initiated",
        description: `Starting upgrade to ${planName} plan...`,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Upgrade successful",
        description: `Welcome to ${planName}! Your new features are now active.`,
      });
      
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Upgrade failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Pricing Plans | Choose the Perfect Plan for You</title>
        <meta name="description" content="Choose the perfect AI document processing plan. Free, Pro, and Enterprise options available with powerful features." />
        <link rel="canonical" href="/pricing" />
      </Helmet>

      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate(-1)}
              variant="ghost" 
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">Pricing Plans</h1>
          </div>
          <Button asChild variant="secondary" size="sm">
            <a href="/dashboard">Dashboard</a>
          </Button>
        </nav>
      </header>

      <main className="container py-8 animate-enter">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Unlock the full power of AI document processing with flexible pricing options designed for individuals, professionals, and teams.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className={`text-sm ${!yearly ? 'font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch
                checked={yearly}
                onCheckedChange={setYearly}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-sm ${yearly ? 'font-medium' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">
                      ${yearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {yearly && plan.price.monthly !== plan.price.yearly && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="line-through">${plan.price.monthly}/month</span> billed annually
                    </p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full mt-6" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={plan.disabled || loading}
                >
                  {plan.name === 'Pro' && <Rocket className="h-4 w-4 mr-2" />}
                  {loading ? 'Processing...' : plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Features Comparison */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Feature Comparison</h2>
            <p className="text-muted-foreground">See what's included in each plan</p>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Features</th>
                    <th className="text-center p-4 font-medium">Free</th>
                    <th className="text-center p-4 font-medium bg-primary/5">Pro</th>
                    <th className="text-center p-4 font-medium">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'AI Document Processing', free: '✓', pro: '✓', enterprise: '✓' },
                    { feature: 'Monthly Document Limit', free: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
                    { feature: 'Storage', free: '1GB', pro: '100GB', enterprise: 'Unlimited' },
                    { feature: 'Processing Speed', free: 'Standard', pro: 'Priority', enterprise: 'Dedicated' },
                    { feature: 'Advanced Analytics', free: '✗', pro: '✓', enterprise: '✓' },
                    { feature: 'API Access', free: '✗', pro: '✓', enterprise: '✓' },
                    { feature: 'Team Collaboration', free: '✗', pro: '✗', enterprise: '✓' },
                    { feature: 'SSO Integration', free: '✗', pro: '✗', enterprise: '✓' },
                    { feature: 'Support', free: 'Email', pro: 'Priority', enterprise: 'Dedicated' }
                  ].map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4 font-medium">{row.feature}</td>
                      <td className="p-4 text-center text-sm">{row.free}</td>
                      <td className="p-4 text-center text-sm bg-primary/5">{row.pro}</td>
                      <td className="p-4 text-center text-sm">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Everything you need to know about our pricing</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">We accept all major credit cards, PayPal, and bank transfers for Enterprise customers.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Our Free plan gives you access to basic features. Pro and Enterprise plans come with a 14-day free trial.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens to my data if I cancel?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Your data is retained for 30 days after cancellation, giving you time to export or reactivate your account.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="text-center">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">Enterprise-grade security with end-to-end encryption</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Process documents in seconds with our AI technology</p>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <HeadphonesIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-medium">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Get help whenever you need it from our expert team</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}