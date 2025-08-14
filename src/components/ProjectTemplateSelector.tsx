import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Book, 
  Briefcase, 
  GraduationCap, 
  Heart,
  Clock,
  CreditCard,
  FileText,
  Image as ImageIcon,
  Users,
  Star,
  Plus
} from "lucide-react";
import { ProjectTemplateManager, ProjectTemplate, ProjectSettings, ProjectUtils } from "@/lib/projectManagement";

interface ProjectTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (settings: ProjectSettings) => void;
  onCreateFromScratch: () => void;
}

const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  onCreateFromScratch
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates = ProjectTemplateManager.getDefaultTemplates();
  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'technical':
        return <FileText className="h-4 w-4" />;
      case 'business':
        return <Briefcase className="h-4 w-4" />;
      case 'education':
        return <GraduationCap className="h-4 w-4" />;
      case 'self-help':
        return <Heart className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  const handleSelectTemplate = async (template: ProjectTemplate) => {
    try {
      const settings = await ProjectUtils.createFromTemplate(template.id, {
        concept: '', // User will fill this in
        author_name: 'AI Generated'
      });
      
      onSelectTemplate(settings);
      onClose();
    } catch (error) {
      console.error('Failed to create from template:', error);
    }
  };

  const TemplateCard: React.FC<{ template: ProjectTemplate }> = ({ template }) => {
    const estimatedTime = ProjectUtils.estimateGenerationTime(template.settings);
    const estimatedCredits = ProjectUtils.estimateCreditsRequired(template.settings);

    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
            onClick={() => setSelectedTemplate(template)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            {getCategoryIcon(template.category)}
            {template.name}
            {template.is_public && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {template.description}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Book className="h-3 w-3" />
                {template.settings.chapters_count} chapters
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {template.settings.target_audience}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                ~{estimatedTime} min
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                {estimatedCredits} credits
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {template.settings.include_images && (
                <Badge variant="outline" className="text-xs">
                  <ImageIcon className="h-2 w-2 mr-1" />
                  Images
                </Badge>
              )}
              {template.settings.include_toc && (
                <Badge variant="outline" className="text-xs">
                  TOC
                </Badge>
              )}
              {template.settings.include_bibliography && (
                <Badge variant="outline" className="text-xs">
                  Bibliography
                </Badge>
              )}
            </div>

            <Button 
              size="sm" 
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectTemplate(template);
              }}
            >
              Use This Template
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TemplateDetails: React.FC<{ template: ProjectTemplate }> = ({ template }) => {
    const estimatedTime = ProjectUtils.estimateGenerationTime(template.settings);
    const estimatedCredits = ProjectUtils.estimateCreditsRequired(template.settings);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
          <p className="text-muted-foreground">{template.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Book Structure</h4>
            <div className="text-sm space-y-1">
              <div>Chapters: {template.settings.chapters_count}</div>
              <div>Sections per Chapter: {template.settings.sections_per_chapter}</div>
              <div>Pages per Section: {template.settings.pages_per_section}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Style & Audience</h4>
            <div className="text-sm space-y-1">
              <div>Genre: {template.settings.genre}</div>
              <div>Tone: {template.settings.tone}</div>
              <div>Complexity: {template.settings.complexity}</div>
              <div>Audience: {template.settings.target_audience}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Features Included</h4>
          <div className="flex flex-wrap gap-2">
            {template.settings.include_toc && (
              <Badge variant="secondary">Table of Contents</Badge>
            )}
            {template.settings.include_images && (
              <Badge variant="secondary">AI-Generated Images</Badge>
            )}
            {template.settings.include_bibliography && (
              <Badge variant="secondary">Bibliography</Badge>
            )}
            {template.settings.include_index && (
              <Badge variant="secondary">Index</Badge>
            )}
            {template.settings.include_cover && (
              <Badge variant="secondary">Cover Design</Badge>
            )}
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-muted/30">
          <h4 className="font-medium mb-2">Generation Estimates</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>~{estimatedTime} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span>{estimatedCredits} credits required</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={() => handleSelectTemplate(template)}
            className="flex-1"
          >
            Use This Template
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setSelectedTemplate(null)}
          >
            Back to Templates
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {selectedTemplate ? 'Template Details' : 'Choose a Template'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh]">
          {selectedTemplate ? (
            <TemplateDetails template={selectedTemplate} />
          ) : (
            <div className="space-y-6">
              {/* Quick Start Option */}
              <Card className="border-2 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Start from Scratch</h3>
                      <p className="text-muted-foreground">
                        Create a completely custom book with your own settings
                      </p>
                    </div>
                    <Button onClick={onCreateFromScratch} variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Custom Book
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Category Tabs */}
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Technical">Technical</TabsTrigger>
                  <TabsTrigger value="Business">Business</TabsTrigger>
                  <TabsTrigger value="Education">Education</TabsTrigger>
                  <TabsTrigger value="Self-Help">Self-Help</TabsTrigger>
                </TabsList>
                
                <TabsContent value={selectedCategory} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <TemplateCard key={template.id} template={template} />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                  <p className="text-muted-foreground">
                    No templates available in the {selectedCategory} category.
                  </p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectTemplateSelector;
