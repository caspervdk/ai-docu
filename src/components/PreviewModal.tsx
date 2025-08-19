import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PDFPreview from "./PDFPreview";

interface PreviewModalProps {
  previewDoc: { name: string; url: string } | null;
  lastSavedPair: { original?: { name: string; url: string }; output?: { name: string; url: string } } | null;
  onClose: () => void;
  isPdf: (filename: string) => boolean;
  isImage: (filename: string) => boolean;
  aiToolUsed?: string | null;
  analysisResult?: string | null;
}

export default function PreviewModal({ 
  previewDoc, 
  lastSavedPair, 
  onClose, 
  isPdf, 
  isImage,
  aiToolUsed,
  analysisResult 
}: PreviewModalProps) {
  if (!previewDoc) return null;

  const isPrevOrig = lastSavedPair?.original && previewDoc.name === lastSavedPair.original.name;
  const isPrevOut = lastSavedPair?.output && previewDoc.name === lastSavedPair.output.name;
  const hasInputOutput = lastSavedPair?.original && lastSavedPair?.output;

  // Get AI tool styling based on the tool used
  const getAiToolStyling = () => {
    switch (aiToolUsed) {
      case 'Summarize Long Documents':
        return {
          bgClass: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
          borderClass: "border-blue-200/50 dark:border-blue-800/50",
          textClass: "text-blue-700 dark:text-blue-300",
          dotClass: "bg-blue-500"
        };
      case 'Cross-Doc Linker':
        return {
          bgClass: "bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20",
          borderClass: "border-purple-200/50 dark:border-purple-800/50",
          textClass: "text-purple-700 dark:text-purple-300",
          dotClass: "bg-purple-500"
        };
      case 'Translate & Localize':
        return {
          bgClass: "bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20",
          borderClass: "border-emerald-200/50 dark:border-emerald-800/50",
          textClass: "text-emerald-700 dark:text-emerald-300",
          dotClass: "bg-emerald-500"
        };
      default:
        return {
          bgClass: "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20",
          borderClass: "border-gray-200/50 dark:border-gray-800/50",
          textClass: "text-gray-700 dark:text-gray-300",
          dotClass: "bg-gray-500"
        };
    }
  };

  const aiToolStyling = getAiToolStyling();

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
      <DialogContent className="w-full h-full md:max-w-[80vw] md:h-[80vh] p-0 gap-0 m-0 md:m-auto md:rounded-lg rounded-none">
        <DialogHeader className="px-6 py-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-primary">
                Document Preview
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {previewDoc.name}
              </DialogDescription>
            </div>
            {aiToolUsed && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${aiToolStyling.bgClass} ${aiToolStyling.borderClass}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${aiToolStyling.dotClass}`}></div>
                <span className={`text-sm font-medium ${aiToolStyling.textClass}`}>
                  {aiToolUsed}
                </span>
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex md:flex-row flex-col h-[calc(95vh-120px)] md:h-[calc(80vh-120px)]">
          {/* PDF Viewer Side - Wider */}
          <div className="flex-[2] md:flex-[2] bg-slate-800 relative min-h-[50vh] md:min-h-0">
            {/* PDF Controls Bar */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-slate-700/95 backdrop-blur-sm px-2 md:px-4 py-2 md:py-3 flex items-center justify-between border-b border-slate-600/50">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1 md:gap-2 text-white/90">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 md:w-5 md:h-5">
                    <path d="14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  <span className="text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-none">
                    {previewDoc.name.replace(/\.[^/.]+$/, "")}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 bg-slate-600/50 rounded-lg px-2 md:px-4 py-1 md:py-2">
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors touch-manipulation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                    <polyline points="15,18 9,12 15,6"/>
                  </svg>
                </button>
                <span className="text-white text-xs md:text-sm font-medium px-1 md:px-2">1 / 2</span>
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors touch-manipulation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </button>
                <div className="w-px h-3 md:h-4 bg-white/20 mx-1 md:mx-2"></div>
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors touch-manipulation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="21 21l-4.35-4.35"/>
                    <line x1="9" x2="13" y1="11" y2="11"/>
                  </svg>
                </button>
                <span className="text-white/70 text-xs md:text-sm">52%</span>
                <button className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded transition-colors touch-manipulation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="21 21l-4.35-4.35"/>
                    <line x1="9" x2="9" y1="9" y2="13"/>
                    <line x1="13" x2="13" y1="9" y2="13"/>
                    <line x1="9" x2="13" y1="11" y2="11"/>
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2">
                <button className="text-white/70 hover:text-white p-1 md:p-2 hover:bg-white/10 rounded transition-colors touch-manipulation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                    <path d="21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" x2="12" y1="15" y2="3"/>
                  </svg>
                </button>
                <button className="text-white/70 hover:text-white p-1 md:p-2 hover:bg-white/10 rounded transition-colors touch-manipulation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="md:w-4 md:h-4">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* PDF Content - Full size */}
            <div className="h-full pt-12 md:pt-16 p-3 md:p-6">
              <div className="h-full bg-white rounded-lg shadow-2xl overflow-hidden">
                {renderDocument(previewDoc, "w-full h-full")}
              </div>
            </div>
          </div>
          
          {/* Output Panel Side - Bigger and Better */}
          <div className="flex-[1.2] md:flex-[1.2] bg-background md:border-l flex flex-col border-t md:border-t-0 min-h-[40vh] md:min-h-0">
            <ScrollArea className="flex-1 h-full">
              {(lastSavedPair?.output || analysisResult) ? (
                <div className="p-4 md:p-6 space-y-4 md:space-y-6 pb-8 md:pb-10" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="prose prose-sm max-w-none space-y-4 md:space-y-6">
                    {aiToolUsed === 'Translate & Localize' ? (
                      <>
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-4 md:p-5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50 mb-4 md:mb-6">
                          <h4 className="text-base font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            AI Translation & Localization Results
                          </h4>
                          {analysisResult ? (
                            <div className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
                              <div className="whitespace-pre-wrap font-sans">{(() => {
                                try {
                                  const parsed = JSON.parse(analysisResult);
                                  return parsed.output || analysisResult;
                                } catch {
                                  return analysisResult.replace(/^.*?"output":\s*"?|"?\s*\}?$/g, '');
                                }
                              })()}</div>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
                              Your document has been processed with AI-powered translation and localization technology. 
                              The content has been adapted for regional preferences and cultural context.
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 md:p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                          <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Processing Status
                          </h4>
                          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                            Translation completed successfully. The document content has been processed while preserving 
                            the original meaning, structure, and formatting.
                          </p>
                        </div>
                      </>
                    ) : aiToolUsed === 'Cross-Doc Linker' ? (
                      <>
                        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 p-4 md:p-5 rounded-xl border border-purple-200/50 dark:border-purple-800/50 mb-4 md:mb-6">
                          <h4 className="text-base font-semibold text-purple-900 dark:text-purple-100 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            Cross-Document Analysis Results
                          </h4>
                          {analysisResult ? (
                            <div className="text-sm leading-relaxed text-purple-800 dark:text-purple-200">
                              <div className="whitespace-pre-wrap font-sans">{(() => {
                                try {
                                  const parsed = JSON.parse(analysisResult);
                                  return parsed.output || analysisResult;
                                } catch {
                                  return analysisResult.replace(/^.*?"output":\s*"?|"?\s*\}?$/g, '');
                                }
                              })()}</div>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-purple-800 dark:text-purple-200">
                              AI has analyzed this document and identified connections with related content. 
                              Key relationships and supporting evidence have been mapped across your document collection.
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 md:p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                          <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Processing Status
                          </h4>
                          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                            Cross-document analysis completed successfully. Document connections and insights have been identified and linked.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 md:p-5 rounded-xl border border-blue-200/50 dark:border-blue-800/50 mb-4 md:mb-6">
                          <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            AI Summary Results
                          </h4>
                          {analysisResult ? (
                            <div className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                              <div className="whitespace-pre-wrap font-sans">{(() => {
                                try {
                                  const parsed = JSON.parse(analysisResult);
                                  return parsed.output || analysisResult;
                                } catch {
                                  return analysisResult.replace(/^.*?"output":\s*"?|"?\s*\}?$/g, '');
                                }
                              })()}</div>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                              This document has been processed with AI-powered summarization to extract key insights and important information.
                            </p>
                          )}
                        </div>
                        
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 p-4 md:p-5 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                          <h4 className="text-base font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            Processing Status
                          </h4>
                          <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
                            Document analysis completed successfully. Key content has been extracted and summarized for easy review.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full px-4 md:px-0 min-h-[300px]">
                  <div className="text-center p-6 md:p-8">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary w-6 h-6 md:w-8 md:h-8">
                        <path d="14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14,2 14,8 20,8"/>
                      </svg>
                    </div>
                    <h4 className="text-base md:text-lg font-semibold text-foreground mb-2">Document Preview</h4>
                    <p className="text-xs md:text-sm text-muted-foreground max-w-xs md:max-w-sm mx-auto leading-relaxed">
                      {!aiToolUsed 
                        ? "This document was uploaded directly. Use an AI tool to analyze and get insights about your document."
                        : "Process the document with an AI tool to see detailed analysis results here"
                      }
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
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