import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { PDFGenerator } from "@/lib/pdfGenerator";
import { BookContentRenderer } from "@/components/BookContentRenderer";
import { apiService } from "@/lib/apiService";
import { tokenManager } from "@/lib/token";

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

const ProjectBookGenerator: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management - exactly like EnhancedStreamingBookGenerator
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [bookMetadata, setBookMetadata] = useState<BookMetadata | null>(null);
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string>('');
  const [requestData, setRequestData] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<any>(null);
  const startTime = useRef<number>(Date.now());

  // Load project state and determine what to do
  useEffect(() => {
    if (projectId) {
      loadProjectState();
    }
  }, [projectId]);

  const loadProjectState = async () => {
    try {
      setLoading(true);
      
      // Get current project status
      const statusResult = await apiService.getBookGenerationStatus(projectId!);
      
      if (statusResult.success) {
        const data = statusResult.data;
        setProjectData(data);
        
        // Extract request data for display
        setRequestData(data.input_data || {});
        
        if (data.status === 'processing') {
          setIsGenerating(true);
          setCurrentMessage('Generation in progress...');
          startStatusPollingAndStreaming();
        } else if (data.status === 'completed') {
          setProgress(100);
          setGenerationComplete(true);
          setCurrentMessage('Book generation completed');
          loadCompletedBook();
        } else if (data.status === 'failed') {
          setError(data.error_message || 'Generation failed');
        } else if (data.status === 'pending') {
          setCurrentMessage('Project is pending. Starting generation...');
          startNewGeneration();
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
    try {
      setIsGenerating(true);
      setCurrentMessage('Starting book generation...');
      
      // Start streaming generation
      const token = tokenManager.getToken();
      
      const response = await fetch('/api/ai/long-form-book/generate-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`);
      }

      if (response.body) {
        startStreamingResponse(response);
      }
      
    } catch (err: any) {
      setError(err.message || 'Failed to start generation');
      setIsGenerating(false);
    }
  };

  const startStreamingResponse = async (response: Response) => {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            try {
              const data = line.substring(5).trim();
              if (data) {
                const eventData = JSON.parse(data);
                processStreamEvent(eventData);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Streaming error:', err);
    } finally {
      reader.releaseLock();
    }
  };

  const startStatusPollingAndStreaming = () => {
    // For processing projects, poll status and try to load existing content
    const pollStatus = async () => {
      try {
        const result = await apiService.getBookGenerationStatus(projectId!);
        
        if (result.success) {
          const data = result.data;
          
          if (data.status === 'completed') {
            setIsGenerating(false);
            setGenerationComplete(true);
            setProgress(100);
            loadCompletedBook();
            return; // Stop polling
          } else if (data.status === 'failed') {
            setIsGenerating(false);
            setError(data.error_message || 'Generation failed');
            return; // Stop polling
          } else if (data.status === 'processing') {
            // Simulate progress based on time
            const elapsed = data.started_at ? 
              (Date.now() - new Date(data.started_at).getTime()) / 1000 : 0;
            const estimatedTotal = 20 * 60; // 20 minutes
            const calculatedProgress = Math.min(95, Math.floor((elapsed / estimatedTotal) * 100));
            setProgress(Math.max(progress, calculatedProgress));
            
            // Continue polling
            setTimeout(pollStatus, 5000);
          }
        }
      } catch (err) {
        console.error('Status polling error:', err);
        // Continue polling on error
        setTimeout(pollStatus, 10000);
      }
    };

    pollStatus();
  };

  const processStreamEvent = (event: any) => {
    switch (event.type) {
      case 'start':
        setCurrentMessage(event.message || 'Starting generation...');
        setProgress(0);
        startTime.current = Date.now();
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

      case 'error':
        setError(event.message || 'An error occurred during generation');
        setIsGenerating(false);
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
          const loadedChapters = bookData.full_book_content.chapters.map((ch: any) => ({
            chapter_number: ch.chapter_number,
            title: ch.title,
            content: ch.full_content || ch.content,
            word_count: ch.word_count || 0,
            images: ch.images || [],
            completed: true,
            sections: ch.sections || [],
            formatted_content: ch.formatted_content || ''
          }));
          setChapters(loadedChapters);
        }
      }
    } catch (err: any) {
      console.error('Error loading completed book:', err);
    }
  };

  // Update estimated time remaining
  useEffect(() => {
    if (isGenerating && !generationComplete) {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime.current;
        const elapsedMinutes = elapsed / (1000 * 60);
        const estimatedTotal = 25; // 25 minutes average
        const remaining = Math.max(0, estimatedTotal - elapsedMinutes);
        
        if (remaining > 1) {
          setEstimatedTimeRemaining(`~${Math.round(remaining)} min`);
        } else {
          setEstimatedTimeRemaining('Almost done');
        }
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isGenerating, generationComplete]);

  const exportToPDF = async () => {
    if (!bookMetadata || chapters.length === 0) {
      toast({
        title: "Error",
        description: "No book content available for export",
        variant: "destructive"
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Try backend PDF first
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
      } else {
        throw new Error('Backend PDF not available');
      }
    } catch (error) {
      // Fallback to local PDF generation
      try {
        const pdfGenerator = new PDFGenerator();
        const bookData = {
          metadata: bookMetadata,
          chapters,
          tableOfContents,
          settings: requestData
        };
        await pdfGenerator.downloadPDF(bookData, `${bookMetadata.title}.pdf`);
        
        toast({
          title: "Downloaded",
          description: "PDF exported successfully!",
        });
      } catch (pdfError: any) {
        toast({
          title: "Error",
          description: "Failed to export PDF",
          variant: "destructive"
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  const stopGeneration = async () => {
    try {
      await apiService.cancelBookGeneration(projectId!);
      setIsGenerating(false);
      setCurrentMessage('Generation cancelled');
      toast({
        title: "Cancelled",
        description: "Book generation has been cancelled",
      });
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
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <Alert className="max-w-md border-red-200 bg-red-50">
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
                  Back
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Controls - Exact same as EnhancedStreamingBookGenerator */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate('/text-processing')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            <span className="font-medium">
              {bookMetadata?.title || requestData?.book_title || 'Generating Book...'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isGenerating && (
            <Button variant="outline" size="sm" onClick={stopGeneration}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          )}
          {(generationComplete || chapters.length > 0) && (
            <Button
              size="sm"
              onClick={exportToPDF}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export PDF
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Exact same as EnhancedStreamingBookGenerator */}
        <div className="w-80 border-r bg-muted/30 flex flex-col">
          {/* Progress Section */}
          <Card className="m-4 mb-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : generationComplete ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                Generation Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={progress} className="h-2" />
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span>{progress}%</span>
                </div>
                {estimatedTimeRemaining && (
                  <div className="flex justify-between">
                    <span>Time remaining:</span>
                    <span>{estimatedTimeRemaining}</span>
                  </div>
                )}
                <div className="text-muted-foreground">{currentMessage}</div>
              </div>
            </CardContent>
          </Card>

          {/* Book Info */}
          {bookMetadata && (
            <Card className="mx-4 mb-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Book Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div><strong>Title:</strong> {bookMetadata.title}</div>
                <div><strong>Author:</strong> {bookMetadata.author}</div>
                <div><strong>Chapters:</strong> {chapters.length}/{bookMetadata.total_chapters}</div>
                <div><strong>Words:</strong> {bookMetadata.total_words?.toLocaleString()}</div>
                <div><strong>Images:</strong> {bookMetadata.total_images}</div>
              </CardContent>
            </Card>
          )}

          {/* Settings Summary */}
          {requestData && (
            <Card className="mx-4 mb-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div><strong>Genre:</strong> {requestData.genre?.replace('-', ' ')}</div>
                <div><strong>Length:</strong> {requestData.book_length?.replace('-', ' ')}</div>
                <div><strong>Tone:</strong> {requestData.tone}</div>
                <div><strong>Audience:</strong> {requestData.target_audience?.replace('-', ' ')}</div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <div className="font-medium">Features:</div>
                  {requestData.include_toc && <div>✓ Table of Contents</div>}
                  {requestData.include_images && <div>✓ Images</div>}
                  {requestData.include_bibliography && <div>✓ Bibliography</div>}
                  {requestData.include_cover && <div>✓ Cover Design</div>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table of Contents */}
          {tableOfContents.length > 0 && (
            <Card className="mx-4 mb-4 flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Table of Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-1">
                    {tableOfContents.map((item, index) => (
                      <div key={index} className="text-xs p-2 rounded hover:bg-muted">
                        <div className="font-medium truncate">{item.title}</div>
                        <div className="text-muted-foreground">Page {item.page}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side - Book Content Display - Exact same as EnhancedStreamingBookGenerator */}
        <div className="flex-1 bg-gray-50 overflow-hidden">
          <ScrollArea className="h-full p-6">
            <div className="max-w-4xl mx-auto">
              {/* Book Display Container */}
              <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="p-8" style={{
                  fontFamily: 'Times, serif',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#000'
                }}>
                  {/* Title Page */}
                  {bookMetadata && (
                    <div className="text-center py-12 border-b mb-8">
                      <h1 className="text-4xl font-bold mb-6">{bookMetadata.title}</h1>
                      <p className="text-xl text-gray-600 mb-4">by {bookMetadata.author}</p>
                      <div className="text-sm text-gray-500">
                        Generated with AI • {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  {/* Loading State */}
                  {isGenerating && chapters.length === 0 && (
                    <div className="text-center py-20">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Generating your book...</p>
                      <p className="text-sm text-gray-400 mt-2">{currentMessage}</p>
                      {estimatedTimeRemaining && (
                        <p className="text-sm text-gray-400 mt-1">Est. {estimatedTimeRemaining} remaining</p>
                      )}
                    </div>
                  )}

                  {/* Comprehensive Chapters Display */}
                  {chapters.map((chapter, idx) => (
                    <div key={chapter.chapter_number} className="mb-16">
                      <BookContentRenderer
                        content={chapter.content}
                        images={chapter.images}
                        title={chapter.title}
                        chapterNumber={chapter.chapter_number}
                        wordCount={chapter.word_count}
                      />

                      {/* Chapter Status Indicator */}
                      <div className="flex items-center justify-between mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {chapter.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                          )}
                          <span className="text-sm font-medium">
                            {chapter.completed ? 'Chapter Complete' : 'Generating...'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {chapter.word_count} words
                          </div>
                          {chapter.images.length > 0 && (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="h-4 w-4" />
                              {chapter.images.length} images
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Project Info */}
                  {!isGenerating && chapters.length === 0 && !generationComplete && (
                    <div className="text-center py-20">
                      <Book className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Project ready for generation</p>
                      <p className="text-sm text-gray-400 mt-2">ID: {projectId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default ProjectBookGenerator;
