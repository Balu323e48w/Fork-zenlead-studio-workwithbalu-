import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Book,
  Download,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  AlertTriangle,
  X,
  RefreshCw,
  ArrowLeft,
  Eye,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/apiService";
import { format } from 'date-fns';

const StatefulBookGeneration: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // State management
  const [projectData, setProjectData] = useState<any>(null);
  const [bookContent, setBookContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Check if we're starting a new generation
  const isNewGeneration = location.state?.startGeneration;
  const formData = location.state?.formData;

  // Load project data and start appropriate flow
  useEffect(() => {
    if (projectId) {
      loadProjectState();
    }
  }, [projectId]);

  const loadProjectState = async () => {
    try {
      setLoading(true);
      
      // First check if this is a new generation
      if (isNewGeneration && formData) {
        setIsGenerating(true);
        setStatusMessage('Starting book generation...');
        setProgress(5);
        
        // Start the generation
        await startBookGeneration();
        return;
      }

      // Get current project status
      const statusResult = await apiService.getBookGenerationStatus(projectId!);
      
      if (statusResult.success) {
        const data = statusResult.data;
        setProjectData(data);
        
        if (data.status === 'processing') {
          setIsGenerating(true);
          setStatusMessage('Generation in progress...');
          startStatusPolling();
        } else if (data.status === 'completed') {
          setProgress(100);
          setStatusMessage('Book generation completed');
          loadCompletedBook();
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Generation failed');
        } else {
          setStatusMessage(`Project status: ${data.status}`);
        }
      } else {
        throw new Error(statusResult.message || 'Failed to load project');
      }
    } catch (err: any) {
      console.error('Error loading project state:', err);
      setError(err.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const startBookGeneration = async () => {
    try {
      // Call the streaming endpoint in the background
      // We'll rely on status polling to track progress
      fetch('/api/ai/long-form-book/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('zenlead_access_token')}`
        },
        body: JSON.stringify(formData)
      }).catch(err => {
        console.error('Generation request failed:', err);
        setError('Failed to start generation');
        setIsGenerating(false);
      });

      // Start polling for status updates
      startStatusPolling();
      
    } catch (err: any) {
      setError(err.message || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const startStatusPolling = useCallback(() => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await apiService.getBookGenerationStatus(projectId!);
        
        if (result.success) {
          const data = result.data;
          setProjectData(data);
          
          // Update progress based on status
          if (data.status === 'processing') {
            // Simulate progress based on time elapsed
            const elapsed = data.started_at ? 
              (Date.now() - new Date(data.started_at).getTime()) / 1000 : 0;
            const estimatedTotal = 20 * 60; // 20 minutes
            const calculatedProgress = Math.min(95, Math.floor((elapsed / estimatedTotal) * 100));
            setProgress(Math.max(progress, calculatedProgress));
            setStatusMessage('Generating your book... This may take 15-30 minutes.');
          } else if (data.status === 'completed') {
            setProgress(100);
            setStatusMessage('Book generation completed!');
            setIsGenerating(false);
            clearInterval(pollInterval);
            loadCompletedBook();
          } else if (data.status === 'failed') {
            setError(data.error_message || 'Generation failed');
            setIsGenerating(false);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Status polling error:', err);
        // Don't stop polling on individual errors
      }
    }, 5000); // Poll every 5 seconds

    // Cleanup function
    return () => clearInterval(pollInterval);
  }, [projectId, progress]);

  const loadCompletedBook = async () => {
    try {
      const result = await apiService.getStoredBook(projectId!);
      if (result.success) {
        setBookContent(result.data);
        toast({
          title: "Success",
          description: "Your book is ready!",
        });
      }
    } catch (err: any) {
      console.error('Error loading completed book:', err);
      // Don't set error here, just log it
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const result = await apiService.getBookPDF(projectId!);
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
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const handleCancel = async () => {
    try {
      const result = await apiService.cancelBookGeneration(projectId!);
      if (result.success) {
        setIsGenerating(false);
        setError('Generation cancelled by user');
        toast({
          title: "Cancelled",
          description: "Book generation has been cancelled",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to cancel generation",
        variant: "destructive"
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      const result = await apiService.duplicateBookSettings(projectId!);
      if (result.success) {
        navigate('/text-processing/long-form-book', {
          state: {
            templateSettings: result.data.settings,
            autoStart: false
          }
        });
        toast({
          title: "Settings Loaded",
          description: "Book settings loaded for duplication.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to duplicate book settings",
        variant: "destructive"
      });
    }
  };

  // Auto-refresh every 30 seconds when generating
  useEffect(() => {
    if (isGenerating) {
      const cleanup = startStatusPolling();
      return cleanup;
    }
  }, [isGenerating, startStatusPolling]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-4">
                <p><strong>Error:</strong> {error}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate('/text-processing')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Text Processing
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const bookTitle = bookContent?.book_metadata?.title || 
                   projectData?.book_data?.title || 
                   formData?.book_title || 
                   'Book Generation';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/text-processing')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{bookTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  Project ID: {projectId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {!isGenerating && bookContent && (
                <>
                  <Button onClick={handleDownloadPDF} size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" onClick={handleDuplicate} size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </>
              )}
              
              {isGenerating && (
                <Button variant="destructive" onClick={handleCancel} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              
              <Badge 
                variant={!isGenerating && bookContent ? "default" : isGenerating ? "secondary" : "outline"}
                className="text-xs"
              >
                {!isGenerating && bookContent ? "Completed" : isGenerating ? "Generating" : "Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Generation Progress */}
        {isGenerating && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Your Book
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">{statusMessage}</p>
              <Alert className="border-blue-200 bg-blue-50">
                <Clock className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  💡 <strong>Pro tip:</strong> You can safely refresh this page or close your browser. 
                  Your book generation will continue in the background!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Completed Book Content */}
        {!isGenerating && bookContent && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>📚 Your Book is Ready!</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{bookContent.book_metadata?.total_pages || 0}</div>
                    <div className="text-sm text-muted-foreground">Pages</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{bookContent.book_metadata?.total_words?.toLocaleString() || 0}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{bookContent.book_metadata?.total_chapters || 0}</div>
                    <div className="text-sm text-muted-foreground">Chapters</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{bookContent.book_metadata?.total_images || 0}</div>
                    <div className="text-sm text-muted-foreground">Images</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {bookContent.table_of_contents && (
              <Card>
                <CardHeader>
                  <CardTitle>Table of Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {bookContent.table_of_contents.map((chapter: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                          <span>Chapter {chapter.chapter_number}: {chapter.title}</span>
                          <Badge variant="outline" className="text-xs">Page {chapter.page}</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Project Info */}
        {projectData && (
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {projectData.status}
                </div>
                <div>
                  <strong>Credits Used:</strong> {projectData.credits_used}
                </div>
                <div>
                  <strong>Created:</strong> {format(new Date(projectData.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
                {projectData.completed_at && (
                  <div>
                    <strong>Completed:</strong> {format(new Date(projectData.completed_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state for new projects */}
        {!isGenerating && !bookContent && !error && (
          <Card>
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center">
                <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Project Ready</h3>
                <p className="text-sm text-muted-foreground">
                  This project is ready for generation.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StatefulBookGeneration;
