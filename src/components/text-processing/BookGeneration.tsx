import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Book, Sparkles, FileText, Users, Settings, Clock, CreditCard } from "lucide-react";
import { apiService } from "@/lib/apiService";
import { useToast } from "@/hooks/use-toast";

// Backend enums matching your models
const BookGenre = {
  NON_FICTION: "non-fiction",
  FICTION: "fiction", 
  EDUCATIONAL: "educational",
  BUSINESS: "business",
  SELF_HELP: "self-help",
  CHILDREN: "children",
  BIOGRAPHY: "biography",
  HEALTH: "health",
  TECHNOLOGY: "technology",
  HISTORY: "history"
} as const;

const BookLength = {
  SHORT: "short",
  STANDARD: "standard", 
  EXTENDED: "extended",
  EPIC: "epic"
} as const;

const WritingTone = {
  PROFESSIONAL: "professional",
  CONVERSATIONAL: "conversational",
  ACADEMIC: "academic",
  FRIENDLY: "friendly",
  FORMAL: "formal",
  PERSUASIVE: "persuasive"
} as const;

const ComplexityLevel = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced"
} as const;

const WritingPerspective = {
  FIRST_PERSON: "first-person",
  SECOND_PERSON: "second-person", 
  THIRD_PERSON: "third-person"
} as const;

const TargetAudience = {
  GENERAL: "general",
  PROFESSIONALS: "professionals",
  STUDENTS: "students",
  CHILDREN: "children",
  SENIORS: "seniors",
  BEGINNERS: "beginners",
  ADVANCED_USERS: "advanced-users"
} as const;

interface LongFormBookRequest {
  concept: string;
  genre: string;
  target_audience: string;
  book_length: string;
  tone: string;
  complexity: string;
  perspective: string;
  chapters_count: number;
  sections_per_chapter: number;
  pages_per_section: number;
  include_toc: boolean;
  include_images: boolean;
  include_bibliography: boolean;
  include_index: boolean;
  include_cover: boolean;
  author_name: string;
  book_title?: string;
}

const BookGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBook, setGeneratedBook] = useState<any>(null);
  
  // Form state matching backend model
  const [formData, setFormData] = useState<LongFormBookRequest>({
    concept: "",
    genre: BookGenre.NON_FICTION,
    target_audience: TargetAudience.GENERAL,
    book_length: BookLength.STANDARD,
    tone: WritingTone.ACADEMIC,
    complexity: ComplexityLevel.INTERMEDIATE,
    perspective: WritingPerspective.THIRD_PERSON,
    chapters_count: 10,
    sections_per_chapter: 6,
    pages_per_section: 3,
    include_toc: true,
    include_images: true,
    include_bibliography: true,
    include_index: false,
    include_cover: true,
    author_name: "AI Generated",
    book_title: ""
  });

  const examplePrompts = [
    "Complete understanding handbook of Indian Agriculture Overview",
    "A comprehensive guide to sustainable living in the modern world",
    "Complete beginner's handbook for cryptocurrency investing",
    "Business strategy playbook for startup founders",
    "Self-help guide for building confidence and leadership skills"
  ];

  const genreOptions = [
    { value: BookGenre.NON_FICTION, label: "Non-Fiction", desc: "Factual, informative content" },
    { value: BookGenre.FICTION, label: "Fiction", desc: "Creative storytelling" },
    { value: BookGenre.EDUCATIONAL, label: "Educational", desc: "Learning-focused content" },
    { value: BookGenre.BUSINESS, label: "Business", desc: "Professional insights" },
    { value: BookGenre.SELF_HELP, label: "Self Help", desc: "Personal development" },
    { value: BookGenre.CHILDREN, label: "Children", desc: "Age-appropriate stories" },
    { value: BookGenre.BIOGRAPHY, label: "Biography", desc: "Life stories" },
    { value: BookGenre.HEALTH, label: "Health", desc: "Wellness and medical" },
    { value: BookGenre.TECHNOLOGY, label: "Technology", desc: "Tech and innovation" },
    { value: BookGenre.HISTORY, label: "History", desc: "Historical content" }
  ];

  const audienceOptions = [
    { value: TargetAudience.GENERAL, label: "General Public", desc: "Accessible to everyone" },
    { value: TargetAudience.PROFESSIONALS, label: "Professionals", desc: "Industry experts" },
    { value: TargetAudience.STUDENTS, label: "Students", desc: "Academic focused" },
    { value: TargetAudience.CHILDREN, label: "Children", desc: "Age-appropriate" },
    { value: TargetAudience.SENIORS, label: "Seniors", desc: "Mature perspective" },
    { value: TargetAudience.BEGINNERS, label: "Beginners", desc: "New to the topic" },
    { value: TargetAudience.ADVANCED_USERS, label: "Advanced Users", desc: "Expert level" }
  ];

  const lengthOptions = [
    { value: BookLength.SHORT, label: "Short (50-100 pages)", desc: "Quick focused read" },
    { value: BookLength.STANDARD, label: "Standard (150-250 pages)", desc: "Comprehensive coverage" },
    { value: BookLength.EXTENDED, label: "Extended (300-400 pages)", desc: "Deep exploration" },
    { value: BookLength.EPIC, label: "Epic (500+ pages)", desc: "Exhaustive guide" }
  ];

  const toneOptions = [
    { value: WritingTone.PROFESSIONAL, label: "Professional" },
    { value: WritingTone.CONVERSATIONAL, label: "Conversational" },
    { value: WritingTone.ACADEMIC, label: "Academic" },
    { value: WritingTone.FRIENDLY, label: "Friendly" },
    { value: WritingTone.FORMAL, label: "Formal" },
    { value: WritingTone.PERSUASIVE, label: "Persuasive" }
  ];

  const complexityOptions = [
    { value: ComplexityLevel.BEGINNER, label: "Beginner" },
    { value: ComplexityLevel.INTERMEDIATE, label: "Intermediate" },
    { value: ComplexityLevel.ADVANCED, label: "Advanced" }
  ];

  const perspectiveOptions = [
    { value: WritingPerspective.FIRST_PERSON, label: "First Person" },
    { value: WritingPerspective.SECOND_PERSON, label: "Second Person" },
    { value: WritingPerspective.THIRD_PERSON, label: "Third Person" }
  ];

  const handleGenerate = async () => {
    if (!formData.concept.trim()) {
      toast({
        title: "Error",
        description: "Please enter a book concept",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Prepare data for API - remove empty book_title if not provided
      const requestData = {
        ...formData,
        ...(formData.book_title?.trim() ? { book_title: formData.book_title.trim() } : {})
      };

      console.log('📚 Generating long-form book with data:', requestData);
      const response = await apiService.generateLongFormBook(requestData);
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

  const updateFormData = (field: keyof LongFormBookRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Book className="h-8 w-8" />
          Long-Form Book Generation
        </h1>
        <p className="text-muted-foreground">Create comprehensive books with advanced AI</p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            50 Credits
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            15-30 minutes
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe what book you want to write
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="concept">Book Concept *</Label>
            <Textarea
              id="concept"
              placeholder="e.g., Complete understanding handbook of Indian Agriculture Overview"
              value={formData.concept}
              onChange={(e) => updateFormData('concept', e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Book Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Leave blank for auto-generation"
              value={formData.book_title}
              onChange={(e) => updateFormData('book_title', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author Name</Label>
            <Input
              id="author"
              value={formData.author_name}
              onChange={(e) => updateFormData('author_name', e.target.value)}
            />
          </div>
          
          <div className="space-y-3">
            <p className="text-sm font-medium">Example concepts:</p>
            <div className="grid grid-cols-1 gap-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => updateFormData('concept', prompt)}
                  className="text-left h-auto p-3 whitespace-normal justify-start"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Properties */}
      <Card>
        <CardHeader>
          <CardTitle>Book Properties</CardTitle>
          <p className="text-sm text-muted-foreground">Define your book's characteristics</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Book Genre</Label>
              <Select value={formData.genre} onValueChange={(value) => updateFormData('genre', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {genreOptions.map((genre) => (
                    <SelectItem key={genre.value} value={genre.value}>
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select value={formData.target_audience} onValueChange={(value) => updateFormData('target_audience', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {audienceOptions.map((audience) => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Book Length</Label>
              <Select value={formData.book_length} onValueChange={(value) => updateFormData('book_length', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {lengthOptions.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing Style */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Style</CardTitle>
          <p className="text-sm text-muted-foreground">Customize writing approach</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Writing Tone</Label>
              <Select value={formData.tone} onValueChange={(value) => updateFormData('tone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Complexity Level</Label>
              <Select value={formData.complexity} onValueChange={(value) => updateFormData('complexity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complexityOptions.map((complexity) => (
                    <SelectItem key={complexity.value} value={complexity.value}>
                      {complexity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Writing Perspective</Label>
              <Select value={formData.perspective} onValueChange={(value) => updateFormData('perspective', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {perspectiveOptions.map((perspective) => (
                    <SelectItem key={perspective.value} value={perspective.value}>
                      {perspective.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Book Structure
          </CardTitle>
          <p className="text-sm text-muted-foreground">Customize book structure</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="chapters">Number of Chapters ({formData.chapters_count})</Label>
              <input
                id="chapters"
                type="range"
                min="5"
                max="20"
                step="1"
                value={formData.chapters_count}
                onChange={(e) => updateFormData('chapters_count', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5</span>
                <span>20</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sections">Sections per Chapter ({formData.sections_per_chapter})</Label>
              <input
                id="sections"
                type="range"
                min="3"
                max="10"
                step="1"
                value={formData.sections_per_chapter}
                onChange={(e) => updateFormData('sections_per_chapter', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>3</span>
                <span>10</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">Pages per Section ({formData.pages_per_section})</Label>
              <input
                id="pages"
                type="range"
                min="1"
                max="8"
                step="1"
                value={formData.pages_per_section}
                onChange={(e) => updateFormData('pages_per_section', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Additional Features
          </CardTitle>
          <p className="text-sm text-muted-foreground">Select what to include in your book</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="toc">Table of Contents</Label>
                  <p className="text-xs text-muted-foreground">Add a comprehensive table of contents</p>
                </div>
                <Switch
                  id="toc"
                  checked={formData.include_toc}
                  onCheckedChange={(checked) => updateFormData('include_toc', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="images">Include Images</Label>
                  <p className="text-xs text-muted-foreground">Add relevant images throughout the book</p>
                </div>
                <Switch
                  id="images"
                  checked={formData.include_images}
                  onCheckedChange={(checked) => updateFormData('include_images', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bibliography">Bibliography</Label>
                  <p className="text-xs text-muted-foreground">Add bibliography and references</p>
                </div>
                <Switch
                  id="bibliography"
                  checked={formData.include_bibliography}
                  onCheckedChange={(checked) => updateFormData('include_bibliography', checked)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="index">Index</Label>
                  <p className="text-xs text-muted-foreground">Add an index at the end</p>
                </div>
                <Switch
                  id="index"
                  checked={formData.include_index}
                  onCheckedChange={(checked) => updateFormData('include_index', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cover">Cover Design Info</Label>
                  <p className="text-xs text-muted-foreground">Generate cover design information</p>
                </div>
                <Switch
                  id="cover"
                  checked={formData.include_cover}
                  onCheckedChange={(checked) => updateFormData('include_cover', checked)}
                />
              </div>
            </div>
          </div>

          {formData.include_images && (
            <>
              <Separator className="my-4" />
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Image Generation</h4>
                <p className="text-sm text-muted-foreground">
                  Images will be automatically generated and included based on the content. 
                  Image search is handled by the server using configured credentials.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="px-8"
          onClick={handleGenerate}
          disabled={isGenerating || !formData.concept.trim()}
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Book...
            </>
          ) : (
            <>
              <Book className="mr-2 h-5 w-5" />
              Generate Long-Form Book
            </>
          )}
        </Button>
      </div>

      {/* Generated Book Results */}
      {generatedBook && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Book</CardTitle>
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
