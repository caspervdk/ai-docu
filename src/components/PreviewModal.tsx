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
      <DialogContent className="max-w-7xl h-[90vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <DialogTitle className="text-xl font-semibold text-primary">
            Document Preview
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {previewDoc.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex h-full">
          {/* PDF Viewer Side */}
          <div className="flex-1 bg-slate-800 relative">
            {/* PDF Controls Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-slate-700/90 backdrop-blur-sm px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button className="text-white/70 hover:text-white p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect width="20" height="14" x="2" y="3" rx="2"/>
                    <line x1="8" x2="16" y1="21" y2="21"/>
                    <line x1="12" x2="12" y1="17" y2="21"/>
                  </svg>
                </button>
                <span className="text-white/90 text-sm font-medium">
                  {previewDoc.name.replace(/\.[^/.]+$/, "")}
                </span>
              </div>
              
              <div className="flex items-center gap-1 bg-slate-600/50 rounded-lg px-3 py-1">
                <button className="text-white/70 hover:text-white p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                </button>
                <span className="text-white text-sm mx-2">1 / 2</span>
                <button className="text-white/70 hover:text-white p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
                <div className="w-px h-4 bg-white/20 mx-2"></div>
                <button className="text-white/70 hover:text-white p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="21 21l-4.35-4.35"/>
                    <line x1="9" x2="13" y1="11" y2="11"/>
                  </svg>
                </button>
                <span className="text-white/70 text-sm">52%</span>
                <button className="text-white/70 hover:text-white p-1">
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
                <button className="text-white/70 hover:text-white p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                </button>
                <button className="text-white/70 hover:text-white p-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 6,2 18,2 18,9"/>
                    <path d="6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                    <rect width="8" height="5" x="8" y="14"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* PDF Content */}
            <div className="h-full pt-12 p-4">
              <div className="h-full rounded-lg overflow-hidden border border-slate-600/50">
                {renderDocument(previewDoc)}
              </div>
            </div>
          </div>
          
          {/* Output Panel Side */}
          <div className="w-96 bg-background border-l flex flex-col">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-lg mb-2">Testdocument</h3>
              <p className="text-sm text-muted-foreground mb-1">Voorbeeldtekst voor PDF-test</p>
              <p className="text-xs text-muted-foreground">Datum: 18-08-2025</p>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {lastSavedPair?.output ? (
                <div className="space-y-4">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-sm leading-relaxed">
                      Dit is een eenvoudige PDF die is aangemaakt voor testdoeleinden. Gebruik dit document om 
                      te controleren of downloads, opslag en weergave van PDF-bestanden in jouw app goed werken.
                    </p>
                    
                    <p className="text-sm leading-relaxed">
                      In dit document staan een titel, een subtitel, een datum en enkele voorbeeldparagrafen. Je 
                      kunt deze tekst later vervangen door dynamische content uit je applicatie.
                    </p>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Checklist:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>- Kan ik dit bestand downloaden?</li>
                        <li>- Opent de PDF in de browser en op mobiel?</li>
                        <li>- Staat de opmaak netjes op één pagina?</li>
                        <li>- Wordt de bestandsnaam correct weergegeven?</li>
                        <li>- Wordt het document opgeslagen op de juiste plek (bijv. Supabase Storage)?</li>
                      </ul>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-6">
                      <strong>Opmerking:</strong> voor een productie-omgeving kun je overwegen om een bibliotheek te gebruiken 
                      zoals Reportlab of een HTML-naar-PDF oplossing, zodat je styles, tabellen en 
                      paginanummering kunt toevoegen.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                        <path d="14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" x2="8" y1="13" y2="13"/>
                        <line x1="16" x2="8" y1="17" y2="17"/>
                        <polyline points="10,9 9,9 8,9"/>
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      AI analysis results will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
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