import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Book,
  Download,
  RefreshCw,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Copy,
  Play,
  Pause,
  FileText,
  Image,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/apiService";
import { format } from 'date-fns';

interface BookProjectData {
  usage_id: string;
  project_type: string;
  project_name: string;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  credits_used: number;
  error_message?: string;
  book_data: {
    title: string;
    concept: string;
    genre: string;
    settings: any;
  };
  navigation: {
    can_duplicate: boolean;
    can_cancel: boolean;
    can_download_pdf: boolean;
    can_view_chapters: boolean;
  };
  status_data: any;
}

const LongFormBookProject: React.FC = () => {
  const { usageId } = useParams<{ usageId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projectData, setProjectData] = useState<BookProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookContent, setBookContent] = useState<any>(null);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    if (usageId) {
      fetchProjectData();
    }
  }, [usageId]);

  // Auto-refresh for processing projects
  useEffect(() => {
    if (projectData?.status === 'processing') {
      const interval = setInterval(() => {
        fetchProjectData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [projectData?.status]);

  const fetchProjectData = async () => {
    try {
      if (!usageId) return;

      const result = await apiService.getBookProjectView(usageId);
      if (result.success) {
        setProjectData(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch project data');
      }
    } catch (error: any) {
      console.error('Error fetching project data:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load project data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookContent = async () => {
    try {
      if (!usageId) return;

      setContentLoading(true);
      const result = await apiService.getStoredBook(usageId);
      if (result.success) {
        setBookContent(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch book content');
      }
    } catch (error: any) {
      console.error('Error fetching book content:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load book content",
        variant: "destructive"
      });
    } finally {
      setContentLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      if (!usageId) return;

      const result = await apiService.getBookPDF(usageId);
      if (result.success && result.data.pdf_base64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${result.data.pdf_base64}`;
        link.download = result.data.filename || 'book.pdf';
        link.click();

        toast({
          title: "Downloaded",
          description: "PDF downloaded successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      if (!usageId) return;

      const result = await apiService.duplicateBookSettings(usageId);
      if (result.success) {
        navigate('/text-processing', {
          state: {
            activeModel: 'long-form-book',
            templateSettings: result.data.settings,
            autoStart: false
          }
        });
        toast({
          title: "Settings Loaded",
          description: "Book settings loaded for duplication.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to duplicate book settings",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async () => {
    try {
      if (!usageId) return;

      const result = await apiService.cancelBookGeneration(usageId);
      if (result.success) {
        toast({
          title: "Cancelled",
          description: "Book generation has been cancelled",
        });
        fetchProjectData(); // Refresh to show updated status
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to cancel generation",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <Pause className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Project not found or you don't have permission to view it.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{projectData.book_data.title}</h1>
              <p className="text-muted-foreground">
                {projectData.book_data.genre} • {projectData.project_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusIcon(projectData.status)}
            <Badge className={getStatusColor(projectData.status)}>
              {projectData.status}
            </Badge>
          </div>
        </div>

        {/* Status-specific alerts */}
        {projectData.status === 'processing' && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Your book is being generated. This usually takes 15-30 minutes. 
              You can leave this page and come back later.
            </AlertDescription>
          </Alert>
        )}

        {projectData.status === 'failed' && projectData.error_message && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Generation failed:</strong> {projectData.error_message}
            </AlertDescription>
          </Alert>
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Project Info */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Book Concept</h4>
                  <p className="text-sm text-muted-foreground">
                    {projectData.book_data.concept}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Credits Used:</span>
                    <span className="font-medium">{projectData.credits_used}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Created:</span>
                    <span>{format(new Date(projectData.created_at), 'MMM dd, yyyy')}</span>
                  </div>
                  {projectData.started_at && (
                    <div className="flex justify-between text-sm">
                      <span>Started:</span>
                      <span>{format(new Date(projectData.started_at), 'HH:mm')}</span>
                    </div>
                  )}
                  {projectData.completed_at && (
                    <div className="flex justify-between text-sm">
                      <span>Completed:</span>
                      <span>{format(new Date(projectData.completed_at), 'HH:mm')}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Action buttons */}
                <div className="space-y-2">
                  {projectData.navigation.can_download_pdf && (
                    <Button
                      onClick={handleDownloadPDF}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                  
                  {projectData.navigation.can_view_chapters && (
                    <Button
                      onClick={fetchBookContent}
                      variant="outline"
                      className="w-full"
                      size="sm"
                      disabled={contentLoading}
                    >
                      {contentLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      View Content
                    </Button>
                  )}

                  {projectData.navigation.can_duplicate && (
                    <Button
                      onClick={handleDuplicate}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Book
                    </Button>
                  )}

                  {projectData.navigation.can_cancel && (
                    <Button
                      onClick={handleCancel}
                      variant="destructive"
                      className="w-full"
                      size="sm"
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Cancel Generation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            {bookContent ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Book Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {/* Book metadata */}
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Pages:</span> {bookContent.book_metadata?.total_pages || 0}
                          </div>
                          <div>
                            <span className="font-medium">Words:</span> {bookContent.book_metadata?.total_words?.toLocaleString() || 0}
                          </div>
                          <div>
                            <span className="font-medium">Chapters:</span> {bookContent.book_metadata?.total_chapters || 0}
                          </div>
                          <div>
                            <span className="font-medium">Images:</span> {bookContent.book_metadata?.total_images || 0}
                          </div>
                        </div>
                      </div>

                      {/* Table of contents */}
                      {bookContent.table_of_contents && (
                        <div>
                          <h4 className="font-medium mb-2">Table of Contents</h4>
                          <div className="space-y-1">
                            {bookContent.table_of_contents.map((chapter: any, index: number) => (
                              <div key={index} className="flex justify-between text-sm py-1 border-b border-muted">
                                <span>Chapter {chapter.chapter_number}: {chapter.title}</span>
                                <span className="text-muted-foreground">Page {chapter.page}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">
                      {projectData.status === 'completed' ? 'View Book Content' : 'Content Not Ready'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {projectData.status === 'completed'
                        ? 'Click "View Content" to see your generated book'
                        : 'Book content will be available once generation is complete'}
                    </p>
                    {projectData.navigation.can_view_chapters && (
                      <Button
                        onClick={fetchBookContent}
                        size="sm"
                        disabled={contentLoading}
                      >
                        {contentLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Eye className="h-4 w-4 mr-2" />
                        )}
                        View Content
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongFormBookProject;
