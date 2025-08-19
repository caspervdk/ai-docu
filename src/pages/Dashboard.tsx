import { Helmet } from "react-helmet-async";
import PreviewModal from "@/components/PreviewModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Search, Languages, ShieldAlert, Bug, User2, LogOut, Rocket, Files, BarChart3, Menu, EyeOff, Table, FileDiff, Presentation, MessageSquare, WandSparkles, FileSearch, Check, Folder, Clock, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useRef, useEffect } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { formatDistanceToNow } from "date-fns";
import { OutputPanel } from "@/components/OutputPanel";
type Tool = {
  icon: LucideIcon;
  title: string;
  desc: string;
  proOnly: boolean;
  cta?: string;
};
const tools: readonly Tool[] = [{
  icon: FileText,
  title: "Summarize Long Documents",
  desc: "Condense long docs into key points.",
  proOnly: false
}, {
  icon: Search,
  title: "Cross-Doc Linker",
  desc: "Find related documents and link supporting evidence.",
  proOnly: false
}, {
  icon: Languages,
  title: "Translate & Localize",
  desc: "Translate content and adapt for regions.",
  proOnly: false
}, {
  icon: ShieldAlert,
  title: "Contract Analysis & Risk Detection",
  desc: "Spot risks and clauses at a glance.",
  proOnly: true
}, {
  icon: Bug,
  title: "Smart Error Detection",
  desc: "Identify issues and suggest fixes.",
  proOnly: true
}, {
  icon: Files,
  title: "Merge documents",
  desc: "Combine multiple documents into a single file.",
  proOnly: true
}, {
  icon: BarChart3,
  title: "Analyze data from a file",
  desc: "Extract insights and metrics from your dataset.",
  proOnly: true
},
// New PRO tools
{
  icon: EyeOff,
  title: "PII Redaction & Anonymization",
  desc: "Remove personal data and return a clean copy + audit log. Formats: PDF, DOCX, TXT, PNG/JPG (OCR)",
  proOnly: true,
  cta: "Redact my file"
}, {
  icon: Table,
  title: "Table & Invoice Extraction",
  desc: "Detect tables and export structured CSV/JSON (invoice no., date, totals, VAT). Formats: PDF, PNG/JPG, DOCX",
  proOnly: true,
  cta: "Extract tables"
}, {
  icon: FileDiff,
  title: "Version Diff & Change Summary",
  desc: "Compare two documents and generate a human-readable changelog. Formats: PDF, DOCX, TXT",
  proOnly: true,
  cta: "Compare versions"
}, {
  icon: Presentation,
  title: "Doc-to-Slides Generator",
  desc: "Turn a long document into presentation slides with notes. Formats: DOCX, PDF, TXT → PPTX/Google Slides",
  proOnly: true,
  cta: "Create slides"
}, {
  icon: MessageSquare,
  title: "Ask-Your-Docs Q&A",
  desc: "Chat with documents; answers include citations. Formats: PDF, DOCX, TXT, HTML",
  proOnly: true,
  cta: "Start Q&A"
}, {
  icon: WandSparkles,
  title: "Data Cleaning & Normalization",
  desc: "Fix missing values, outliers, duplicates; standardize columns. Formats: CSV, XLS/XLSX",
  proOnly: true,
  cta: "Clean my data"
}, {
  icon: FileSearch,
  title: "Clause Finder & Policy Checker",
  desc: "Locate key clauses and score against a checklist. Formats: PDF, DOCX, TXT",
  proOnly: true,
  cta: "Scan for clauses"
}] as const;
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<(typeof tools)[number] | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [docName, setDocName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [docs, setDocs] = useState<{
    name: string;
    url: string;
    updatedAt?: string;
    aiToolUsed?: string;
  }[]>([]);
  const [allFiles, setAllFiles] = useState<{
    name: string;
    url: string;
    updatedAt?: string;
    folder?: {
      id: string;
      name: string;
      storage_path: string;
    };
    aiToolUsed?: string;
  }[]>([]);
  const [folders, setFolders] = useState<{
    id: string;
    name: string;
    storage_path: string;
    created_at: string;
  }[]>([]);
  const [showAllDocs, setShowAllDocs] = useState(false);
  const [trashDocs, setTrashDocs] = useState<{
    name: string;
    url: string;
    updatedAt?: string;
    aiToolUsed?: string;
  }[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{
    name: string;
    url: string;
    aiToolUsed?: string;
    analysisResult?: string;
  } | null>(null);
  const [lastSavedPair, setLastSavedPair] = useState<{
    original?: {
      name: string;
      url: string;
    };
    output?: {
      name: string;
      url: string;
    };
  } | null>(null);
  const [proPromptTool, setProPromptTool] = useState<(typeof tools)[number] | null>(null);
  const [translateLang, setTranslateLang] = useState("en->nl");
  const [isDragActive, setIsDragActive] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  // New File dialog state
  const [newOpen, setNewOpen] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const newFileInputRef = useRef<HTMLInputElement>(null);
  const [newSaving, setNewSaving] = useState(false);
  // Create folder state
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  // Move and rename dialogs
  const [moveDocDialog, setMoveDocDialog] = useState<{
    doc: {
      name: string;
      url: string;
      updatedAt?: string;
    };
    selectedFolder?: string;
  } | null>(null);
  const [renameDocDialog, setRenameDocDialog] = useState<{
    doc: {
      name: string;
      url: string;
      updatedAt?: string;
    };
    newName: string;
  } | null>(null);
  // Upgrade modal state
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  // Save to folder state
  const [saveToFolderId, setSaveToFolderId] = useState<string | null>(null);
  const [newFileSaveToFolderId, setNewFileSaveToFolderId] = useState<string | null>(null);
  // Create folder dialog state
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [createFolderCallback, setCreateFolderCallback] = useState<((folderId: string) => void) | null>(null);
  // Storage popup state
  const [storagePopupOpen, setStoragePopupOpen] = useState(false);
  // Folder view state
  const [openFolder, setOpenFolder] = useState<{
    id: string;
    name: string;
    storage_path: string;
  } | null>(null);
  const [folderDocs, setFolderDocs] = useState<{
    name: string;
    url: string;
    updatedAt?: string;
    aiToolUsed?: string;
  }[]>([]);
  // Delete confirmation dialog state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    doc: {
      name: string;
      url: string;
      updatedAt?: string;
    };
    isTrash?: boolean;
    folder?: {
      id: string;
      name: string;
      storage_path: string;
    };
    fromStorage?: boolean;
  } | null>(null);
  // Delete forever confirmation dialog state
  const [deleteForeverDialog, setDeleteForeverDialog] = useState<{
    doc: {
      name: string;
      url: string;
      updatedAt?: string;
    };
    isTrash?: boolean;
  } | null>(null);

  // Credits state for tracking analyzed files
  const [analyzedFilesCount, setAnalyzedFilesCount] = useState(0);

  // Fetch analyzed files count for credits
  const fetchAnalyzedFilesCount = async () => {
    if (!userId) return;
    try {
      const { count, error } = await supabase
        .from('analyzed_files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      if (!error && count !== null) {
        setAnalyzedFilesCount(count);
      }
    } catch (err) {
      console.error('Error fetching analyzed files count:', err);
    }
  };
  const handleClose = () => {
    setActiveTool(null);
    setInput("");
    setOutput("");
    setSelectedFile(null);
    setIsSending(false);
    setDocName("");
  };
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setSelectedFile(f);
    if (f && activeTool?.title === "Cross-Doc Linker") {
      await summarizeWithAI(f);
    }
  };
  const triggerFileDialog = () => {
    fileInputRef.current?.click();
  };
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Helper function to fetch analysis result for a document
  const fetchAnalysisResult = async (fileName: string) => {
    if (!userId) return null;
    try {
      const {
        data,
        error
      } = await supabase.from('analyzed_files').select('analysis_result, ai_tool_used').eq('user_id', userId).eq('file_name', fileName).order('created_at', {
        ascending: false
      }).limit(1);
      if (error || !data || data.length === 0) {
        console.log('No analysis result found for:', fileName);
        return null;
      }
      console.log('Analysis result found for:', fileName, data[0]);
      return data[0];
    } catch (err) {
      console.error('Error fetching analysis result:', err);
      return null;
    }
  };

  // Enhanced preview function that includes analysis result
  const openDocumentPreview = async (doc: {
    name: string;
    url: string;
    aiToolUsed?: string;
  }) => {
    console.log('Opening preview for:', doc.name, 'with aiToolUsed:', doc.aiToolUsed);
    const analysisData = await fetchAnalysisResult(doc.name);

    // Parse the analysis result to extract the output content
    let parsedAnalysisResult = null;
    if (analysisData?.analysis_result) {
      console.log('Raw analysis result:', analysisData.analysis_result);
      try {
        const parsed = JSON.parse(analysisData.analysis_result);
        parsedAnalysisResult = parsed.output || analysisData.analysis_result;
        console.log('Parsed analysis result:', parsedAnalysisResult);
      } catch {
        parsedAnalysisResult = analysisData.analysis_result;
        console.log('Using raw analysis result:', parsedAnalysisResult);
      }
    } else {
      console.log('No analysis result available for:', doc.name);
    }
    setPreviewDoc({
      ...doc,
      aiToolUsed: analysisData?.ai_tool_used || doc.aiToolUsed,
      analysisResult: parsedAnalysisResult
    });
  };

  // Fetch folder contents
  const fetchFolderDocs = async (folderStoragePath: string) => {
    if (!userId) return;
    console.log('Fetching folder contents for path:', folderStoragePath);
    const {
      data: files,
      error
    } = await supabase.storage.from('documents').list(folderStoragePath, {
      limit: 50,
      sortBy: {
        column: 'updated_at',
        order: 'desc'
      }
    });
    console.log('Folder list response:', {
      files,
      error
    });
    if (error || !files) {
      console.log('Error or no files found:', error);
      setFolderDocs([]);
      return;
    }
    const visible = (files || []).filter((f: any) => f.name && !f.name.endsWith('/') && f.name !== '.keep');
    console.log('Visible files in folder:', visible);
    const items = await Promise.all(visible.map(async (f: any) => {
      const path = `${folderStoragePath}/${f.name}`;
      const {
        data: signed
      } = await supabase.storage.from('documents').createSignedUrl(path, 600);

      // Query analyzed_files to get AI tool information
      let analysisData = null;
      try {
        const {
          data,
          error
        } = await supabase.from('analyzed_files').select('ai_tool_used').eq('user_id', userId).eq('file_name', f.name).order('created_at', {
          ascending: false
        }).limit(1).single();
        if (!error) {
          analysisData = data;
        }
      } catch (err) {
        console.log('No analysis data found for:', f.name);
      }
      return {
        name: f.name,
        url: signed?.signedUrl || '#',
        updatedAt: f.updated_at || f.created_at,
        aiToolUsed: analysisData?.ai_tool_used || null
      };
    }));
    console.log('Folder docs items:', items);
    setFolderDocs(items);
  };
  const handleOpenFolder = async (folder: {
    id: string;
    name: string;
    storage_path: string;
  }) => {
    setOpenFolder(folder);
    await fetchFolderDocs(folder.storage_path.replace('/.keep', ''));
  };

  // Close folder and return to main view
  const handleCloseFolder = () => {
    setOpenFolder(null);
    setFolderDocs([]);
  };
  useEffect(() => {
    const fetchDocs = async () => {
      if (!userId) {
        setDocs([]);
        setTrashDocs([]);
        setFolders([]);
        setAllFiles([]);
        return;
      }

      // Root (Recent)
      const {
        data: files,
        error
      } = await supabase.storage.from('documents').list(userId, {
        limit: 50,
        sortBy: {
          column: 'updated_at',
          order: 'desc'
        }
      });
      let items: {
        name: string;
        url: string;
        updatedAt?: string;
      }[] = [];
      if (error || !files) {
        setDocs([]);
      } else {
        // Filter to only include actual files (not folders or special entries)
        const visible = (files || []).filter((f: any) => {
          if (!f.name) return false;
          if (f.name === 'trash') return false;
          if (f.name.endsWith('/')) return false; // Exclude folders
          if (f.name === '.keep') return false; // Exclude .keep files
          // Only include files with extensions or known file patterns
          return f.name.includes('.') || f.name.match(/^[^.]+$/);
        });
        items = await Promise.all(visible.map(async (f: any) => {
          const path = `${userId}/${f.name}`;
          const {
            data: signed
          } = await supabase.storage.from('documents').createSignedUrl(path, 600);

          // Query analyzed_files to get AI tool information
          let analysisData = null;
          try {
            const {
              data,
              error
            } = await supabase.from('analyzed_files').select('ai_tool_used').eq('user_id', userId).eq('file_name', f.name).order('created_at', {
              ascending: false
            }).limit(1).single();
            if (!error) {
              analysisData = data;
            }
          } catch (err) {
            console.log('No analysis data found for:', f.name);
          }
          return {
            name: f.name,
            url: signed?.signedUrl || '#',
            updatedAt: f.updated_at || f.created_at,
            aiToolUsed: analysisData?.ai_tool_used || null
          };
        }));
        setDocs(items);
      }

      // Trash
      const {
        data: tFiles
      } = await supabase.storage.from('documents').list(`${userId}/trash`, {
        limit: 50,
        sortBy: {
          column: 'updated_at',
          order: 'desc'
        }
      });
      const tItems = await Promise.all((tFiles || []).map(async (f: any) => {
        const path = `${userId}/trash/${f.name}`;
        const {
          data: signed
        } = await supabase.storage.from('documents').createSignedUrl(path, 600);
        return {
          name: f.name,
          url: signed?.signedUrl || '#',
          updatedAt: f.updated_at || f.created_at
        };
      }));
      setTrashDocs(tItems);

      // Fetch folders from database
      const {
        data: foldersData
      } = await supabase.from('folders').select('*').eq('user_id', userId).order('created_at', {
        ascending: false
      });
      setFolders(foldersData || []);

      // Fetch all files from all locations for storage popup
      const allFilesArray: {
        name: string;
        url: string;
        updatedAt?: string;
        folder?: {
          id: string;
          name: string;
          storage_path: string;
        };
      }[] = [];

      // Add root files to allFiles (filter out system files and folders)
      items.forEach(item => {
        // Only add actual files, not folders or system files
        if (!item.name.includes('.keep') && !item.name.endsWith('/')) {
          allFilesArray.push(item);
        }
      });

      // Add files from all folders
      if (foldersData && foldersData.length > 0) {
        for (const folder of foldersData) {
          try {
            const folderPath = folder.storage_path.replace('/.keep', '');
            const {
              data: folderFiles
            } = await supabase.storage.from('documents').list(folderPath, {
              limit: 50,
              sortBy: {
                column: 'updated_at',
                order: 'desc'
              }
            });
            if (folderFiles) {
              const visibleFolderFiles = folderFiles.filter((f: any) => f.name && !f.name.endsWith('/') && f.name !== '.keep');
              for (const file of visibleFolderFiles) {
                const filePath = `${folderPath}/${file.name}`;
                const {
                  data: signed
                } = await supabase.storage.from('documents').createSignedUrl(filePath, 600);
                allFilesArray.push({
                  name: file.name,
                  url: signed?.signedUrl || '#',
                  updatedAt: file.updated_at || file.created_at,
                  folder: folder
                });
              }
            }
          } catch (err) {
            console.warn('Error fetching files from folder:', folder.name, err);
          }
        }
      }
      setAllFiles(allFilesArray);
    };
    fetchDocs();
  }, [userId]);

  // Fetch analyzed files count for credits tracking
  useEffect(() => {
    if (userId) {
      fetchAnalyzedFilesCount();
    }
  }, [userId]);
  const summarizeWithAI = async (overrideFile?: File) => {
    // Check credits limit
    if (analyzedFilesCount >= 10) {
      setOutput("Credit limit reached. You have used all 10 analysis credits.");
      toast({
        title: "Credit Limit Reached",
        description: "You have used all 10 analysis credits. Please upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    const file = overrideFile ?? selectedFile;
    if (!file && !input.trim()) {
      setOutput("Please provide text or upload a document.");
      return;
    }
    try {
      setIsSending(true);
      setOutput("Sending to AI...");
      const fd = new FormData();
      if (file) {
        fd.append("file", file, file.name);
      }
      if (activeTool?.title) fd.append("action", activeTool.title);
      if (input) fd.append("message", input);
      if (activeTool?.title === "Translate & Localize" && translateLang) fd.append("language", translateLang);
      const webhookUrl = activeTool?.title === "Cross-Doc Linker" ? "https://caspervdk.app.n8n.cloud/webhook/6f485cb7-524e-47e6-9c27-77e2af2486b3" : activeTool?.title === "Translate & Localize" ? "https://caspervdk.app.n8n.cloud/webhook/f820b429-b4a9-4331-b91b-ce89202c05cf" : "https://caspervdk.app.n8n.cloud/webhook/analyze-doc";
      const res = await fetch(webhookUrl, {
        method: "POST",
        body: fd
      });
      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(text || `Webhook responded with ${res.status}`);
      setOutput(text || "Success (empty response)");
    } catch (err: any) {
      setOutput(err?.message || "Failed to send to AI.");
    } finally {
      setIsSending(false);
    }
  };

  // Send uploaded document to the Translate & Localize webhook and put response into Output
  const analyzeDocWithWebhook = async () => {
    // Check credits limit
    if (analyzedFilesCount >= 10) {
      setOutput("Credit limit reached. You have used all 10 analysis credits.");
      toast({
        title: "Credit Limit Reached",
        description: "You have used all 10 analysis credits. Please upgrade to continue.",
        variant: "destructive",
      });
      return;
    }

    const file = selectedFile;
    if (!file) {
      setOutput("Please select a file to upload.");
      return;
    }
    try {
      setIsSending(true);
      setOutput("Uploading for translation/localization...");
      const fd = new FormData();
      fd.append("file", file, file.name);
      fd.append("action", "Translate & Localize");
      if (input) fd.append("message", input);
      if (translateLang) fd.append("language", translateLang);
      const res = await fetch("https://caspervdk.app.n8n.cloud/webhook/analyze-doc", {
        method: "POST",
        body: fd
      });
      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(text || `Webhook responded with ${res.status}`);
      setOutput(text || "Success (empty response)");
    } catch (err: any) {
      setOutput(err?.message || "Failed to send to AI.");
    } finally {
      setIsSending(false);
    }
  };

  // When on Translate & Localize: if a file is selected, send it; otherwise open the picker
  const handleUploadClick = async () => {
    if (activeTool?.title === "Translate & Localize") {
      if (!selectedFile) {
        triggerFileDialog();
        return;
      }
      await analyzeDocWithWebhook();
    } else {
      triggerFileDialog();
    }
  };
  const slugFileName = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9._-]+/g, '-').replace(/(^[.-]+|[.-]+$)/g, '');

  // Utility function to parse file name and extension
  const parseFileName = (fileName: string) => {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === 0) {
      return {
        name: fileName,
        extension: ''
      };
    }
    return {
      name: fileName.substring(0, lastDotIndex),
      extension: fileName.substring(lastDotIndex)
    };
  };

  // Component for displaying file names with improved styling
  const FileNameDisplay = ({
    fileName,
    className = "",
    showTooltip = true
  }: {
    fileName: string;
    className?: string;
    showTooltip?: boolean;
  }) => {
    const {
      name,
      extension
    } = parseFileName(fileName);
    return <span className={`truncate ${className}`} title={showTooltip ? fileName : undefined}>
        <span className="font-medium text-foreground">{name}</span>
        {extension && <span className="text-muted-foreground font-normal">{extension}</span>}
      </span>;
  };
  const saveOutput = async () => {
    if (!output.trim()) {
      toast({
        title: "Nothing to save",
        description: "Run the tool to generate output first."
      });
      return;
    }
    if (!userId) {
      toast({
        title: "Log in required",
        description: "Please log in to save documents."
      });
      return;
    }
    try {
      setIsSaving(true);
      const base = slugFileName(docName.trim());
      if (!base) {
        toast({
          title: "Enter a file name",
          description: "Please provide a name before saving."
        });
        setIsSaving(false);
        return;
      }

      // Determine save path based on folder selection (folder is required)
      const selectedFolder = folders.find(f => f.id === saveToFolderId);
      if (!selectedFolder) {
        toast({
          title: "Select a folder",
          description: "Please select a folder before saving."
        });
        setIsSaving(false);
        return;
      }
      const pathPrefix = selectedFolder.storage_path.replace('/.keep', '');

      // Debug logging to verify save path
      console.log('Save location:', `Folder: ${selectedFolder.name}`);
      console.log('Path prefix:', pathPrefix);
      let originalEntry: {
        name: string;
        url: string;
        updatedAt?: string;
      } | undefined;
      let outputEntry: {
        name: string;
        url: string;
        updatedAt?: string;
      } | undefined;
      const newEntries: {
        name: string;
        url: string;
        updatedAt?: string;
      }[] = [];
      const isPdfUpload = selectedFile && /\.pdf$/i.test(selectedFile.name);
      if (selectedFile && isPdfUpload) {
        // Create a single merged PDF: original + Appendix with AI output
        const origBytes = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(origBytes);
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;
        const left = 50;
        const topPad = 50;
        const bottomPad = 50;
        const lineHeight = 16;
        const maxWidth = 500; // approx usable width on A4/Letter

        const wrapText = (txt: string) => {
          const words = txt.split(/\s+/);
          const lines: string[] = [];
          let line = "";
          for (const w of words) {
            const test = line ? `${line} ${w}` : w;
            if (font.widthOfTextAtSize(test, fontSize) <= maxWidth) {
              line = test;
            } else {
              if (line) lines.push(line);
              line = w;
            }
          }
          if (line) lines.push(line);
          return lines;
        };
        const appendixHeader = "Appendix: AI Output";
        const appendixText = `${appendixHeader}\n\n${output}`;
        const lines = appendixText.split(/\n/).flatMap(l => wrapText(l || " "));
        let i = 0;
        while (i < lines.length) {
          const page = pdfDoc.addPage();
          const {
            height
          } = page.getSize();
          let y = height - topPad;
          while (i < lines.length && y > bottomPad) {
            page.drawText(lines[i], {
              x: left,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0, 0)
            });
            y -= lineHeight;
            i++;
          }
        }
        const mergedBytes = await pdfDoc.save();
        const mergedBlob = new Blob([mergedBytes], {
          type: 'application/pdf'
        });
        const outputFilename = base.endsWith('.pdf') ? base : `${base}.pdf`;
        const outputPath = `${pathPrefix}/${outputFilename}`;
        const {
          error: outputErr
        } = await supabase.storage.from('documents').upload(outputPath, mergedBlob, {
          contentType: 'application/pdf',
          upsert: false
        });
        if (outputErr) throw outputErr;
        const {
          data: outputSigned
        } = await supabase.storage.from('documents').createSignedUrl(outputPath, 600);

        // Save only the merged PDF (original + AI output combined)
        outputEntry = {
          name: outputFilename,
          url: outputSigned?.signedUrl || '#',
          updatedAt: new Date().toISOString()
        };
        newEntries.push(outputEntry);
      } else {
        // Fallback: save AI output as a text file and optionally the original non-PDF
        const outputFilename = base.endsWith('.txt') ? base : `${base}.txt`;
        const outputPath = `${pathPrefix}/${outputFilename}`;
        const outputBlob = new Blob([output], {
          type: 'text/plain;charset=utf-8'
        });
        const {
          error: outputErr
        } = await supabase.storage.from('documents').upload(outputPath, outputBlob, {
          contentType: 'text/plain',
          upsert: false
        });
        if (outputErr) throw outputErr;
        const {
          data: outputSigned
        } = await supabase.storage.from('documents').createSignedUrl(outputPath, 600);

        // Save only the AI output as a text file
        outputEntry = {
          name: outputFilename,
          url: outputSigned?.signedUrl || '#',
          updatedAt: new Date().toISOString()
        };
        newEntries.push(outputEntry);
      }

      // Save to database with AI tool information
      if (newEntries.length > 0) {
        try {
          for (const entry of newEntries) {
            const {
              error: dbError
            } = await supabase.from('analyzed_files').insert({
              user_id: userId,
              file_name: entry.name,
              file_path: entry.url,
              analysis_type: activeTool?.title || 'Unknown',
              ai_tool_used: activeTool?.title || 'Unknown',
              analysis_result: outputEntry?.name === entry.name ? output : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            if (dbError) {
              console.error('Database save error:', dbError);
              // Don't fail the whole process if DB save fails
            }
          }
        } catch (dbErr: any) {
          console.error('Failed to save to database:', dbErr);
          // Don't fail the whole process if DB save fails
        }
      }

      // Refresh analyzed files count after successful save
      if (newEntries.length > 0) {
        await fetchAnalyzedFilesCount();
      }

      // Update the appropriate document list based on folder selection
      if (selectedFolder) {
        // If saved to a folder, refresh folder contents if that folder is currently open
        if (openFolder && openFolder.id === selectedFolder.id) {
          await fetchFolderDocs(selectedFolder.storage_path.replace('/.keep', ''));
        }
        toast({
          title: 'Saved to folder',
          description: `Document with ${activeTool?.title || 'AI tool'} analysis saved to ${selectedFolder.name}`
        });
      } else {
        toast({
          title: 'Saved to My documents',
          description: `Document with ${activeTool?.title || 'AI tool'} analysis saved`
        });
      }
      setLastSavedPair({
        original: originalEntry,
        output: outputEntry
      });
      setSaveToFolderId(null);
      handleClose();
    } catch (e: any) {
      toast({
        title: 'Save failed',
        description: e?.message || 'Could not save document.',
        variant: 'destructive'
      } as any);
    } finally {
      setIsSaving(false);
    }
  };

  // New File dialog helpers
  const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setNewFile(f);
    if (f) {
      const dot = f.name.lastIndexOf('.');
      const base = dot >= 0 ? f.name.slice(0, dot) : f.name;
      setNewFileName(slugFileName(base));
    } else {
      setNewFileName("");
    }
  };
  const saveNewUpload = async () => {
    if (!userId) {
      toast({
        title: 'Log in required',
        description: 'Please log in to upload.'
      });
      return;
    }
    if (!newFile) {
      toast({
        title: 'No file selected',
        description: 'Choose a file to upload.'
      });
      return;
    }
    const dot = newFile.name.lastIndexOf('.');
    const ext = dot >= 0 ? newFile.name.slice(dot) : '';
    let finalName = slugFileName(newFileName.trim());
    if (!finalName) {
      toast({
        title: 'Name required',
        description: 'Enter a file name.'
      });
      return;
    }
    if (ext && !finalName.endsWith(ext)) finalName += ext;

    // Determine save path based on folder selection (folder is required)
    const selectedFolder = folders.find(f => f.id === newFileSaveToFolderId);
    if (!selectedFolder) {
      toast({
        title: 'Select a folder',
        description: 'Please select a folder before saving.'
      });
      return;
    }
    const pathPrefix = selectedFolder.storage_path.replace('/.keep', '');
    const pathBase = `${pathPrefix}/${finalName}`;

    // Debug logging to verify save path
    console.log('New file save location:', `Folder: ${selectedFolder.name}`);
    console.log('Path prefix:', pathPrefix);
    console.log('Full path:', pathBase);
    try {
      setNewSaving(true);
      let {
        error: upErr
      } = await supabase.storage.from('documents').upload(pathBase, newFile, {
        upsert: false
      });
      let savedName = finalName;
      if (upErr) {
        const msg = String((upErr as any).message || '').toLowerCase();
        if (msg.includes('exists')) {
          const dot2 = finalName.lastIndexOf('.');
          const base2 = dot2 >= 0 ? finalName.slice(0, dot2) : finalName;
          const ext2 = dot2 >= 0 ? finalName.slice(dot2) : '';
          savedName = `${base2} (${Date.now()})${ext2}`;
          const altPath = `${pathPrefix}/${savedName}`;
          const {
            error: upErr2
          } = await supabase.storage.from('documents').upload(altPath, newFile, {
            upsert: false
          });
          if (upErr2) throw upErr2;
        } else {
          throw upErr;
        }
      }
      const finalPath = `${pathPrefix}/${savedName}`;
      const {
        data: signed
      } = await supabase.storage.from('documents').createSignedUrl(finalPath, 600);
      const entry = {
        name: savedName,
        url: signed?.signedUrl || '#',
        updatedAt: new Date().toISOString()
      };
      // Update the appropriate document list based on folder selection
      if (selectedFolder) {
        // If saved to a folder, refresh folder contents if that folder is currently open
        if (openFolder && openFolder.id === selectedFolder.id) {
          await fetchFolderDocs(selectedFolder.storage_path.replace('/.keep', ''));
        }
        toast({
          title: 'Uploaded to folder',
          description: `${savedName} saved to ${selectedFolder.name}`
        });
      } else {
        toast({
          title: 'Uploaded',
          description: `${savedName} saved to My documents`
        });
      }
      setNewOpen(false);
      setNewFile(null);
      setNewFileName('');
      setNewFileSaveToFolderId(null);
    } catch (e: any) {
      toast({
        title: 'Upload failed',
        description: e?.message || 'Could not upload.',
        variant: 'destructive'
      } as any);
    } finally {
      setNewSaving(false);
    }
  };
  const createFolder = async (folderName?: string) => {
    if (!userId) {
      toast({
        title: 'Log in required',
        description: 'Please log in to create folders.'
      });
      return;
    }
    const base = slugFileName((folderName || newFolderName).trim());
    if (!base) {
      toast({
        title: 'Folder name required',
        description: 'Please enter a folder name.'
      });
      return;
    }
    try {
      setCreatingFolder(true);
      let folder = base;
      let path = `${userId}/${folder}/.keep`;

      // Create folder in storage
      let {
        error
      } = await supabase.storage.from('documents').upload(path, new Blob([], {
        type: 'text/plain'
      }), {
        upsert: false
      });
      if (error) {
        const msg = String((error as any).message || '').toLowerCase();
        if (msg.includes('exists')) {
          folder = `${base}-${Date.now()}`;
          path = `${userId}/${folder}/.keep`;
          const {
            error: err2
          } = await supabase.storage.from('documents').upload(path, new Blob([], {
            type: 'text/plain'
          }), {
            upsert: false
          });
          if (err2) throw err2;
        } else {
          throw error;
        }
      }

      // Save folder to database
      const {
        data: folderData,
        error: dbError
      } = await supabase.from('folders').insert({
        user_id: userId,
        name: folder,
        storage_path: path
      }).select().single();
      if (dbError) throw dbError;

      // Update folders list
      setFolders(prev => [folderData, ...prev]);

      // Call the callback if it exists (from dropdown selection)
      if (createFolderCallback) {
        createFolderCallback(folderData.id);
        setCreateFolderCallback(null);
      }
      toast({
        title: 'Folder created',
        description: `Folder "${folder}" is ready and saved.`
      });
      setNewFolderName('');
      setCreateFolderDialogOpen(false);
      return folderData;
    } catch (e: any) {
      toast({
        title: 'Create folder failed',
        description: e?.message || 'Could not create folder.',
        variant: 'destructive'
      } as any);
    } finally {
      setCreatingFolder(false);
    }
  };
  const deleteFolder = async (folderId: string, folderName: string, storagePath: string) => {
    try {
      // Delete from database
      const {
        error: dbError
      } = await supabase.from('folders').delete().eq('id', folderId);
      if (dbError) throw dbError;

      // Delete from storage (optional - you might want to keep files)
      await supabase.storage.from('documents').remove([storagePath]);

      // Update folders list
      setFolders(prev => prev.filter(f => f.id !== folderId));
      toast({
        title: 'Folder deleted',
        description: `Folder "${folderName}" has been removed.`
      });
    } catch (e: any) {
      toast({
        title: 'Delete failed',
        description: e?.message || 'Could not delete folder.',
        variant: 'destructive'
      });
    }
  };
  const isPdf = (n: string) => /\.pdf$/i.test(n);
  const isImage = (n: string) => /\.(png|jpe?g|gif|webp|svg)$/i.test(n);

  // Move document to trash (directly without confirmation)
  const moveToTrash = async (doc: {
    name: string;
    url: string;
    updatedAt?: string;
  }) => {
    await performDelete(doc, false, openFolder || undefined);
  };

  // Perform actual delete after confirmation
  const performDelete = async (doc: {
    name: string;
    url: string;
    updatedAt?: string;
  }, isTrash?: boolean, folder?: {
    id: string;
    name: string;
    storage_path: string;
  }, fromStorage?: boolean) => {
    if (!userId) {
      toast({
        title: 'Log in required',
        description: 'Please log in to delete documents.'
      });
      return;
    }
    console.log('performDelete called with:', {
      doc: doc.name,
      isTrash,
      folder: folder?.name,
      fromStorage
    });

    // Determine the correct source path based on whether the file is in a folder
    let fromPath: string;
    if (folder) {
      // File is in a folder
      const folderPath = folder.storage_path.replace('/.keep', '');
      fromPath = `${folderPath}/${doc.name}`;
      console.log('Deleting from folder path:', fromPath);
    } else {
      // File is in root directory
      fromPath = `${userId}/${doc.name}`;
      console.log('Deleting from root path:', fromPath);
    }
    let toName = doc.name;
    let toPath = `${userId}/trash/${toName}`;
    console.log('Moving to trash path:', toPath);
    const tryMove = async (dst: string) => {
      return await supabase.storage.from('documents').move(fromPath, dst);
    };
    let {
      error: moveError
    } = await tryMove(toPath);
    if (moveError) {
      console.log('Move error:', moveError);
      const msg = String((moveError as any).message || '').toLowerCase();
      if (msg.includes('exists')) {
        const dot = toName.lastIndexOf('.');
        const base = dot >= 0 ? toName.slice(0, dot) : toName;
        const ext = dot >= 0 ? toName.slice(dot) : '';
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        toName = `${base} (deleted ${stamp})${ext}`;
        toPath = `${userId}/trash/${toName}`;
        const {
          error: moveError2
        } = await tryMove(toPath);
        if (moveError2) {
          console.log('Second move error:', moveError2);
          toast({
            title: 'Could not move to Trash',
            description: (moveError2 as any).message || 'Unknown error',
            variant: 'destructive'
          } as any);
          return;
        }
      } else {
        toast({
          title: 'Could not move to Trash',
          description: (moveError as any).message || 'Unknown error',
          variant: 'destructive'
        } as any);
        return;
      }
    }
    console.log('File moved successfully, updating UI...');

    // Update UI state - remove from main docs list if it was there
    setDocs(prev => prev.filter(d => d.name !== doc.name));

    // If deleting from a folder, refresh the folder contents
    if (folder && openFolder && openFolder.id === folder.id) {
      console.log('Refreshing folder contents...');
      await fetchFolderDocs(folder.storage_path.replace('/.keep', ''));
    }

    // Immediately remove from allFiles for instant feedback in storage popup
    console.log('Removing from allFiles...');
    setAllFiles(prev => {
      const filtered = prev.filter(f => f.name !== doc.name);
      console.log('AllFiles before:', prev.length, 'after:', filtered.length);
      return filtered;
    });

    // Refresh the allFiles list for storage popup as backup
    console.log('Refreshing all files...');
    await refreshAllFiles();
    toast({
      title: 'Moved to Trash',
      description: doc.name
    });
  };

  // Perform permanent deletion
  const performPermanentDelete = async (doc: {
    name: string;
    url: string;
    updatedAt?: string;
  }, isTrash?: boolean) => {
    if (!userId) {
      toast({
        title: 'Log in required',
        description: 'Please log in to delete documents.'
      });
      return;
    }
    const path = isTrash ? `${userId}/trash/${doc.name}` : `${userId}/${doc.name}`;
    const {
      error: removeError
    } = await supabase.storage.from('documents').remove([path]);
    if (removeError) {
      toast({
        title: 'Could not delete',
        description: (removeError as any).message || 'Unknown error',
        variant: 'destructive'
      } as any);
      return;
    }
    if (isTrash) {
      setTrashDocs(prev => prev.filter(d => d.name !== doc.name));
    } else {
      setDocs(prev => prev.filter(d => d.name !== doc.name));
    }

    // Also update allFiles list for storage popup
    setAllFiles(prev => prev.filter(f => f.name !== doc.name));
    toast({
      title: 'Deleted forever',
      description: doc.name
    });
  };

  // Refresh allFiles list
  const refreshAllFiles = async () => {
    if (!userId) return;
    const allFilesArray: {
      name: string;
      url: string;
      updatedAt?: string;
      folder?: {
        id: string;
        name: string;
        storage_path: string;
      };
    }[] = [];

    // Add root files
    const {
      data: files
    } = await supabase.storage.from('documents').list(userId, {
      limit: 50,
      sortBy: {
        column: 'updated_at',
        order: 'desc'
      }
    });
    if (files) {
      const visible = files.filter((f: any) => {
        if (!f.name) return false;
        if (f.name === 'trash') return false;
        if (f.name.endsWith('/')) return false;
        if (f.name === '.keep') return false;
        // Only include actual files with extensions, exclude folder placeholders
        return f.name.includes('.') && f.metadata && f.metadata.size > 0;
      });
      const items = await Promise.all(visible.map(async (f: any) => {
        const path = `${userId}/${f.name}`;
        const {
          data: signed
        } = await supabase.storage.from('documents').createSignedUrl(path, 600);
        return {
          name: f.name,
          url: signed?.signedUrl || '#',
          updatedAt: f.updated_at || f.created_at
        };
      }));
      items.forEach(item => {
        // Only add actual files, not folders or system files
        if (!item.name.includes('.keep') && !item.name.endsWith('/')) {
          allFilesArray.push(item);
        }
      });
    }

    // Add files from all folders
    for (const folder of folders) {
      try {
        const folderPath = folder.storage_path.replace('/.keep', '');
        const {
          data: folderFiles
        } = await supabase.storage.from('documents').list(folderPath, {
          limit: 50,
          sortBy: {
            column: 'updated_at',
            order: 'desc'
          }
        });
        if (folderFiles) {
          const visibleFolderFiles = folderFiles.filter((f: any) => f.name && !f.name.endsWith('/') && f.name !== '.keep');
          for (const file of visibleFolderFiles) {
            // Only add actual files, not folders or system files
            if (!file.name.includes('.keep') && !file.name.endsWith('/')) {
              const filePath = `${folderPath}/${file.name}`;
              const {
                data: signed
              } = await supabase.storage.from('documents').createSignedUrl(filePath, 600);
              allFilesArray.push({
                name: file.name,
                url: signed?.signedUrl || '#',
                updatedAt: file.updated_at || file.created_at,
                folder: folder
              });
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching files from folder:', folder.name, err);
      }
    }
    setAllFiles(allFilesArray);
  };

  // Delete specific files from storage
  const deleteStorageItems = async (itemNames: string[]) => {
    if (!userId) return;
    try {
      const itemsToDelete = itemNames.map(name => `${userId}/${name}`);
      const {
        error
      } = await supabase.storage.from('documents').remove(itemsToDelete);
      if (error) {
        console.error('Error deleting items:', error);
        toast({
          title: "Error deleting items",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // Refresh the file lists
      await refreshAllFiles();
      toast({
        title: "Items deleted",
        description: `${itemNames.length} items removed from storage`
      });
    } catch (error: any) {
      console.error('Unexpected error deleting items:', error);
      toast({
        title: "Error deleting items",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  };
  const handleDocAction = async (action: 'view' | 'share' | 'delete' | 'delete-forever' | 'move' | 'rename', doc: {
    name: string;
    url: string;
    updatedAt?: string;
  }, isTrash?: boolean) => {
    if (action === 'move') {
      setMoveDocDialog({
        doc,
        selectedFolder: ''
      });
      return;
    }
    if (action === 'rename') {
      setRenameDocDialog({
        doc,
        newName: doc.name
      });
      return;
    }
    if (action === 'view') {
      await openDocumentPreview(doc);
      return;
    }
    if (action === 'share') {
      try {
        await navigator.clipboard.writeText(doc.url);
        toast({
          title: 'Link copied',
          description: 'Signed link copied to clipboard.'
        });
      } catch (e) {
        window.open(doc.url, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    if (action === 'delete-forever') {
      if (!userId) {
        toast({
          title: 'Log in required',
          description: 'Please log in to delete documents.'
        });
        return;
      }
      setDeleteForeverDialog({
        doc,
        isTrash
      });
      return;
    }
    if (action === 'delete') {
      if (!userId) {
        toast({
          title: 'Log in required',
          description: 'Please log in to delete documents.'
        });
        return;
      }
      setDeleteConfirmDialog({
        doc,
        isTrash: false,
        folder: openFolder || undefined
      });
      return;
    }
  };
  const handleMoveDoc = async () => {
    if (!moveDocDialog || !userId) return;
    try {
      const {
        doc,
        selectedFolder
      } = moveDocDialog;
      const fromPath = `${userId}/${doc.name}`;

      // Find the selected folder's storage path
      const targetFolder = selectedFolder ? folders.find(f => f.name === selectedFolder) : null;
      const toPath = targetFolder ? `${targetFolder.storage_path}/${doc.name}` : `${userId}/${doc.name}`;
      const {
        error
      } = await supabase.storage.from('documents').move(fromPath, toPath);
      if (error) throw error;

      // Remove from current docs list
      setDocs(prev => prev.filter(d => d.name !== doc.name));

      // If moving to a folder that's currently open, refresh its contents
      if (openFolder && targetFolder && openFolder.id === targetFolder.id) {
        await fetchFolderDocs(targetFolder.storage_path);
      }
      toast({
        title: 'File moved',
        description: `${doc.name} moved to ${selectedFolder || 'My Documents'}`
      });
      setMoveDocDialog(null);
    } catch (error: any) {
      toast({
        title: 'Move failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const handleRenameDoc = async () => {
    if (!renameDocDialog || !userId) return;
    try {
      const {
        doc,
        newName
      } = renameDocDialog;
      if (newName === doc.name) {
        setRenameDocDialog(null);
        return;
      }
      const fromPath = `${userId}/${doc.name}`;
      const toPath = `${userId}/${newName}`;
      const {
        error
      } = await supabase.storage.from('documents').move(fromPath, toPath);
      if (error) throw error;

      // Update the docs list
      setDocs(prev => prev.map(d => d.name === doc.name ? {
        ...d,
        name: newName
      } : d));
      toast({
        title: 'File renamed',
        description: `Renamed to ${newName}`
      });
      setRenameDocDialog(null);
    } catch (error: any) {
      toast({
        title: 'Rename failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const getPlaceholder = (title: string) => {
    switch (title) {
      case "Summarize Long Documents":
        return "Upload here your file you want to Summerize";
      case "Cross-Doc Linker":
        return "Provide text or keywords to find and link related evidence across documents...";
      case "Translate & Localize":
        return "Enter text to translate and the target locale (e.g., en->nl)...";
      case "Contract Analysis & Risk Detection":
        return "Paste clauses or contract excerpts to analyze risks...";
      case "Smart Error Detection":
        return "Paste content to scan for issues and suggestions...";
      case "Merge documents":
        return "Upload documents to merge and specify the desired order or rules...";
      case "Analyze data from a file":
        return "Upload a CSV/Excel file and describe what you want analyzed...";
      default:
        return "Enter your text...";
    }
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };
  const handleMyAccount = async () => {
    navigate("/account");
  };
  const DOC_QUOTA = 15;
  const usagePct = Math.min(100, Math.round(docs.length / DOC_QUOTA * 100));
  return <>
      <Helmet>
        <title>AI Tools Dashboard – DocMind AI</title>
        <meta name="description" content="Access AI tools for summarizing, rewriting, and generating content." />
        <link rel="canonical" href="/dashboard" />
      </Helmet>

      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex items-center justify-between md:justify-between justify-center py-4 pt-8 relative">
          <div className="flex items-center gap-2 md:static absolute left-1/2 transform -translate-x-1/2 md:transform-none">
            <img src="/lovable-uploads/aeb94335-ceda-46db-bf06-7e2f0a5d17c8.png" alt="AI-DOCU logo" className="h-14 w-auto" />
            <h1 className="text-xl font-semibold hidden md:block"></h1>
          </div>
            <div className="flex items-center gap-2 md:static absolute right-4">
              {/* Desktop actions */}
              <Button variant="outline" size="sm" className="hidden md:inline-flex">
                <Languages className="mr-2 h-4 w-4" />
                Translate
              </Button>
              <Button variant="secondary" size="sm" onClick={handleMyAccount} className="hidden md:inline-flex"><User2 className="mr-2 h-4 w-4" />My account</Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden md:inline-flex"><LogOut className="mr-2 h-4 w-4" />Log out</Button>

              {/* Mobile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 w-44">
                  <DropdownMenuItem>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>Translate</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMyAccount}>
                    <User2 className="mr-2 h-4 w-4" />
                    <span>My account</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </nav>
      </header>

      <div className="container grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 py-6">
        <aside className="space-y-6">
          <div>
            <Button className="w-full" onClick={() => setNewOpen(true)}>+ New File</Button>
          </div>

          {/* Credits Section */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Analysis Credits</h3>
              <div className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="12 6v6l4 2"/>
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Credits Available</span>
                <span className="text-sm font-medium text-primary">
                  {10 - analyzedFilesCount} of 10
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.max(0, (10 - analyzedFilesCount) / 10 * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {analyzedFilesCount === 0 
                  ? "Start with 10 free analysis credits" 
                  : analyzedFilesCount >= 10 
                    ? "All credits used - upgrade for more" 
                    : `${10 - analyzedFilesCount} credits remaining`
                }
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <section aria-label="My Drive" className="md:rounded-lg md:border md:p-4">
              <div className="text-sm font-medium mb-2">My Drive</div>
              <Accordion type="multiple" className="w-full">

                <AccordionItem value="folders" id="folders">
                  <AccordionTrigger className="justify-start gap-2" aria-label="Folders">
                    <span className="inline-flex items-center" aria-hidden="false"><Folder className="mr-2 h-4 w-4" /> <span>Folders</span></span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input placeholder="New folder name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="text-sm" />
                        <Button size="sm" onClick={() => createFolder()} disabled={!userId || creatingFolder || !newFolderName.trim()}>
                          {creatingFolder ? 'Creating...' : 'Create'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground"></p>
                      
                      {/* Display existing folders */}
                      {folders.length > 0 && !openFolder && <div className="mt-4 space-y-2">
                          <div className="text-sm font-medium">Your Folders</div>
                          <ul className="space-y-1">
                            {folders.map(folder => <li key={folder.id} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                                <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0" onClick={() => handleOpenFolder(folder)}>
                                  <div className="flex-shrink-0">
                                    <Folder className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium text-foreground truncate">{folder.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(new Date(folder.created_at), {
                                  addSuffix: true
                                })}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <Menu className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => deleteFolder(folder.id, folder.name, folder.storage_path)}>
                                        Delete folder
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </li>)}
                          </ul>
                        </div>}
                      
                      {/* Display folder contents when a folder is open */}
                      {openFolder && <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={handleCloseFolder} className="h-6 px-2">
                              ← Back
                            </Button>
                            <div className="text-sm font-medium">{openFolder.name}</div>
                          </div>
                          {folderDocs.length === 0 ? <div className="text-xs text-muted-foreground">This folder is empty.</div> : <ul className="space-y-2">
                              {folderDocs.map((doc, i) => <li key={i} className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors">
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <FileNameDisplay fileName={doc.name} className="text-sm" />
                                      {doc.updatedAt && <div className="text-xs text-muted-foreground mt-0.5">
                                          {formatDistanceToNow(new Date(doc.updatedAt), {
                                  addSuffix: true
                                })}
                                        </div>}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                          <Menu className="h-3 w-3" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openDocumentPreview(doc)}>
                                          Preview
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setRenameDocDialog({
                                  doc,
                                  newName: doc.name
                                })}>
                                          Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => moveToTrash(doc)}>
                                          Move to Trash
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </li>)}
                            </ul>}
                        </div>}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="trash" id="trash">
                  <AccordionTrigger className="justify-start gap-2" aria-label="Trash">
                    <span className="inline-flex items-center" aria-hidden="false"><Trash2 className="mr-2 h-4 w-4" /> <span>Trash</span></span>
                  </AccordionTrigger>
                  <AccordionContent className="animate-fade-in">
                    {trashDocs.length === 0 ? <div className="text-xs text-muted-foreground">No items in Trash.</div> : <ul className="space-y-2">
                        {trashDocs.slice(0, 10).map(d => <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
                            <div className="min-w-0 flex-1">
                              <FileNameDisplay fileName={d.name} className="block" />
                              {d.updatedAt && <span className="block text-[11px] text-muted-foreground">
                                  {formatDistanceToNow(new Date(d.updatedAt), {
                            addSuffix: true
                          })}
                                </span>}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Options">
                                  <Menu className="h-4 w-4" aria-hidden="true" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="z-50">
                                <DropdownMenuItem onClick={() => handleDocAction('view', d)}>View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDocAction('share', d)}>Share</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDocAction('delete-forever', d, true)}>Delete forever</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </li>)}
                      </ul>}
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </section>
          </nav>

          <section aria-label="Upgrade to Pro" className="rounded-xl border p-4 bg-gradient-subtle shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center rounded-md bg-primary/10 p-2 ring-1 ring-primary/20">
                  <Rocket className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm font-medium">Pro features</div>
                <Badge variant="secondary">PRO</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Unlock all tools and higher limits.</p>
            <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />All PRO tools</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />Higher limits & faster processing</li>
              <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" />Priority support</li>
            </ul>
            <Button variant="pro" size="sm" className="w-full mt-3" onClick={() => setUpgradeModalOpen(true)}>
              <Rocket className="size-4 mr-2" aria-hidden="true" /> Upgrade to Pro
            </Button>
          </section>


        </aside>

        <main>
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map(t => <Card key={t.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="relative">
                  <div className="size-12 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center">
                    <t.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <CardTitle className="text-lg">{t.title}</CardTitle>
                    {t.proOnly && <>
                        <Badge variant="secondary">PRO</Badge>
                        <Button variant="pro" size="sm" className="absolute right-4 top-4 inline-flex" onClick={() => setUpgradeModalOpen(true)} aria-label="Upgrade to Pro">
                          <Rocket className="size-4 mr-2" aria-hidden="true" />
                          Upgrade to Pro
                        </Button>
                      </>}
                  </div>
                  <CardDescription>
                    {t.desc} {t.proOnly && <span className="ml-1">(Upgrade to Pro to use)</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" onClick={() => t.proOnly ? setProPromptTool(t) : setActiveTool(t)}>{t.cta ?? "Open AI tool"}</Button>
                </CardContent>
              </Card>)}
          </section>

          {/* New File upload dialog */}
          <Dialog open={newOpen} onOpenChange={open => {
          setNewOpen(open);
          if (!open) {
            setNewFile(null);
            setNewFileName('');
          }
        }}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload new file</DialogTitle>
                <DialogDescription>Upload a file to My documents. It will also appear in Recent.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <input ref={newFileInputRef} type="file" className="hidden" onChange={handleNewFileChange} />
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => newFileInputRef.current?.click()}>Choose file</Button>
                  {newFile && <span className="text-sm text-muted-foreground truncate">{newFile.name}</span>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-name">File name</Label>
                  <Input id="new-name" placeholder="Enter file name" value={newFileName} onChange={e => setNewFileName(e.target.value)} />
                  <p className="text-xs text-muted-foreground">We’ll keep the original extension.</p>
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="new-save-location">Save location</Label>
                  <select id="new-save-location" value={newFileSaveToFolderId || ''} onChange={e => {
                  if (e.target.value === 'create-new') {
                    setCreateFolderCallback((folderId: string) => setNewFileSaveToFolderId(folderId));
                    setCreateFolderDialogOpen(true);
                  } else {
                    setNewFileSaveToFolderId(e.target.value || null);
                  }
                }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="" disabled>Select a folder</option>
                    {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                    <option value="create-new">+ Create folder</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {newFileSaveToFolderId ? `Will be saved in the selected folder.` : `Please select a folder to save your file.`}
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setNewOpen(false)}>Cancel</Button>
                <Button onClick={saveNewUpload} disabled={!newFile || !userId || newSaving || !newFileName.trim() || !newFileSaveToFolderId}>
                  {newSaving ? "Saving..." : "Save to folder"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

         <Dialog open={!!activeTool} onOpenChange={open => {
          if (!open) {
            handleClose();
          }
        }}>
          <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{activeTool?.title}</DialogTitle>
              <DialogDescription>
                Use this AI tool to {activeTool?.desc?.toLowerCase()}. Note: Please import PDF files.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                {activeTool?.title === "Cross-Doc Linker" ? null : <Label htmlFor="tool-input">{activeTool?.title === "Translate & Localize" || activeTool?.title === "Summarize Long Documents" ? "Document" : "Input"}</Label>}
                {activeTool?.title === "Translate & Localize" || activeTool?.title === "Summarize Long Documents" ? <div role="button" tabIndex={0} onClick={triggerFileDialog} onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') triggerFileDialog();
                }} onDragOver={e => {
                  e.preventDefault();
                  setIsDragActive(true);
                }} onDragLeave={() => setIsDragActive(false)} onDrop={e => {
                  e.preventDefault();
                  setIsDragActive(false);
                  const f = e.dataTransfer.files?.[0];
                  if (f) setSelectedFile(f);
                }} className={`flex w-full items-center justify-center rounded-md border text-sm transition cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : selectedFile ? 'border-border bg-muted/10 py-3' : 'h-28 border-dashed'} hover-scale`} aria-label="Drop your file here or click to upload">
                    {selectedFile ? <div className="w-full px-2 animate-fade-in">
                        <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2">
                          <div className="rounded-md bg-primary/10 p-2">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={triggerFileDialog}>Change</Button>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Remove</Button>
                          </div>
                        </div>
                      </div> : <span className="text-muted-foreground">Drop your file here or click to upload</span>}
                  </div> : activeTool?.title === "Cross-Doc Linker" ? null : <Textarea id="tool-input" placeholder={activeTool ? getPlaceholder(activeTool.title) : ""} value={input} onChange={e => setInput(e.target.value)} rows={6} />}
              </div>

              {activeTool?.title === "Translate & Localize" && <div className="space-y-2">
                  <Label>Language</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" aria-label="Select target language">
                        {translateLang}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setTranslateLang("en->nl")}>English → Dutch</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("en->de")}>English → German</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("en->fr")}>English → French</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("nl->en")}>Dutch → English</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("de->en")}>German → English</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTranslateLang("fr->en")}>French → English</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>}

              <div className="space-y-2">
                <input id="tool-file" ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                {activeTool?.title !== "Translate & Localize" && activeTool?.title !== "Summarize Long Documents" && <>
                    <Label htmlFor="tool-file">Document</Label>
                    <div role="button" tabIndex={0} onClick={triggerFileDialog} onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') triggerFileDialog();
                  }} onDragOver={e => {
                    e.preventDefault();
                    setIsDragActive(true);
                  }} onDragLeave={() => setIsDragActive(false)} onDrop={e => {
                    e.preventDefault();
                    setIsDragActive(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) setSelectedFile(f);
                  }} className={`flex w-full items-center justify-center rounded-md border text-sm transition cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : selectedFile ? 'border-border bg-muted/10 py-3' : 'h-28 border-dashed'} hover-scale`} aria-label="Drop your file here or click to upload">
                      {selectedFile ? <div className="w-full px-2 animate-fade-in">
                          <div className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2">
                            <div className="rounded-md bg-primary/10 p-2">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={triggerFileDialog}>Change</Button>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Remove</Button>
                            </div>
                          </div>
                        </div> : <span className="text-muted-foreground">Drop your file here or click to upload</span>}
                    </div>
                  </>}
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={() => summarizeWithAI()} disabled={isSending || !selectedFile && !input.trim()}>{isSending ? "Sending..." : activeTool?.title === "Translate & Localize" ? "Translate with AI" : activeTool?.title === "Cross-Doc Linker" ? "Search-Doc with AI" : "Summarize with AI"}</Button>
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
              </div>

              <div className="space-y-2">
                <Label>Output</Label>
                <OutputPanel title={activeTool?.title === "Cross-Doc Linker" ? "AI CROSS-DOC LINKER" : activeTool?.title === "Translate & Localize" ? "AI TRANSLATE & LOCALIZE" : "AI SUMMARY"} content={output} emptyText="Results will appear here." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doc-name">Document name</Label>
                <Input id="doc-name" placeholder="Give your document a name" value={docName} onChange={e => setDocName(e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="save-location">Save location</Label>
                <select id="save-location" value={saveToFolderId || ''} onChange={e => {
                  if (e.target.value === 'create-new') {
                    setCreateFolderCallback((folderId: string) => setSaveToFolderId(folderId));
                    setCreateFolderDialogOpen(true);
                  } else {
                    setSaveToFolderId(e.target.value || null);
                  }
                }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="" disabled>Select a folder</option>
                  {folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}
                  <option value="create-new">+ Create folder</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  {saveToFolderId ? `Will be saved in the selected folder.` : `Please select a folder to save your document.`}
                </p>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-between">
              <Button variant="secondary" onClick={saveOutput} disabled={!output.trim() || !userId || isSaving || !docName.trim() || !saveToFolderId}>
                {isSaving ? "Saving..." : "Save to folder"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setFeedbackOpen(true)}>Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={!!proPromptTool} onOpenChange={open => {
          if (!open) setProPromptTool(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upgrade to Pro</DialogTitle>
              <DialogDescription>
                {proPromptTool ? `${proPromptTool.title} is a Pro feature.` : 'This is a Pro feature.'} Upgrade to use it.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setProPromptTool(null)}>Maybe later</Button>
              <Button variant="pro" onClick={() => setUpgradeModalOpen(true)}><Rocket className="size-4" aria-hidden="true" /> Upgrade to Pro</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="size-5 text-primary" />
                Upgrade to Pro
              </DialogTitle>
              <DialogDescription>
                Unlock unlimited AI tools, higher limits, priority support, and faster processing.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Free Plan</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Basic AI tools</li>
                    <li>• Limited processing</li>
                    <li>• Standard support</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-primary">Pro Plan</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-1"><Check className="size-3 text-primary" />All AI tools</li>
                    <li className="flex items-center gap-1"><Check className="size-3 text-primary" />Unlimited usage</li>
                    <li className="flex items-center gap-1"><Check className="size-3 text-primary" />Priority support</li>
                    <li className="flex items-center gap-1"><Check className="size-3 text-primary" />Faster processing</li>
                  </ul>
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setUpgradeModalOpen(false)}>
                Maybe later
              </Button>
              <Button variant="pro" onClick={() => navigate('/pricing')}>
                <Rocket className="size-4 mr-2" />
                View pricing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <PreviewModal previewDoc={previewDoc} lastSavedPair={lastSavedPair} onClose={() => setPreviewDoc(null)} isPdf={isPdf} isImage={isImage} aiToolUsed={previewDoc?.aiToolUsed} analysisResult={previewDoc?.analysisResult} />
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Send feedback</DialogTitle>
              <DialogDescription>Tell us what you think of this summary.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="feedback">Your feedback</Label>
              <Textarea id="feedback" placeholder="Type your feedback..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFeedbackOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (!feedbackText.trim()) {
                  toast({
                    title: 'Feedback is empty',
                    description: 'Please add a comment.'
                  });
                  return;
                }
                toast({
                  title: 'Thank you!',
                  description: 'Your feedback helps us improve.'
                });
                setFeedbackText('');
                setFeedbackOpen(false);
              }}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Move Document Dialog */}
        <Dialog open={!!moveDocDialog} onOpenChange={open => {
          if (!open) setMoveDocDialog(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Move File</DialogTitle>
              <DialogDescription>
                Choose a folder to move "{moveDocDialog?.doc.name}" to, or leave blank for root documents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-select">Select Folder</Label>
                <select id="folder-select" className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm" value={moveDocDialog?.selectedFolder || ''} onChange={e => moveDocDialog && setMoveDocDialog({
                  ...moveDocDialog,
                  selectedFolder: e.target.value
                })}>
                  <option value="">My Documents</option>
                  {folders.map(folder => <option key={folder.id} value={folder.name}>{folder.name}</option>)}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMoveDocDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleMoveDoc}>
                Move File
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Document Dialog */}
        <Dialog open={!!renameDocDialog} onOpenChange={open => {
          if (!open) setRenameDocDialog(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename File</DialogTitle>
              <DialogDescription>
                Enter a new name for "{renameDocDialog?.doc.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-name">New File Name</Label>
                <Input id="new-name" value={renameDocDialog?.newName || ''} onChange={e => renameDocDialog && setRenameDocDialog({
                  ...renameDocDialog,
                  newName: e.target.value
                })} placeholder="Enter new name" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRenameDocDialog(null)}>
                Cancel
              </Button>
              <Button onClick={handleRenameDoc} disabled={!renameDocDialog?.newName.trim()}>
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a folder to organize your documents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="folder-name">New folder name</Label>
                <Input id="folder-name" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Enter folder name" className="mt-1" />
              </div>
              <p className="text-xs text-muted-foreground">
                Folders help you organize files and can be accessed from My Documents.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCreateFolderDialogOpen(false);
                setNewFolderName('');
                setCreateFolderCallback(null);
              }}>
                Cancel
              </Button>
              <Button onClick={() => createFolder(newFolderName)} disabled={!userId || creatingFolder || !newFolderName.trim()} className="bg-primary hover:bg-primary/90">
                {creatingFolder ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Storage Files Dialog */}
        <Dialog open={storagePopupOpen} onOpenChange={setStoragePopupOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Files className="h-5 w-5" />
                All Files ({allFiles.length}/{DOC_QUOTA})
              </DialogTitle>
              <DialogDescription>
                View and manage all your stored documents
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              {docs.length === 0 ? <div className="text-center py-8 text-muted-foreground">
                  <Files className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <div>No documents stored yet</div>
                  <div className="text-xs mt-1">Upload files to see them here</div>
                </div> : <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-4">
                    Storage usage: {usagePct}% • {Math.max(0, DOC_QUOTA - docs.length)} slots remaining
                  </div>
                  <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                    {/* Add cleanup button for problematic items */}
                    <div className="mb-4 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                      <div className="text-sm font-medium text-orange-800 mb-2">Clean up storage</div>
                      <div className="text-xs text-orange-700 mb-3">
                        Remove problematic folder placeholders that are causing errors
                      </div>
                      <Button size="sm" variant="outline" onClick={() => deleteStorageItems(['test-1-1755551423899', 'test-1', 'folder-2', 'folder-1', '3-folder'])} className="text-orange-700 border-orange-300 hover:bg-orange-100">
                        Clean Up Storage
                      </Button>
                    </div>
                    {allFiles.map((doc, i) => <li key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                        <div className="min-w-0 flex-1">
                          <FileNameDisplay fileName={doc.name} className="text-sm" />
                          {doc.folder && <div className="text-xs text-muted-foreground">in {doc.folder.name}</div>}
                          {doc.updatedAt && <div className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(doc.updatedAt), {
                            addSuffix: true
                          })}
                              </div>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Menu className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="z-50">
                              <DropdownMenuItem onClick={() => {
                            openDocumentPreview(doc);
                            setStoragePopupOpen(false);
                          }}>
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDocAction('share', doc)}>
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                            setMoveDocDialog({
                              doc,
                              selectedFolder: ''
                            });
                            setStoragePopupOpen(false);
                          }}>
                                Move to Folder
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                            setRenameDocDialog({
                              doc,
                              newName: doc.name
                            });
                            setStoragePopupOpen(false);
                          }}>
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                            setDeleteConfirmDialog({
                              doc,
                              isTrash: false,
                              folder: doc.folder,
                              fromStorage: true
                            });
                            // Keep storage popup open during deletion
                          }}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </li>)}
                  </ul>
                </div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStoragePopupOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmDialog} onOpenChange={open => !open && setDeleteConfirmDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this document? The document will be moved to trash.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                if (deleteConfirmDialog) {
                  await performDelete(deleteConfirmDialog.doc, deleteConfirmDialog.isTrash, deleteConfirmDialog.folder, deleteConfirmDialog.fromStorage);
                  setDeleteConfirmDialog(null);
                }
              }}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Delete Forever Confirmation Dialog */}
        <AlertDialog open={!!deleteForeverDialog} onOpenChange={open => !open && setDeleteForeverDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Forever</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this document? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                if (deleteForeverDialog) {
                  await performPermanentDelete(deleteForeverDialog.doc, deleteForeverDialog.isTrash);
                  setDeleteForeverDialog(null);
                }
              }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </main>
      </div>
    </>;
};
export default Dashboard;