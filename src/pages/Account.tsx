import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Globe, MapPin, Calendar, Star, Bookmark } from "lucide-react";
import { useEffect } from "react";

export default function Account() {
  // Scroll to top with a nice animation on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Helmet>
        <title>My Account | Profile overview</title>
        <meta name="description" content="View your profile details, contact information, and activity." />
        <link rel="canonical" href="/account" />
      </Helmet>

      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-14 items-center justify-between">
          <h1 className="text-lg font-semibold">My Account</h1>
          <Button asChild variant="secondary" size="sm">
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </nav>
      </header>

      <main className="container py-6 animate-enter">
        <section className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Left column */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder.svg" alt="Profile" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm text-muted-foreground">Product Designer</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> <span>New York, NY</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Work</p>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Spotify New York</p>
                          <p className="text-muted-foreground">170 William Street, NY</p>
                        </div>
                        <Badge>Primary</Badge>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">Metropolitan Museum</p>
                          <p className="text-muted-foreground">525 E 68th Street, NY</p>
                        </div>
                        <Badge variant="secondary">Secondary</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[
                        "Branding",
                        "UI/UX",
                        "Web - Design",
                        "Packaging",
                        "Print & Editorial",
                      ].map((s) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Jeremy Rose</CardTitle>
                    <CardDescription className="mt-1">Product Designer • New York, NY</CardDescription>
                  </div>
                  <Button variant="outline" size="icon" aria-label="Bookmark profile">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Ranking</span>
                    <span className="text-base font-semibold">8,6</span>
                    <div className="flex text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary/60" />
                      ))}
                    </div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button size="sm" variant="secondary">Send message</Button>
                    <Button size="sm" variant="default">Contacts</Button>
                    <Button size="sm" variant="ghost">Report user</Button>
                  </div>
                </div>

                <Tabs defaultValue="about" className="w-full">
                  <TabsList>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                  </TabsList>
                  <TabsContent value="timeline" className="space-y-4">
                    <p className="text-sm text-muted-foreground">Recent activity will appear here.</p>
                  </TabsContent>
                  <TabsContent value="about" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Contact information</p>
                        <div className="text-sm">
                          <div className="mb-2 flex items-center gap-2"><Phone className="h-4 w-4" /> <a href="tel:+11234567890" className="underline-offset-2 hover:underline">+1 123 456 7890</a></div>
                          <div className="mb-2 flex items-center gap-2"><Mail className="h-4 w-4" /> <a href="mailto:hello@jeremyrose.com" className="underline-offset-2 hover:underline">hello@jeremyrose.com</a></div>
                          <div className="mb-2 flex items-center gap-2"><Globe className="h-4 w-4" /> <a href="https://www.jeremyrose.com" target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">www.jeremyrose.com</a></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Basic information</p>
                        <div className="text-sm">
                          <div className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> <span>Birthday: June 5, 1992</span></div>
                          <div className="mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>Gender: Male</span></div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
