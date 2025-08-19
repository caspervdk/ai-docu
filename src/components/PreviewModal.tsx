import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PDFPreview from "./PDFPreview";

interface PreviewModalProps {
  previewDoc: { name: string; url: string } | null;
  lastSavedPair: { original?: { name: string; url: string }; output?: { name: string; url: string } } | null;
  onClose: () => void;
  isPdf: (filename: string) => boolean;
  isImage: (filename: string) => boolean;
}

export default function PreviewModal({ 
  previewDoc, 
  lastSavedPair, 
  onClose, 
  isPdf, 
  isImage 
}: PreviewModalProps) {
  if (!previewDoc) return null;

  const isPrevOrig = lastSavedPair?.original && previewDoc.name === lastSavedPair.original.name;
  const isPrevOut = lastSavedPair?.output && previewDoc.name === lastSavedPair.output.name;
  const hasInputOutput = lastSavedPair?.original && lastSavedPair?.output;

  const renderDocument = (doc: { name: string; url: string }, className = "") => {
    if (isPdf(doc.name)) {
      return <PDFPreview url={doc.url} fileName={doc.name} className={className} />;
    } else if (isImage(doc.name)) {
      return <img src={doc.url} alt={doc.name} className={`w-full h-full object-contain ${className}`} />;
    } else {
      return <iframe src={doc.url} className={`w-full h-full ${className}`} />;
    }
  };

  return (
    <Dialog open={!!previewDoc} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-7xl bg-gradient-subtle">
        <DialogHeader className="text-center space-y-3 pb-6 border-b border-border/50">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Document Preview
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground font-medium">
            {previewDoc.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="min-h-[75vh] relative">
          {hasInputOutput && (isPrevOrig || isPrevOut) ? (
            <Tabs defaultValue="split" className="w-full space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1.5 rounded-xl shadow-sm">
                <TabsTrigger 
                  value="split" 
                  className="rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                >
                  📊 Input & Output
                </TabsTrigger>
                <TabsTrigger 
                  value="input" 
                  className="rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                >
                  📄 Input Only
                </TabsTrigger>
                <TabsTrigger 
                  value="output" 
                  className="rounded-lg font-semibold data-[state=active]:bg-background data-[state=active]:shadow-md transition-all duration-300"
                >
                  ✨ Output Only
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="split" className="space-y-4">
                <div className="grid grid-cols-2 gap-6 h-[65vh]">
                  <div className="group bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-3 border-b border-border/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-foreground/80">Input Document</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{lastSavedPair.original?.name}</p>
                    </div>
                    <div className="h-[calc(65vh-4rem)] p-2">
                      <div className="h-full rounded-lg overflow-hidden border border-border/20">
                        {lastSavedPair.original && renderDocument(lastSavedPair.original)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="group bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-4 py-3 border-b border-border/30">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-foreground/80">AI Generated Output</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{lastSavedPair.output?.name}</p>
                    </div>
                    <div className="h-[calc(65vh-4rem)] p-2">
                      <div className="h-full rounded-lg overflow-hidden border border-border/20 bg-gradient-to-br from-background via-background/95 to-primary/5">
                        {lastSavedPair.output && renderDocument(lastSavedPair.output)}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="input" className="space-y-4">
                <div className="h-[65vh] bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 px-4 py-3 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-foreground/80">Input Document</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{lastSavedPair.original?.name}</p>
                  </div>
                  <div className="h-[calc(65vh-4rem)] p-2">
                    <div className="h-full rounded-lg overflow-hidden border border-border/20">
                      {lastSavedPair.original && renderDocument(lastSavedPair.original)}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="output" className="space-y-4">
                <div className="h-[65vh] bg-background/50 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-4 py-3 border-b border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-foreground/80">AI Generated Output</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{lastSavedPair.output?.name}</p>
                  </div>
                  <div className="h-[calc(65vh-4rem)] p-2">
                    <div className="h-full rounded-lg overflow-hidden border border-border/20 bg-gradient-to-br from-background via-background/95 to-primary/5">
                      {lastSavedPair.output && renderDocument(lastSavedPair.output)}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-[65vh] bg-background/50 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="h-full p-2">
                <div className="h-full rounded-lg overflow-hidden border border-border/20">
                  {renderDocument(previewDoc)}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" asChild>
            <a href={previewDoc.url} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </a>
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}