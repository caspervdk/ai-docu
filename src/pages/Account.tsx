import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Globe, MapPin, Calendar, Star, Bookmark, Edit2, Save, X, Upload, Camera, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AnalyzedFilesTimeline from "@/components/AnalyzedFilesTimeline";
import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[] | null;
  gender: string | null;
  birthday: string | null;
  work_primary: string | null;
  work_secondary: string | null;
};

export default function Account() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    title: '',
    location: '',
    phone: '',
    email: '',
    website: '',
    bio: '',
    gender: '',
    birthday: '',
    work_primary: '',
    work_secondary: '',
    skills: [] as string[]
  });

  // Scroll to top with a nice animation on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Get user session and load profile
  useEffect(() => {
    const getProfile = async () => {
      console.log('Getting user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        return;
      }
      
      if (!session?.user) {
        console.log('No user session found');
        return;
      }
      
      console.log('User session found:', session.user.id);
      setUserId(session.user.id);
      
      console.log('Fetching profile for user:', session.user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error loading profile",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        console.log('Loading existing profile:', data);
        setProfile(data);
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          title: data.title || '',
          location: data.location || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          bio: data.bio || '',
          gender: data.gender || '',
          birthday: data.birthday || '',
          work_primary: data.work_primary || '',
          work_secondary: data.work_secondary || '',
          skills: data.skills || []
        });
      } else {
        // New user - initialize empty profile
        console.log('New user - initializing empty profile for:', session.user.id);
        const emptyProfile = {
          id: session.user.id,
          first_name: null,
          last_name: null,
          title: null,
          location: null,
          phone: null,
          email: null,
          website: null,
          bio: null,
          gender: null,
          birthday: null,
          work_primary: null,
          work_secondary: null,
          skills: null,
          avatar_url: null
        };
        setProfile(emptyProfile);
        setFormData({
          first_name: '',
          last_name: '',
          title: '',
          location: '',
          phone: '',
          email: '',
          website: '',
          bio: '',
          gender: '',
          birthday: '',
          work_primary: '',
          work_secondary: '',
          skills: []
        });
      }
    };
    
    getProfile();
  }, []);

  const handleSave = async () => {
    if (!userId) {
      console.error('No userId found');
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    
    try {
      console.log('Saving profile data:', { id: userId, ...formData });
      
      const { data: savedData, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...formData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) {
        console.error('Save error:', error);
        toast({
          title: "Error saving profile",
          description: error.message,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Profile saved successfully:', savedData);

      // Update local profile state with the saved data
      setProfile(savedData);
      
      // Reset form data to match the saved profile
      setFormData({
        first_name: savedData.first_name || '',
        last_name: savedData.last_name || '',
        title: savedData.title || '',
        location: savedData.location || '',
        phone: savedData.phone || '',
        email: savedData.email || '',
        website: savedData.website || '',
        bio: savedData.bio || '',
        gender: savedData.gender || '',
        birthday: savedData.birthday || '',
        work_primary: savedData.work_primary || '',
        work_secondary: savedData.work_secondary || '',
        skills: savedData.skills || []
      });
      
      // Success - show toast
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully saved."
      });
      
      // Exit edit mode
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error saving profile",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form data to current profile
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        title: profile.title || '',
        location: profile.location || '',
        phone: profile.phone || '',
        email: profile.email || '',
        website: profile.website || '',
        bio: profile.bio || '',
        gender: profile.gender || '',
        birthday: profile.birthday || '',
        work_primary: profile.work_primary || '',
        work_secondary: profile.work_secondary || '',
        skills: profile.skills || []
      });
    }
    setIsEditing(false);
  };
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;
    
    setAvatarUploading(true);
    
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('public_uploads')
        .upload(fileName, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public_uploads')
        .getPublicUrl(fileName);
        
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev);
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been successfully updated."
      });
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Sign out the user first
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted.",
      });

      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete account",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = useCallback(() => {
    const firstName = profile?.first_name || formData.first_name;
    const lastName = profile?.last_name || formData.last_name;
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';
  }, [profile, formData]);

  const getDisplayName = useCallback(() => {
    const firstName = profile?.first_name || formData.first_name;
    const lastName = profile?.last_name || formData.last_name;
    return `${firstName || ''} ${lastName || ''}`.trim() || 'User';
  }, [profile, formData]);

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
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving} className="hidden sm:flex">
                  <X className="size-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" disabled={isSaving} className="flex sm:hidden">
                  <X className="size-4" />
                </Button>
                <Button onClick={handleSave} size="sm" disabled={isSaving} className="hidden sm:flex">
                  <Save className="size-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={handleSave} size="sm" disabled={isSaving} className="flex sm:hidden">
                  <Save className="size-4" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm" className="hidden sm:flex">
                  <Edit2 className="size-4 mr-1" />
                  Edit Profile
                </Button>
                <Button onClick={() => setIsEditing(true)} variant="secondary" size="sm" className="flex sm:hidden">
                  <Edit2 className="size-4" />
                </Button>
              </>
            )}
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <a href="/dashboard">Back to Dashboard</a>
            </Button>
            <Button asChild variant="ghost" size="sm" className="flex sm:hidden">
              <a href="/dashboard">Back</a>
            </Button>
          </div>
        </nav>
      </header>

      <main className="container py-4 sm:py-6 animate-enter">
        <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Left column */}
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative mx-auto sm:mx-0">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <Button
                      onClick={() => avatarInputRef.current?.click()}
                      size="sm"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? <Upload className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                    </Button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Input
                          placeholder="Job Title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Input
                          placeholder="Location"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">{profile?.title || 'No job title'}</p>
                        <div className="mt-1 flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" /> 
                          <span>{profile?.location || 'No location'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Work</p>
                    <div className="mt-3 space-y-3 text-sm">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div>
                            <Label htmlFor="work_primary">Primary Workplace</Label>
                            <Input
                              id="work_primary"
                              placeholder="e.g., Spotify New York"
                              value={formData.work_primary}
                              onChange={(e) => setFormData(prev => ({ ...prev, work_primary: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="work_secondary">Secondary Workplace</Label>
                            <Input
                              id="work_secondary"
                              placeholder="e.g., Metropolitan Museum"
                              value={formData.work_secondary}
                              onChange={(e) => setFormData(prev => ({ ...prev, work_secondary: e.target.value }))}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {profile?.work_primary && (
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{profile.work_primary}</p>
                              </div>
                              <Badge>Primary</Badge>
                            </div>
                          )}
                          {profile?.work_secondary && (
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{profile.work_secondary}</p>
                              </div>
                              <Badge variant="secondary">Secondary</Badge>
                            </div>
                          )}
                          {!profile?.work_primary && !profile?.work_secondary && (
                            <p className="text-muted-foreground text-sm">No workplace information</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium">Skills</p>
                    <div className="mt-3">
                      {isEditing ? (
                        <Input
                          placeholder="Enter skills separated by commas"
                          value={formData.skills.join(', ')}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          }))}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile?.skills && profile.skills.length > 0 ? (
                            profile.skills.map((skill, index) => (
                              <Badge key={index} variant="outline">{skill}</Badge>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm">No skills listed</p>
                          )}
                        </div>
                      )}
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
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                          />
                          <Input
                            placeholder="Last Name"
                            value={formData.last_name}
                            onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                          />
                        </div>
                        <Input
                          placeholder="Job Title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <>
                        <CardTitle className="text-2xl">{getDisplayName()}</CardTitle>
                        <CardDescription className="mt-1">
                          {profile?.title ? `${profile.title} • ` : ''}{profile?.location || ''}
                        </CardDescription>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Ranking</span>
                    <span className="text-base font-semibold">8,6</span>
                    <div className="flex text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-primary/60" />
                      ))}
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="about" className="w-full">
                  <TabsList>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                  </TabsList>
                  <TabsContent value="timeline" className="space-y-4">
                    <AnalyzedFilesTimeline />
                  </TabsContent>
                  <TabsContent value="about" className="space-y-6">
                    {isEditing && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            placeholder="Tell us about yourself..."
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={3}
                          />
                        </div>
                      </div>
                    )}
                    
                    {profile?.bio && !isEditing && (
                      <div className="mb-6">
                        <h3 className="text-sm font-medium mb-2">About</h3>
                        <p className="text-sm text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}
                    
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Contact information</p>
                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 123 456 7890"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="hello@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="website">Website</Label>
                              <Input
                                id="website"
                                type="url"
                                placeholder="https://www.example.com"
                                value={formData.website}
                                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm space-y-2">
                            {profile?.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" /> 
                                <a href={`tel:${profile.phone}`} className="underline-offset-2 hover:underline">
                                  {profile.phone}
                                </a>
                              </div>
                            )}
                            {profile?.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" /> 
                                <a href={`mailto:${profile.email}`} className="underline-offset-2 hover:underline">
                                  {profile.email}
                                </a>
                              </div>
                            )}
                            {profile?.website && (
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" /> 
                                <a href={profile.website} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                                  {profile.website}
                                </a>
                              </div>
                            )}
                            {!profile?.phone && !profile?.email && !profile?.website && (
                              <p className="text-muted-foreground">No contact information</p>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Basic information</p>
                        {isEditing ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="birthday">Birthday</Label>
                              <Input
                                id="birthday"
                                type="date"
                                value={formData.birthday}
                                onChange={(e) => setFormData(prev => ({ ...prev, birthday: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="gender">Gender</Label>
                              <Input
                                id="gender"
                                placeholder="e.g., Male, Female, Other"
                                value={formData.gender}
                                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm space-y-2">
                            {profile?.birthday && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" /> 
                                <span>Birthday: {new Date(profile.birthday).toLocaleDateString()}</span>
                              </div>
                            )}
                            {profile?.gender && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> 
                                <span>Gender: {profile.gender}</span>
                              </div>
                            )}
                            {!profile?.birthday && !profile?.gender && (
                              <p className="text-muted-foreground">No basic information</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            {/* Delete Account Section */}
            <Card className="border-destructive/20">
              <CardContent className="pt-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-sm font-medium text-destructive">Delete Account</h3>
                    <p className="text-xs text-muted-foreground">Permanently delete your account and all data.</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isDeleting} className="h-8 text-xs">
                        <Trash2 className="h-3 w-3 mr-1" />
                        {isDeleting ? "Deleting..." : "Delete Account"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Profile information</li>
                            <li>Uploaded documents and analysis results</li>
                            <li>Account preferences and settings</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Yes, delete account"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
