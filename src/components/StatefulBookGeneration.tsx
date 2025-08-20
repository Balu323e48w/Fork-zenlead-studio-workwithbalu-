import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Book,
  Download,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  Clock,
  Loader2,
  CreditCard,
  AlertTriangle,
  X,
  RefreshCw,
  Pause,
  Play,
  ArrowLeft,
  Save,
  Eye,
  BookOpen
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/apiService";
import { format } from 'date-fns';

interface Chapter {
  chapter_number: number;
  title: string;
  content: string;
  word_count: number;
  images: Array<{
    caption: string;
    data: string;
    source: string;
  }>;
  completed: boolean;
  sections?: string[];
  formatted_content?: string;
}

interface BookMetadata {
  title: string;
  author: string;
  total_chapters: number;
  total_words: number;
  total_images: number;
  generation_time: string;
}

const StatefulBookGeneration: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // State management
  const [projectData, setProjectData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [bookMetadata, setBookMetadata] = useState<BookMetadata | null>(null);
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if we're starting a new generation from form data
  const isNewGeneration = location.state?.startGeneration;
  const formData = location.state?.formData;

  // Load project data and determine current state
  useEffect(() => {
    if (projectId) {
      loadProjectState();
    }
  }, [projectId]);

  const loadProjectState = async () => {
    try {
      setLoading(true);
      
      // Get project status
      const statusResult = await apiService.getBookGenerationStatus(projectId!);
      
      if (statusResult.success) {
        const status = statusResult.data.status;
        setProjectData(statusResult.data);
        
        if (status === 'processing') {
          // Resume streaming for processing projects
          setIsGenerating(true);
          startStreaming(true); // Resume mode
        } else if (status === 'completed') {
          // Load completed book data
          loadCompletedBook();
        } else if (status === 'pending' && isNewGeneration && formData) {
          // Start new generation
          startNewGeneration();
        } else {
          setError('Project not found or in invalid state');
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

  const startNewGeneration = async () => {
    if (!formData) {
      setError('No generation data provided');
      return;
    }

    try {
      setIsGenerating(true);
      setCurrentMessage('Starting book generation...');
      startStreaming(false); // New generation mode
    } catch (err: any) {
      setError(err.message || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const startStreaming = useCallback(async (resumeMode: boolean = false) => {
    try {
      const streamUrl = resumeMode 
        ? `/api/ai/long-form-book/${projectId}/stream-status`
        : `/api/ai/long-form-book/generate-stream`;

      const eventSource = new EventSource(streamUrl, {
        withCredentials: true
      });

      // If not resume mode, send the form data first
      if (!resumeMode && formData) {
        // Send POST request to start generation
        fetch('/api/ai/long-form-book/generate-stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify(formData)
        });
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleStreamEvent(data);
        } catch (e) {
          console.error('Error parsing stream data:', e);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsGenerating(false);
        
        if (!generationComplete) {
          setError('Connection lost. Refreshing...');
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      };

      // Auto-reconnect for processing projects
      const checkStatus = setInterval(async () => {
        if (projectData?.status === 'processing') {
          try {
            const statusCheck = await apiService.getBookGenerationStatus(projectId!);
            if (statusCheck.success && statusCheck.data.status !== 'processing') {
              clearInterval(checkStatus);
              eventSource.close();
              loadProjectState(); // Reload to get final state
            }
          } catch (e) {
            // Ignore status check errors
          }
        }
      }, 10000); // Check every 10 seconds

      return () => {
        eventSource.close();
        clearInterval(checkStatus);
      };

    } catch (err: any) {
      setError(err.message || 'Failed to start streaming');
      setIsGenerating(false);
    }
  }, [projectId, formData, projectData?.status, generationComplete]);

  const handleStreamEvent = (event: any) => {
    switch (event.type) {
      case 'start':
        setCurrentMessage(event.message || 'Starting generation...');
        setProgress(0);
        break;

      case 'credits_deducted':
        setCurrentMessage(event.message || 'Credits deducted successfully...');
        setProgress(5);
        break;

      case 'progress':
        setCurrentMessage(event.message || 'Processing...');
        if (event.progress) {
          setProgress(event.progress);
        }
        break;

      case 'structure':
        if (event.data) {
          setTableOfContents(event.data.table_of_contents || []);
          setBookMetadata(prev => ({
            ...prev,
            title: event.data.title || prev?.title || 'Untitled Book',
            total_chapters: event.data.total_chapters || prev?.total_chapters || 0
          } as BookMetadata));
          setCurrentMessage('Book structure created successfully');
        }
        break;

      case 'chapter_complete':
        if (event.chapter_number && event.title && event.full_content) {
          const newChapter: Chapter = {
            chapter_number: event.chapter_number,
            title: event.title,
            content: event.full_content,
            word_count: event.word_count || 0,
            images: event.images || [],
            completed: true,
            sections: event.sections || [],
            formatted_content: event.formatted_content || ''
          };

          setChapters(prev => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(ch => ch.chapter_number === event.chapter_number);
            if (existingIndex >= 0) {
              updated[existingIndex] = newChapter;
            } else {
              updated.push(newChapter);
            }
            return updated.sort((a, b) => a.chapter_number - b.chapter_number);
          });

          setCurrentMessage(`Chapter ${event.chapter_number} completed: ${event.title}`);
        }
        break;

      case 'image_added':
        setCurrentMessage(`Image added to Chapter ${event.chapter_number}: ${event.image?.caption || 'Image'}`);
        break;

      case 'complete':
        setCurrentMessage('Book generation completed!');
        setProgress(100);
        setGenerationComplete(true);
        setIsGenerating(false);
        
        if (event.book_data) {
          setBookMetadata(event.book_data.metadata || null);
          setTableOfContents(event.book_data.table_of_contents || []);
        }

        toast({
          title: "Success",
          description: "Book generated successfully!",
        });
        break;

      case 'stored':
        setCurrentMessage('Book stored successfully');
        toast({
          title: "Saved",
          description: "Book has been saved to your library",
        });
        break;

      case 'error':
        setError(event.message || 'An error occurred during generation');
        setIsGenerating(false);
        toast({
          title: "Error",
          description: event.message || "Generation failed",
          variant: "destructive"
        });
        break;

      default:
        if (event.message) {
          setCurrentMessage(event.message);
        }
        break;
    }
  };

  const loadCompletedBook = async () => {
    try {
      const result = await apiService.getStoredBook(projectId!);
      if (result.success) {
        const bookData = result.data;
        setBookMetadata(bookData.book_metadata || null);
        setTableOfContents(bookData.table_of_contents || []);
        
        // Load chapters if available
        if (bookData.full_book_content?.chapters) {
          setChapters(bookData.full_book_content.chapters);
        }
        
        setGenerationComplete(true);
        setProgress(100);
        setCurrentMessage('Book generation completed');
      }
    } catch (err: any) {
      console.error('Error loading completed book:', err);
      setError('Failed to load completed book');
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
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
                <h1 className="text-xl font-semibold">
                  {bookMetadata?.title || 'Book Generation'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Project ID: {projectId}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {generationComplete && (
                <Button onClick={handleDownloadPDF} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
              
              {isGenerating && (
                <Button variant="destructive" onClick={handleCancel} size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              
              <Badge 
                variant={generationComplete ? "default" : isGenerating ? "secondary" : "outline"}
                className="text-xs"
              >
                {generationComplete ? "Completed" : isGenerating ? "Generating" : "Ready"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Progress Panel */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Generation Progress
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

                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Current Status:</p>
                  <p>{currentMessage}</p>
                </div>

                {bookMetadata && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Book Details</h4>
                    <div className="space-y-1 text-sm">
                      <div>Title: {bookMetadata.title}</div>
                      <div>Author: {bookMetadata.author}</div>
                      {bookMetadata.total_chapters > 0 && (
                        <div>Chapters: {chapters.length}/{bookMetadata.total_chapters}</div>
                      )}
                      {bookMetadata.total_words > 0 && (
                        <div>Words: {bookMetadata.total_words.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t text-xs text-muted-foreground">
                  <p>💡 You can refresh this page anytime - your progress is saved!</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Table of Contents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {tableOfContents.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded hover:bg-muted/50">
                          <span className="font-medium">Chapter {item.chapter_number}: {item.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {chapters.find(ch => ch.chapter_number === parseInt(item.chapter_number)) ? "✅" : "⏳"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Generated Chapters */}
              {chapters.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Chapters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {chapters.map((chapter) => (
                          <div key={chapter.chapter_number} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">Chapter {chapter.chapter_number}: {chapter.title}</h3>
                              <Badge variant="default" className="text-xs">
                                {chapter.word_count} words
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {chapter.content.substring(0, 200)}...
                            </div>
                            {chapter.images.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />
                                {chapter.images.length} images
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Empty state */}
              {!isGenerating && chapters.length === 0 && !generationComplete && (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">Waiting to Start</h3>
                      <p className="text-sm text-muted-foreground">
                        Book generation will begin shortly...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatefulBookGeneration;
