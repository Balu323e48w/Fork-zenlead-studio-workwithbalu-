import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Book, Sparkles, FileText, Image, Users } from "lucide-react";

const BookGeneration = () => {
  const [bookIdea, setBookIdea] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [customLength, setCustomLength] = useState("");
  const [includeImages, setIncludeImages] = useState(false);

  const examplePrompts = [
    "A comprehensive guide to sustainable living in the modern world",
    "Complete beginner's handbook for cryptocurrency investing",
    "Children's adventure story about space exploration",
    "Business strategy playbook for startup founders",
    "Self-help guide for building confidence and leadership skills"
  ];

  const genres = [
    "Non-Fiction", "Fiction", "Educational", "Business", "Self-Help", 
    "Children's", "Biography", "Health & Wellness", "Technology", "History"
  ];

  const audiences = [
    { id: "general", label: "General Audience", desc: "Accessible to everyone" },
    { id: "professional", label: "Professionals", desc: "Industry experts and practitioners" },
    { id: "students", label: "Students", desc: "Academic and learning focused" },
    { id: "children", label: "Children", desc: "Age-appropriate content" },
    { id: "seniors", label: "Seniors", desc: "Mature audience perspective" }
  ];

  const bookLengths = [
    { id: "short", label: "Short Book", pages: "50-100 pages", desc: "Quick read, focused topic" },
    { id: "medium", label: "Standard Book", pages: "150-250 pages", desc: "Comprehensive coverage" },
    { id: "long", label: "Extended Book", pages: "300-400 pages", desc: "Deep, detailed exploration" },
    { id: "epic", label: "Epic Book", pages: "500+ pages", desc: "Exhaustive, authoritative guide" }
  ];

  const contentFeatures = [
    { id: "toc", label: "Table of Contents", included: true },
    { id: "chapters", label: "Chapter Structure", included: true },
    { id: "images", label: "Illustrations & Images", included: includeImages },
    { id: "bibliography", label: "Bibliography", included: true },
    { id: "index", label: "Index", included: false },
    { id: "appendix", label: "Appendix", included: false }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Book className="h-8 w-8" />
          Book Generation
        </h1>
        <p className="text-muted-foreground">Create comprehensive books with AI-powered writing assistance</p>
      </div>

      {/* Book Concept */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            What book do you want to write?
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your book concept, theme, or main idea
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: A comprehensive guide to sustainable living in the modern world..."
            value={bookIdea}
            onChange={(e) => setBookIdea(e.target.value)}
            className="min-h-24"
          />
          
          <div className="space-y-3">
            <p className="text-sm font-medium">Try these examples:</p>
            <div className="grid grid-cols-1 gap-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setBookIdea(prompt)}
                  className="text-left h-auto p-3 whitespace-normal justify-start"
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Genre & Audience Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Genre</CardTitle>
            <p className="text-sm text-muted-foreground">Choose your book category</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {genres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGenre(genre)}
                  className="h-auto p-2"
                >
                  {genre}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Target Audience
            </CardTitle>
            <p className="text-sm text-muted-foreground">Who will read your book?</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {audiences.map((audience) => (
                <Card
                  key={audience.id}
                  className={`cursor-pointer transition-all p-3 ${
                    selectedAudience === audience.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'hover:shadow-sm'
                  }`}
                  onClick={() => setSelectedAudience(audience.id)}
                >
                  <div>
                    <h4 className="font-medium text-sm">{audience.label}</h4>
                    <p className="text-xs text-muted-foreground">{audience.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Book Length */}
      <Card>
        <CardHeader>
          <CardTitle>Book Length</CardTitle>
          <p className="text-sm text-muted-foreground">Choose the scope and depth of your book</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bookLengths.map((length) => (
              <Card
                key={length.id}
                className={`cursor-pointer transition-all ${
                  selectedLength === length.id 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedLength(length.id)}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <h3 className="font-semibold text-sm">{length.label}</h3>
                  <p className="text-sm text-primary">{length.pages}</p>
                  <p className="text-xs text-muted-foreground">{length.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium">Custom Length</h3>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                placeholder="Pages"
                value={customLength}
                onChange={(e) => setCustomLength(e.target.value)}
                className="w-32"
                min="10"
                max="1000"
              />
              <span className="text-sm text-muted-foreground">Pages (10-1000)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Content Features
          </CardTitle>
          <p className="text-sm text-muted-foreground">Customize what to include in your book</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentFeatures.map((feature) => (
              <div key={feature.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="text-sm font-medium">{feature.label}</span>
                <Badge variant={feature.included ? "default" : "secondary"}>
                  {feature.included ? "Included" : "Optional"}
                </Badge>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center gap-3">
            <Button
              variant={includeImages ? "default" : "outline"}
              onClick={() => setIncludeImages(!includeImages)}
              className="flex items-center gap-2"
            >
              <Image className="h-4 w-4" />
              Include AI-Generated Images
            </Button>
            <p className="text-sm text-muted-foreground">
              Add relevant illustrations and diagrams
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Writing Style */}
      <Card>
        <CardHeader>
          <CardTitle>Writing Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Perspective" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first-person">First Person</SelectItem>
                <SelectItem value="second-person">Second Person</SelectItem>
                <SelectItem value="third-person">Third Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-center">
        <Button size="lg" className="px-8">
          <Book className="mr-2 h-5 w-5" />
          Generate Book
        </Button>
      </div>
    </div>
  );
};

export default BookGeneration;
