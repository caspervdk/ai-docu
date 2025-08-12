import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, Globe, MapPin, Calendar, Star, Bookmark } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Account() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  type ProfileForm = {
    first_name: string; last_name: string; title: string; location: string; phone: string; email: string; website: string; birthday: string; gender: string; avatar_url: string; bio: string; work_primary: string; work_secondary: string; skills_text: string; ranking: number;
  };

  const [form, setForm] = useState<ProfileForm>({
    first_name: "",
    last_name: "",
    title: "Product Designer",
    location: "New York, NY",
    phone: "+1 123 456 7890",
    email: "hello@example.com",
    website: "https://www.example.com",
    birthday: "",
    gender: "",
    avatar_url: "",
    bio: "",
    work_primary: "Spotify New York",
    work_secondary: "Metropolitan Museum",
    skills_text: "Branding, UI/UX, Web - Design, Packaging, Print & Editorial",
    ranking: 8.6,
  });

  // Scroll to top with a nice animation on mount
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  // Load or initialize profile
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!data) {
        await supabase.from("profiles").insert({ id: user.id });
        return;
      }
      setForm((prev) => ({
        ...prev,
        first_name: data.first_name ?? prev.first_name,
        last_name: data.last_name ?? prev.last_name,
        title: (data as any).title ?? prev.title,
        location: (data as any).location ?? prev.location,
        phone: (data as any).phone ?? prev.phone,
        email: (data as any).email ?? prev.email,
        website: (data as any).website ?? prev.website,
        birthday: data.birthday ? String(data.birthday).slice(0, 10) : prev.birthday,
        gender: (data as any).gender ?? prev.gender,
        avatar_url: (data as any).avatar_url ?? prev.avatar_url,
        bio: (data as any).bio ?? prev.bio,
        work_primary: (data as any).work_primary ?? prev.work_primary,
        work_secondary: (data as any).work_secondary ?? prev.work_secondary,
        skills_text: Array.isArray((data as any).skills) ? (data as any).skills.join(", ") : prev.skills_text,
        ranking: typeof (data as any).ranking === "number" ? (data as any).ranking : prev.ranking,
      }));
    })();
  }, []);

  const onChange = (k: keyof ProfileForm, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const saveProfile = async () => {
    if (!userId) return;
    setLoading(true);
    const payload: any = {
      id: userId,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      title: form.title || null,
      location: form.location || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,
      birthday: form.birthday ? form.birthday : null,
      gender: form.gender || null,
      avatar_url: form.avatar_url || null,
      bio: form.bio || null,
      work_primary: form.work_primary || null,
      work_secondary: form.work_secondary || null,
      skills: form.skills_text ? form.skills_text.split(",").map((s) => s.trim()).filter(Boolean) : null,
      ranking: form.ranking ?? null,
    };
    const { error } = await supabase.from("profiles").upsert(payload);
    setLoading(false);
    toast({ title: error ? "Save failed" : "Profile saved", description: error?.message || "Your changes have been saved." });
  };

  const pickAvatar = () => fileRef.current?.click();
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    const ext = file.name.split(".").pop() || "png";
    const path = `avatars/${userId}.${ext}`;
    const { error } = await supabase.storage.from("public_uploads").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { toast({ title: "Upload failed", description: error.message } as any); return; }
    const { data } = supabase.storage.from("public_uploads").getPublicUrl(path);
    const url = data.publicUrl;
    onChange("avatar_url", url);
    await supabase.from("profiles").upsert({ id: userId, avatar_url: url });
    toast({ title: "Profile picture updated" });
  };

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
                    <AvatarImage src={form.avatar_url || "/placeholder.svg"} alt="Profile" />
                    <AvatarFallback>ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{form.title || "Product Designer"}</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> <span>{form.location || "New York, NY"}</span>
                    </div>
                  </div>
                  <div>
                    <Button size="sm" variant="outline" onClick={pickAvatar}>Change photo</Button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarChange} />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Work</p>
                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{form.work_primary || "Add your primary workplace"}</p>
                        </div>
                        <Badge>Primary</Badge>
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{form.work_secondary || "Add your secondary workplace"}</p>
                        </div>
                        <Badge variant="secondary">Secondary</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {form.skills_text.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
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
            {/* Edit form */}
            <Card>
              <CardHeader>
                <CardTitle>Edit profile</CardTitle>
                <CardDescription>Update your information and save changes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>First name</Label>
                    <Input value={form.first_name} onChange={(e) => onChange("first_name", e.target.value)} placeholder="First name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last name</Label>
                    <Input value={form.last_name} onChange={(e) => onChange("last_name", e.target.value)} placeholder="Last name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={form.title} onChange={(e) => onChange("title", e.target.value)} placeholder="Title" />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={form.location} onChange={(e) => onChange("location", e.target.value)} placeholder="City, Country" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ranking</Label>
                    <Input type="number" step="0.1" min={0} max={10} value={form.ranking} onChange={(e) => onChange("ranking", Number(e.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Birthday</Label>
                    <Input type="date" value={form.birthday} onChange={(e) => onChange("birthday", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Input value={form.gender} onChange={(e) => onChange("gender", e.target.value)} placeholder="Gender" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} placeholder="+1 ..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => onChange("email", e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={form.website} onChange={(e) => onChange("website", e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Work (primary)</Label>
                    <Input value={form.work_primary} onChange={(e) => onChange("work_primary", e.target.value)} placeholder="Company or role" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Work (secondary)</Label>
                    <Input value={form.work_secondary} onChange={(e) => onChange("work_secondary", e.target.value)} placeholder="Company or role" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Skills (comma-separated)</Label>
                    <Input value={form.skills_text} onChange={(e) => onChange("skills_text", e.target.value)} placeholder="e.g. Branding, UI/UX" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Bio</Label>
                    <Textarea value={form.bio} onChange={(e) => onChange("bio", e.target.value)} placeholder="Tell something about yourself" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={saveProfile} disabled={loading}>{loading ? "Saving..." : "Save changes"}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Display card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{`${form.first_name || ""} ${form.last_name || ""}`.trim() || "Your Name"}</CardTitle>
                    <CardDescription className="mt-1">{[form.title, form.location].filter(Boolean).join(" • ") || "Add a title and location"}</CardDescription>
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
                    <span className="text-base font-semibold">{form.ranking?.toFixed ? form.ranking.toFixed(1) : form.ranking}</span>
                    <div className="flex text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={"h-4 w-4 " + (i < Math.round((Number(form.ranking) || 0) / 2) ? "fill-primary/60" : "")} />
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
                          <div className="mb-2 flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${form.phone || ''}`} className="underline-offset-2 hover:underline">{form.phone || "Add phone"}</a></div>
                          <div className="mb-2 flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${form.email || ''}`} className="underline-offset-2 hover:underline">{form.email || "Add email"}</a></div>
                          <div className="mb-2 flex items-center gap-2"><Globe className="h-4 w-4" /> <a href={form.website || "#"} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{form.website?.replace(/^https?:\/\//, "") || "Add website"}</a></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Basic information</p>
                        <div className="text-sm">
                          <div className="mb-2 flex items-center gap-2"><Calendar className="h-4 w-4" /> <span>Birthday: {form.birthday || "—"}</span></div>
                          <div className="mb-2 flex items-center gap-2"><MapPin className="h-4 w-4" /> <span>Gender: {form.gender || "—"}</span></div>
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
