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
      <DialogContent className="max-w-[80vw] h-[80vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <DialogTitle className="text-xl font-semibold text-primary">
            Document Preview
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {previewDoc.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex h-[calc(80vh-120px)]">
          {/* PDF Viewer Side - Wider */}
          <div className="flex-[2] bg-slate-800 relative">
            {/* PDF Controls Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-slate-700/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b border-slate-600/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white/90">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <span className="text-sm font-medium">
                    {previewDoc.name.replace(/\.[^/.]+$/, "")}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-slate-600/50 rounded-lg px-4 py-2">
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                </button>
                <span className="text-white text-sm font-medium px-2">1 / 2</span>
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
                <div className="w-px h-4 bg-white/20 mx-2"></div>
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="21 21l-4.35-4.35"/>
                    <line x1="9" x2="13" y1="11" y2="11"/>
                  </svg>
                </button>
                <span className="text-white/70 text-sm">52%</span>
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="21 21l-4.35-4.35"/>
                    <line x1="9" x2="9" y1="9" y2="13"/>
                    <line x1="13" x2="13" y1="9" y2="13"/>
                    <line x1="9" x2="13" y1="11" y2="11"/>
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                </button>
                <button className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* PDF Content - Full size */}
            <div className="h-full pt-16 p-6">
              <div className="h-full bg-white rounded-lg shadow-2xl overflow-hidden">
                {renderDocument(previewDoc, "w-full h-full")}
              </div>
            </div>
          </div>
          
          {/* Output Panel Side - Bigger and Better */}
          <div className="flex-[1.2] bg-background border-l flex flex-col">
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {lastSavedPair?.output ? (
                <div className="p-6 space-y-6">
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                      <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        Document Analysis
                      </h4>
                      <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                        Dit is een eenvoudige PDF die is aangemaakt voor testdoeleinden. Gebruik dit document om 
                        te controleren of downloads, opslag en weergave van PDF-bestanden in jouw app goed werken.
                      </p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                      <h4 className="text-base font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        Content Summary
                      </h4>
                      <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
                        In dit document staan een titel, een subtitel, een datum en enkele voorbeeldparagrafen. Je 
                        kunt deze tekst later vervangen door dynamische content uit je applicatie.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                        <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h4"/>
                        <path d="M11 5h4l2 2-2 2h-4V5z"/>
                        <path d="M19 13h-6v8l6-8z"/>
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">AI Analysis Results</h4>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Upload and process a document to see detailed AI analysis results here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" asChild>
            <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15,3 21,3 21,9"/>
                <line x1="10" x2="21" y1="14" y2="3"/>
              </svg>
              Open in new tab
            </a>
          </Button>
          <Button variant="default" className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            Save
          </Button>
          <Button onClick={onClose} className="flex items-center gap-2">
            Close Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}