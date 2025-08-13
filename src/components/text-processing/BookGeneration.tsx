import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Book, Eye, Download } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";
import DynamicFormGenerator from "@/components/DynamicFormGenerator";
import StreamingBookGenerator from "@/components/StreamingBookGenerator";

const BookGeneration = () => {
  const { toast } = useToast();
  const [showStreamingModal, setShowStreamingModal] = useState(false);
  const [generationRequestData, setGenerationRequestData] = useState<any>(null);
  const [generatedBooks, setGeneratedBooks] = useState<Array<{ usageId: string; bookData: any; requestData: any }>>([]);
  const [viewingBook, setViewingBook] = useState<{ usageId: string; bookData: any } | null>(null);

  const handleGenerate = async (validatedData: any) => {
    setGenerationRequestData(validatedData);
    setShowStreamingModal(true);
  };

  const handleGenerationComplete = (usageId: string, bookData: any) => {
    setGeneratedBooks(prev => [
      { usageId, bookData, requestData: generationRequestData },
      ...prev
    ]);
    
    toast({
      title: "Success",
      description: "Book generated successfully! You can now view or download it.",
    });
  };

  const handleGenerationError = (error: string) => {
    toast({
      title: "Generation Failed",
      description: error,
      variant: "destructive"
    });
  };

  const downloadPDF = async (usageId: string, title: string) => {
    try {
      const response = await apiService.getBookPDF(usageId);
      
      if (response.success && response.data.pdf_base64) {
        const link = document.createElement('a');
        link.href = `data:application/pdf;base64,${response.data.pdf_base64}`;
        link.download = response.data.filename || `${title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Success",
          description: "PDF downloaded successfully!",
        });
      } else {
        throw new Error(response.message || 'Failed to get PDF');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download PDF",
        variant: "destructive"
      });
    }
  };

  const viewStoredBook = async (usageId: string) => {
    try {
      const response = await apiService.getStoredBook(usageId);
      
      if (response.success && response.data) {
        setViewingBook({ usageId, bookData: response.data });
      } else {
        throw new Error(response.message || 'Failed to get book data');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load book",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Form */}
      <DynamicFormGenerator
        modelSlug="long-form-book"
        onSubmit={handleGenerate}
        isLoading={false}
        submitButtonText="Generate Long-Form Book"
      />

      {/* Generated Books History */}
      {generatedBooks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-6 w-6" />
              Generated Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedBooks.map((book, index) => (
                <div key={book.usageId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {book.bookData?.book_metadata?.title || book.requestData?.concept || `Book ${index + 1}`}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {book.bookData?.book_metadata?.total_chapters} chapters • 
                      {book.bookData?.book_metadata?.total_words} words • 
                      Generated {new Date(book.bookData?.generation_info?.completed_at || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewStoredBook(book.usageId)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => downloadPDF(book.usageId, book.bookData?.book_metadata?.title || 'book')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streaming Generation Modal */}
      <Dialog open={showStreamingModal} onOpenChange={setShowStreamingModal}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Generating Your Book</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[80vh]">
            {generationRequestData && (
              <StreamingBookGenerator
                requestData={generationRequestData}
                onComplete={handleGenerationComplete}
                onError={handleGenerationError}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Book Viewer Modal */}
      <Dialog open={!!viewingBook} onOpenChange={() => setViewingBook(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{viewingBook?.bookData?.book_metadata?.title || 'Book Viewer'}</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => viewingBook && downloadPDF(
                    viewingBook.usageId, 
                    viewingBook.bookData?.book_metadata?.title || 'book'
                  )}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto max-h-[80vh]">
            {viewingBook?.bookData?.full_book_content && (
              <div className="space-y-6">
                {/* Book Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="font-bold text-lg">{viewingBook.bookData.book_metadata.total_chapters}</div>
                    <div className="text-sm text-muted-foreground">Chapters</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{viewingBook.bookData.book_metadata.total_words}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{viewingBook.bookData.book_metadata.total_images}</div>
                    <div className="text-sm text-muted-foreground">Images</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{viewingBook.bookData.book_metadata.total_pages}</div>
                    <div className="text-sm text-muted-foreground">Pages</div>
                  </div>
                </div>

                {/* PDF-like Display */}
                <div className="bg-white border rounded-lg shadow-inner p-8" style={{
                  fontFamily: 'Times, serif',
                  lineHeight: '1.6',
                  color: '#333'
                }}>
                  {/* Title Page */}
                  <div className="text-center py-16 border-b mb-8">
                    <h1 className="text-4xl font-bold mb-4">{viewingBook.bookData.book_metadata.title}</h1>
                    <p className="text-xl text-muted-foreground">by {viewingBook.bookData.book_metadata.author}</p>
                  </div>

                  {/* Table of Contents */}
                  {viewingBook.bookData.table_of_contents && (
                    <div className="mb-8 pb-8 border-b">
                      <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
                      <div className="space-y-2">
                        {viewingBook.bookData.table_of_contents.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span>{item.title}</span>
                            <span>{item.page}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chapters */}
                  {viewingBook.bookData.full_book_content.chapters?.map((chapter: any) => (
                    <div key={chapter.chapter_number} className="mb-8 pb-8 border-b">
                      <h2 className="text-2xl font-bold mb-4">{chapter.title}</h2>
                      <div className="prose prose-sm max-w-none">
                        {chapter.content.split('\n').map((paragraph: string, idx: number) => {
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

                      {/* Chapter Images */}
                      {chapter.images && chapter.images.length > 0 && (
                        <div className="space-y-4 mt-6">
                          {chapter.images.map((image: any, idx: number) => (
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookGeneration;
