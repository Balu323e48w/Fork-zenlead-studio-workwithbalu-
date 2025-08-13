import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";
import DynamicFormGenerator from "@/components/DynamicFormGenerator";

const BookGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBook, setGeneratedBook] = useState<any>(null);

  const handleGenerate = async (validatedData: any) => {
    setIsGenerating(true);
    try {
      console.log('📚 Generating long-form book with validated data:', validatedData);
      const response = await apiService.generateLongFormBook(validatedData);
      console.log('📖 Book generation response:', response);

      if (response.success && response.data) {
        setGeneratedBook(response.data);
        toast({
          title: "Success", 
          description: "Long-form book generated successfully!",
        });
      } else {
        throw new Error(response.message || 'Failed to generate book');
      }
    } catch (error: any) {
      console.error('❌ Book generation failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate book. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Form */}
      <DynamicFormGenerator
        modelSlug="long-form-book"
        onSubmit={handleGenerate}
        isLoading={isGenerating}
        submitButtonText="Generate Long-Form Book"
      />

      {/* Generated Book Results */}
      {generatedBook && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-6 w-6" />
              Generated Book
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {generatedBook.book_metadata?.title || 'AI Generated Book'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {generatedBook.generation_summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                  <div className="text-center">
                    <div className="font-bold text-lg">{generatedBook.generation_summary.total_chapters}</div>
                    <div className="text-sm text-muted-foreground">Chapters</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{generatedBook.generation_summary.total_words}</div>
                    <div className="text-sm text-muted-foreground">Words</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{generatedBook.generation_summary.total_images}</div>
                    <div className="text-sm text-muted-foreground">Images</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{generatedBook.generation_summary.generation_time}</div>
                    <div className="text-sm text-muted-foreground">Generation</div>
                  </div>
                </div>
              )}

              {generatedBook.table_of_contents && (
                <div>
                  <h3 className="font-semibold mb-2">Table of Contents</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {generatedBook.table_of_contents.map((item: any, index: number) => (
                      <div key={index} className="text-sm py-1 px-2 hover:bg-muted rounded">
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedBook.chapters && generatedBook.chapters.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Chapters Preview</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedBook.chapters.slice(0, 3).map((chapter: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Chapter {chapter.chapter_number}: {chapter.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{chapter.word_count} words</p>
                        <p className="text-sm">{chapter.content}</p>
                      </div>
                    ))}
                    {generatedBook.chapters.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {generatedBook.chapters.length - 3} more chapters...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookGeneration;
