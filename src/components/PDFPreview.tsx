import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface PDFPreviewProps {
  url: string;
  fileName: string;
  className?: string;
}

export default function PDFPreview({ url, fileName, className = "" }: PDFPreviewProps) {
  const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
  
  return (
    <div className={`relative ${className}`}>
      <iframe
        src={googleViewerUrl}
        className="w-full h-full border-0"
        title={`Preview of ${fileName}`}
        onError={() => {
          // Fallback if Google viewer fails
          console.error("Google viewer failed for:", fileName);
        }}
      />
      {/* Fallback content that shows if iframe fails to load */}
      <noscript>
        <div className="flex items-center justify-center h-full bg-muted">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">PDF preview requires JavaScript</p>
            <Button variant="outline" size="sm" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open PDF in new tab
              </a>
            </Button>
          </div>
        </div>
      </noscript>
    </div>
  );
}