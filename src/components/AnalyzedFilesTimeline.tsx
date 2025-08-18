import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Image, Brain, Calendar, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type AnalyzedFile = {
  id: string;
  file_name: string;
  file_path: string | null;
  analysis_type: string;
  analysis_result: string | null;
  created_at: string;
};

const getAnalysisIcon = (analysisType: string) => {
  switch (analysisType.toLowerCase()) {
    case 'document_analysis':
    case 'pdf_analysis':
      return <FileText className="h-4 w-4" />;
    case 'image_analysis':
      return <Image className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};

const getAnalysisTypeLabel = (analysisType: string) => {
  switch (analysisType.toLowerCase()) {
    case 'document_analysis':
      return 'Document Analysis';
    case 'pdf_analysis':
      return 'PDF Analysis';
    case 'image_analysis':
      return 'Image Analysis';
    default:
      return 'AI Analysis';
  }
};

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString();
};

export default function AnalyzedFilesTimeline() {
  const [analyzedFiles, setAnalyzedFiles] = useState<AnalyzedFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyzedFiles = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          return;
        }
        
        if (!session?.user) {
          console.log('No user session found');
          return;
        }

        const { data, error } = await supabase
          .from('analyzed_files')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching analyzed files:', error);
          toast({
            title: "Error loading files",
            description: error.message,
            variant: "destructive"
          });
          return;
        }

        setAnalyzedFiles(data || []);
      } catch (error: any) {
        console.error('Unexpected error:', error);
        toast({
          title: "Error loading files",
          description: error.message || "Something went wrong",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyzedFiles();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (analyzedFiles.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">No analyzed files yet.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Upload files to the dashboard and analyze them with AI tools to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recently Analyzed Files</h3>
        <Badge variant="secondary" className="text-xs">
          {analyzedFiles.length} file{analyzedFiles.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {analyzedFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                  {getAnalysisIcon(file.analysis_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">{file.file_name}</h4>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {getAnalysisTypeLabel(file.analysis_type)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatRelativeTime(file.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {file.analysis_result && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {file.analysis_result.length > 150 
                        ? `${file.analysis_result.substring(0, 150)}...`
                        : file.analysis_result
                      }
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}