import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Eye, Download, ArrowLeft } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";
import DynamicFormGenerator from "@/components/DynamicFormGenerator";
import StreamingBookGenerator from "@/components/StreamingBookGenerator";

const BookGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationRequestData, setGenerationRequestData] = useState<any>(null);
  const [generatedBooks, setGeneratedBooks] = useState<Array<{ usageId: string; bookData: any; requestData: any }>>([]);

  const handleGenerate = async (validatedData: any) => {
    setGenerationRequestData(validatedData);
    setIsGenerating(true);
  };

  const handleGenerationComplete = (usageId: string, bookData: any) => {
    setGeneratedBooks(prev => [
      { usageId, bookData, requestData: generationRequestData },
      ...prev
    ]);
    
    setIsGenerating(false);
    
    toast({
      title: "Success",
      description: "Book generated successfully! You can download the PDF or view it anytime.",
    });
  };

  const handleGenerationError = (error: string) => {
    setIsGenerating(false);
    toast({
      title: "Generation Failed", 
      description: error,
      variant: "destructive"
    });
  };

  const handleCancelGeneration = () => {
    setIsGenerating(false);
    setGenerationRequestData(null);
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

  // If generating, show split layout
  if (isGenerating && generationRequestData) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancelGeneration}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <div className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              <span className="font-medium">Long-Form Book Generation</span>
            </div>
          </div>
        </div>

        {/* Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Settings Summary (25% width) */}
          <div className="w-1/4 border-r bg-muted/30 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Book Settings</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Concept:</span>
                    <p className="font-medium">{generationRequestData.concept?.substring(0, 100)}...</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Genre:</span>
                    <p className="font-medium capitalize">{generationRequestData.genre?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Length:</span>
                    <p className="font-medium capitalize">{generationRequestData.book_length?.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Chapters:</span>
                    <p className="font-medium">{generationRequestData.chapters_count}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Author:</span>
                    <p className="font-medium">{generationRequestData.author_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tone:</span>
                    <p className="font-medium capitalize">{generationRequestData.tone}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Features:</span>
                    <div className="space-y-1">
                      {generationRequestData.include_toc && <p className="text-xs">✓ Table of Contents</p>}
                      {generationRequestData.include_images && <p className="text-xs">✓ Images</p>}
                      {generationRequestData.include_bibliography && <p className="text-xs">✓ Bibliography</p>}
                      {generationRequestData.include_cover && <p className="text-xs">✓ Cover Design</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - PDF Viewer (75% width) */}
          <div className="flex-1 overflow-hidden">
            <StreamingBookGenerator
              requestData={generationRequestData}
              onComplete={handleGenerationComplete}
              onError={handleGenerationError}
              onCancel={handleCancelGeneration}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default view - form and history
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
                      {book.bookData?.book_metadata?.title || book.requestData?.concept?.substring(0, 50) || `Book ${index + 1}`}
                    </h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {book.bookData?.book_metadata?.total_chapters} chapters • 
                      {book.bookData?.book_metadata?.total_words} words • 
                      Generated {new Date(book.bookData?.generation_info?.completed_at || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
    </div>
  );
};

export default BookGeneration;
