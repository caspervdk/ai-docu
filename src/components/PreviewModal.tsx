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
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>{previewDoc.name}</DialogTitle>
          <DialogDescription>Preview</DialogDescription>
        </DialogHeader>
        
        <div className="min-h-[70vh] relative">
          {hasInputOutput && (isPrevOrig || isPrevOut) ? (
            <Tabs defaultValue="split" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="split">Input & Output</TabsTrigger>
                <TabsTrigger value="input">Input Only</TabsTrigger>
                <TabsTrigger value="output">Output Only</TabsTrigger>
              </TabsList>
              
              <TabsContent value="split" className="mt-4">
                <div className="grid grid-cols-2 gap-4 h-[65vh]">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-3 py-2 text-sm font-medium border-b">
                      Input: {lastSavedPair.original?.name}
                    </div>
                    <div className="h-[calc(65vh-2.5rem)]">
                      {lastSavedPair.original && renderDocument(lastSavedPair.original)}
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-3 py-2 text-sm font-medium border-b">
                      Output: {lastSavedPair.output?.name}
                    </div>
                    <div className="h-[calc(65vh-2.5rem)]">
                      {lastSavedPair.output && renderDocument(lastSavedPair.output)}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="input" className="mt-4">
                <div className="h-[65vh] border rounded-lg overflow-hidden">
                  <div className="bg-muted px-3 py-2 text-sm font-medium border-b">
                    Input: {lastSavedPair.original?.name}
                  </div>
                  <div className="h-[calc(65vh-2.5rem)]">
                    {lastSavedPair.original && renderDocument(lastSavedPair.original)}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="output" className="mt-4">
                <div className="h-[65vh] border rounded-lg overflow-hidden">
                  <div className="bg-muted px-3 py-2 text-sm font-medium border-b">
                    Output: {lastSavedPair.output?.name}
                  </div>
                  <div className="h-[calc(65vh-2.5rem)]">
                    {lastSavedPair.output && renderDocument(lastSavedPair.output)}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-[65vh]">
              {renderDocument(previewDoc, "rounded-md border")}
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