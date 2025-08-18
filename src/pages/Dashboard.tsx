import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Languages, ShieldAlert, Bug, User2, LogOut, Rocket, Files, BarChart3, Menu, EyeOff, Table, FileDiff, Presentation, MessageSquare, WandSparkles, FileSearch, Check, Folder, Users, Clock, Star, Trash2, Tags } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useState, useRef, useEffect } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatDistanceToNow } from "date-fns";
import { OutputPanel } from "@/components/OutputPanel";

interface Tool {
  name: string;
  description: string;
  icon: LucideIcon;
  route: string;
}

const tools: Tool[] = [
  {
    name: "File Analyzer",
    description: "Analyze and understand the contents of various file types.",
    icon: FileText,
    route: "/file-analyzer",
  },
  {
    name: "Code Search",
    description: "Search for specific code snippets or patterns within your codebase.",
    icon: Search,
    route: "/code-search",
  },
  {
    name: "Localization",
    description: "Manage and translate text for different languages and regions.",
    icon: Languages,
    route: "/localization",
  },
  {
    name: "Security Scanner",
    description: "Identify potential security vulnerabilities in your code.",
    icon: ShieldAlert,
    route: "/security-scanner",
  },
  {
    name: "Bug Tracker",
    description: "Track and manage software bugs and issues.",
    icon: Bug,
    route: "/bug-tracker",
  },
  {
    name: "User Management",
    description: "Manage user accounts and permissions.",
    icon: User2,
    route: "/user-management",
  },
  {
    name: "Deployment",
    description: "Deploy your application to various environments.",
    icon: Rocket,
    route: "/deployment",
  },
  {
    name: "File Management",
    description: "Organize and manage your files and folders.",
    icon: Files,
    route: "/file-management",
  },
  {
    name: "Analytics",
    description: "Track and analyze user behavior and application performance.",
    icon: BarChart3,
    route: "/analytics",
  },
  {
    name: "Access Control",
    description: "Manage user access and permissions.",
    icon: EyeOff,
    route: "/access-control",
  },
  {
    name: "Data Table",
    description: "View and manage data in a tabular format.",
    icon: Table,
    route: "/data-table",
  },
  {
    name: "Diff Checker",
    description: "Compare and highlight differences between files.",
    icon: FileDiff,
    route: "/diff-checker",
  },
  {
    name: "Presentation",
    description: "Create and deliver presentations.",
    icon: Presentation,
    route: "/presentation",
  },
  {
    name: "Chat",
    description: "Communicate with team members in real-time.",
    icon: MessageSquare,
    route: "/chat",
  },
  {
    name: "AI Assistant",
    description: "Get help from an AI assistant.",
    icon: WandSparkles,
    route: "/ai-assistant",
  },
  {
    name: "File Search",
    description: "Search for files by name or content.",
    icon: FileSearch,
    route: "/file-search",
  },
  {
    name: "Task Management",
    description: "Manage tasks and projects.",
    icon: Check,
    route: "/task-management",
  },
  {
    name: "Folder Management",
    description: "Organize and manage folders.",
    icon: Folder,
    route: "/folder-management",
  },
  {
    name: "User Directory",
    description: "Browse and manage user accounts.",
    icon: Users,
    route: "/user-directory",
  },
  {
    name: "Time Tracking",
    description: "Track time spent on tasks and projects.",
    icon: Clock,
    route: "/time-tracking",
  },
  {
    name: "Bookmarks",
    description: "Save and organize your favorite links.",
    icon: Star,
    route: "/bookmarks",
  },
  {
    name: "Trash",
    description: "Manage deleted files and folders.",
    icon: Trash2,
    route: "/trash",
  },
  {
    name: "Tags",
    description: "Organize and categorize content with tags.",
    icon: Tags,
    route: "/tags",
  },
];

function Dashboard() {
  const navigate = useNavigate();
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [isDeleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteAccountReason, setDeleteAccountReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user) {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error("Error fetching user:", error);
        } else {
          setUser(user);
        }
      }
    };

    fetchUser();
  }, [session]);

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
      toast({
        title: "Logged out successfully",
      });
    }
    setIsLoading(false);
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Delete user data from the 'users' table
      const { error: deleteUserError } = await supabase
        .from('users')
        .delete()
        .eq('id', session?.user?.id);

      if (deleteUserError) {
        console.error("Error deleting user data:", deleteUserError);
        toast({
          title: "Error deleting account",
          description: "Failed to delete user data.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Delete the user account from Supabase Auth
      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(session?.user?.id as string);

      if (deleteAuthError) {
        console.error("Error deleting user account:", deleteAuthError);
        toast({
          title: "Error deleting account",
          description: "Failed to delete user account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Sign out the user after successful deletion
      await supabase.auth.signOut();
      navigate("/register");
      toast({
        title: "Account deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Dashboard</title>
      </Helmet>
      <div className="container relative">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Dashboard
            </h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Menu className="mr-2 h-4 w-4" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => setLogoutOpen(true)}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteAccountOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete account</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="text-sm text-muted-foreground">
            Welcome to your dashboard. You have {tools.length} tools available.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.name} className="hover:shadow-md transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <tool.icon className="mr-2 h-4 w-4" />
                  {tool.name}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="link" onClick={() => navigate(tool.route)}>
                  Go to {tool.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <Dialog open={isLogoutOpen} onOpenChange={setLogoutOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log out</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setLogoutOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" onClick={handleLogout} disabled={isLoading}>
                {isLoading ? "Logging out..." : "Log out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={isDeleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2">
              <Label htmlFor="reason">Why are you deleting your account?</Label>
              <Textarea
                id="reason"
                placeholder="Please tell us why you are deleting your account."
                value={deleteAccountReason}
                onChange={(e) => setDeleteAccountReason(e.target.value)}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={isLoading} onClick={handleDeleteAccount}>
                {isLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}

export default Dashboard;
