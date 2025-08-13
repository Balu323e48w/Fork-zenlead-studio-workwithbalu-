import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Book, 
  Download, 
  Eye, 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock,
  Loader2
} from "lucide-react";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";

interface StreamEvent {
  type: string;
  message?: string;
  progress?: number;
  data?: any;
  chapter_number?: number;
  error?: string;
  book_data?: any;
  usage_id?: string;
}

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
}

interface BookMetadata {
  title: string;
  author: string;
  total_chapters: number;
  total_words: number;
  total_images: number;
  generation_time: string;
}

interface StreamingBookGeneratorProps {
  requestData: any;
  onComplete?: (usageId: string, bookData: any) => void;
  onError?: (error: string) => void;
}

const StreamingBookGenerator: React.FC<StreamingBookGeneratorProps> = ({
  requestData,
  onComplete,
  onError
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [bookMetadata, setBookMetadata] = useState<BookMetadata | null>(null);
  const [tableOfContents, setTableOfContents] = useState<any[]>([]);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [usageId, setUsageId] = useState<string>('');
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const parseStreamChunk = useCallback((chunk: string): StreamEvent | null => {
    try {
      const trimmed = chunk.trim();
      if (!trimmed) return null;
      return JSON.parse(trimmed);
    } catch (error) {
      console.warn('Failed to parse chunk:', chunk);
      return null;
    }
  }, []);

  const processStreamEvent = useCallback((event: StreamEvent) => {
    console.log('📡 Stream event:', event);

    switch (event.type) {
      case 'start':
        setCurrentMessage(event.message || 'Starting generation...');
        setProgress(0);
        if (event.data?.book_title) {
          setBookMetadata(prev => prev ? { ...prev, title: event.data.book_title } : null);
        }
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
            title: event.data.title || '',
            author: prev?.author || '',
            total_chapters: prev?.total_chapters || 0,
            total_words: prev?.total_words || 0,
            total_images: prev?.total_images || 0,
            generation_time: prev?.generation_time || ''
          }));
        }
        break;

      case 'chapter_complete':
        if (event.chapter_number && event.title) {
          setChapters(prev => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(ch => ch.chapter_number === event.chapter_number);
            
            const newChapter: Chapter = {
              chapter_number: event.chapter_number!,
              title: event.title || '',
              content: event.content_preview || '',
              word_count: event.word_count || 0,
              images: [],
              completed: true
            };

            if (existingIndex >= 0) {
              updated[existingIndex] = { ...updated[existingIndex], ...newChapter };
            } else {
              updated.push(newChapter);
            }

            return updated.sort((a, b) => a.chapter_number - b.chapter_number);
          });
        }
        break;

      case 'image_added':
        if (event.chapter_number && event.image) {
          setChapters(prev => {
            const updated = [...prev];
            const chapterIndex = updated.findIndex(ch => ch.chapter_number === event.chapter_number);
            
            if (chapterIndex >= 0) {
              updated[chapterIndex].images.push(event.image);
            }

            return updated;
          });
        }
        break;

      case 'complete':
        setCurrentMessage('Book generation completed!');
        setProgress(100);
        setGenerationComplete(true);
        
        if (event.book_data) {
          // Update final metadata
          if (event.book_data.metadata) {
            setBookMetadata(event.book_data.metadata);
          }
          
          // Store PDF
          if (event.book_data.pdf_base64) {
            setPdfBase64(event.book_data.pdf_base64);
          }

          // Update table of contents
          if (event.book_data.table_of_contents) {
            setTableOfContents(event.book_data.table_of_contents);
          }
        }
        break;

      case 'stored':
        if (event.usage_id) {
          setUsageId(event.usage_id);
          toast({
            title: "Success",
            description: "Book generated and stored successfully!",
          });
          
          if (onComplete && event.usage_id) {
            onComplete(event.usage_id, event.book_data || {});
          }
        }
        break;

      case 'error':
        console.error('❌ Stream error:', event.error);
        setCurrentMessage(`Error: ${event.message || event.error || 'Unknown error'}`);
        toast({
          title: "Error",
          description: event.message || event.error || 'Failed to generate book',
          variant: "destructive"
        });
        
        if (onError) {
          onError(event.message || event.error || 'Unknown error');
        }
        
        setIsGenerating(false);
        break;
    }
  }, [toast, onComplete, onError]);

  const startGeneration = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setProgress(0);
    setCurrentMessage('Initializing...');
    setChapters([]);
    setBookMetadata(null);
    setTableOfContents([]);
    setGenerationComplete(false);
    setPdfBase64('');

    try {
      abortControllerRef.current = new AbortController();
      
      console.log('🚀 Starting streaming book generation...');
      const stream = await apiService.generateLongFormBookStream(requestData);
      
      readerRef.current = stream.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await readerRef.current.read();
        
        if (done) {
          console.log('✅ Stream completed');
          break;
        }

        // Decode and buffer the chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines (NDJSON format)
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const event = parseStreamChunk(line);
          if (event) {
            processStreamEvent(event);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const event = parseStreamChunk(buffer);
        if (event) {
          processStreamEvent(event);
        }
      }

    } catch (error: any) {
      console.error('❌ Streaming error:', error);
      setCurrentMessage(`Error: ${error.message}`);
      toast({
        title: "Error",
        description: error.message || 'Failed to generate book',
        variant: "destructive"
      });
      
      if (onError) {
        onError(error.message);
      }
    } finally {
      setIsGenerating(false);
      readerRef.current = null;
    }
  }, [isGenerating, requestData, parseStreamChunk, processStreamEvent, toast, onError]);

  const stopGeneration = useCallback(() => {
    if (readerRef.current) {
      readerRef.current.cancel();
      readerRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsGenerating(false);
    setCurrentMessage('Generation stopped');
  }, []);

  const downloadPDF = useCallback(() => {
    if (!pdfBase64) {
      toast({
        title: "Error",
        description: "PDF not available yet",
        variant: "destructive"
      });
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = `${bookMetadata?.title || 'book'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "PDF downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive"
      });
    }
  }, [pdfBase64, bookMetadata, toast]);

  useEffect(() => {
    startGeneration();
    
    return () => {
      stopGeneration();
    };
  }, [startGeneration]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Book className="h-6 w-6" />
              <CardTitle>
                {bookMetadata?.title || 'Generating Book...'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {isGenerating && (
                <Button variant="outline" size="sm" onClick={stopGeneration}>
                  Stop Generation
                </Button>
              )}
              {generationComplete && pdfBase64 && (
                <Button size="sm" onClick={downloadPDF}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : generationComplete ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span className="text-sm text-muted-foreground">{currentMessage}</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Progress: {progress}%</span>
              {bookMetadata && (
                <>
                  <span>•</span>
                  <span>Chapters: {chapters.length}/{bookMetadata.total_chapters}</span>
                  <span>•</span>
                  <span>Words: {bookMetadata.total_words}</span>
                  <span>•</span>
                  <span>Images: {bookMetadata.total_images}</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PDF-like Book Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents Sidebar */}
        {tableOfContents.length > 0 && (
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Table of Contents</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {tableOfContents.map((item, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">Page {item.page}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Main Content - PDF-like Display */}
        <Card className={`${tableOfContents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Book Content
              <Badge variant={generationComplete ? "default" : "secondary"}>
                {chapters.filter(ch => ch.completed).length} / {bookMetadata?.total_chapters || 0} Chapters
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-8 p-4 bg-white border rounded-lg shadow-inner min-h-[500px]" style={{
                fontFamily: 'Times, serif',
                lineHeight: '1.6',
                color: '#333'
              }}>
                {/* Title Page */}
                {bookMetadata && (
                  <div className="text-center py-16 border-b">
                    <h1 className="text-4xl font-bold mb-4">{bookMetadata.title}</h1>
                    <p className="text-xl text-muted-foreground">by {bookMetadata.author}</p>
                    <div className="mt-8 text-sm text-muted-foreground">
                      {bookMetadata.total_chapters} Chapters • {bookMetadata.total_words} Words
                    </div>
                  </div>
                )}

                {/* Chapters */}
                {chapters.map((chapter) => (
                  <div key={chapter.chapter_number} className="space-y-4 pb-8 border-b">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{chapter.title}</h2>
                      {chapter.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                    
                    {chapter.content && (
                      <div className="prose prose-sm max-w-none">
                        {chapter.content.split('\n').map((paragraph, idx) => {
                          if (paragraph.trim().startsWith('##')) {
                            return (
                              <h3 key={idx} className="text-lg font-semibold mt-6 mb-3">
                                {paragraph.replace('##', '').trim()}
                              </h3>
                            );
                          } else if (paragraph.trim()) {
                            return (
                              <p key={idx} className="mb-4">
                                {paragraph.trim()}
                              </p>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )}

                    {/* Chapter Images */}
                    {chapter.images.length > 0 && (
                      <div className="space-y-4">
                        {chapter.images.map((image, idx) => (
                          <div key={idx} className="text-center">
                            <img 
                              src={image.data} 
                              alt={image.caption}
                              className="max-w-full h-auto mx-auto rounded-lg shadow-sm"
                              style={{ maxHeight: '300px' }}
                            />
                            <p className="text-sm text-muted-foreground mt-2 italic">
                              {image.caption}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span>{chapter.word_count} words</span>
                      {chapter.images.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <ImageIcon className="h-3 w-3" />
                            {chapter.images.length} images
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Generation Status */}
                {isGenerating && chapters.length === 0 && (
                  <div className="text-center py-16 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p>Generating your book...</p>
                    <p className="text-sm mt-2">{currentMessage}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StreamingBookGenerator;
