import { BookApiService } from './bookApi';

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  settings: any;
  preview_image?: string;
  created_by: string;
  is_public: boolean;
  usage_count: number;
  created_at: string;
}

export interface ProjectSettings {
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

export class ProjectTemplateManager {
  
  static readonly DEFAULT_TEMPLATES: ProjectTemplate[] = [
    {
      id: 'technical-guide',
      name: 'Technical Guide Template',
      description: 'Perfect for creating comprehensive technical documentation and guides',
      category: 'Technical',
      settings: {
        genre: 'educational',
        target_audience: 'professionals',
        book_length: 'standard',
        tone: 'professional',
        complexity: 'intermediate',
        perspective: 'second-person',
        chapters_count: 12,
        sections_per_chapter: 5,
        pages_per_section: 4,
        include_toc: true,
        include_images: true,
        include_bibliography: true,
        include_index: true,
        include_cover: true
      },
      preview_image: '',
      created_by: 'system',
      is_public: true,
      usage_count: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 'business-guide',
      name: 'Business Guide Template',
      description: 'Ideal for business books, strategies, and professional development content',
      category: 'Business',
      settings: {
        genre: 'business',
        target_audience: 'professionals',
        book_length: 'standard',
        tone: 'professional',
        complexity: 'intermediate',
        perspective: 'third-person',
        chapters_count: 10,
        sections_per_chapter: 6,
        pages_per_section: 3,
        include_toc: true,
        include_images: true,
        include_bibliography: true,
        include_index: false,
        include_cover: true
      },
      preview_image: '',
      created_by: 'system',
      is_public: true,
      usage_count: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 'educational-textbook',
      name: 'Educational Textbook Template',
      description: 'Structured for academic content, courses, and educational materials',
      category: 'Education',
      settings: {
        genre: 'educational',
        target_audience: 'students',
        book_length: 'extended',
        tone: 'academic',
        complexity: 'advanced',
        perspective: 'third-person',
        chapters_count: 15,
        sections_per_chapter: 7,
        pages_per_section: 5,
        include_toc: true,
        include_images: true,
        include_bibliography: true,
        include_index: true,
        include_cover: true
      },
      preview_image: '',
      created_by: 'system',
      is_public: true,
      usage_count: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 'self-help-guide',
      name: 'Self-Help Guide Template',
      description: 'Perfect for personal development, wellness, and motivational content',
      category: 'Self-Help',
      settings: {
        genre: 'self-help',
        target_audience: 'general',
        book_length: 'standard',
        tone: 'friendly',
        complexity: 'beginner',
        perspective: 'second-person',
        chapters_count: 8,
        sections_per_chapter: 4,
        pages_per_section: 3,
        include_toc: true,
        include_images: true,
        include_bibliography: false,
        include_index: false,
        include_cover: true
      },
      preview_image: '',
      created_by: 'system',
      is_public: true,
      usage_count: 0,
      created_at: new Date().toISOString()
    }
  ];

  static getDefaultTemplates(): ProjectTemplate[] {
    return this.DEFAULT_TEMPLATES;
  }

  static getTemplateByCategory(category: string): ProjectTemplate[] {
    return this.DEFAULT_TEMPLATES.filter(template => template.category === category);
  }

  static getTemplateById(id: string): ProjectTemplate | undefined {
    return this.DEFAULT_TEMPLATES.find(template => template.id === id);
  }

  static async saveAsTemplate(
    usageId: string, 
    templateName: string, 
    description: string,
    category: string = 'Custom'
  ): Promise<ProjectTemplate> {
    try {
      // This would call your backend to save the template
      // const template = await BookApiService.saveAsTemplate(usageId, {
      //   name: templateName,
      //   description,
      //   category
      // });

      // For now, create a mock template
      const template: ProjectTemplate = {
        id: `custom_${Date.now()}`,
        name: templateName,
        description,
        category,
        settings: {}, // Would get actual settings from the book project
        created_by: 'user',
        is_public: false,
        usage_count: 0,
        created_at: new Date().toISOString()
      };

      return template;
    } catch (error) {
      throw new Error(`Failed to save template: ${error}`);
    }
  }
}

export class ProjectDuplicator {
  
  static async duplicateProject(
    originalUsageId: string,
    modifications?: Partial<ProjectSettings>
  ): Promise<string> {
    try {
      // This would call your backend duplicate endpoint
      // const result = await BookApiService.duplicateProject(originalUsageId, modifications);
      
      // For now, return a mock new usage ID
      const newUsageId = `dup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`📋 Project duplicated: ${originalUsageId} -> ${newUsageId}`);
      return newUsageId;
    } catch (error) {
      throw new Error(`Failed to duplicate project: ${error}`);
    }
  }

  static async createFromTemplate(
    templateId: string,
    customSettings: Partial<ProjectSettings>
  ): Promise<ProjectSettings> {
    const template = ProjectTemplateManager.getTemplateById(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Merge template settings with custom settings
    const finalSettings: ProjectSettings = {
      ...template.settings,
      ...customSettings,
      // Ensure required fields have defaults
      concept: customSettings.concept || 'Generated from template',
      author_name: customSettings.author_name || 'AI Generated'
    };

    return finalSettings;
  }
}

export class ProjectAnalytics {
  
  static calculateProjectStats(bookData: any): any {
    if (!bookData) return {};

    const metadata = bookData.book_metadata || {};
    const chapters = bookData.chapters || [];
    
    return {
      total_words: metadata.total_words || 0,
      total_images: metadata.total_images || 0,
      total_chapters: metadata.total_chapters || chapters.length,
      total_pages: metadata.total_pages || 0,
      reading_time: metadata.estimated_reading_time || 0,
      generation_time: metadata.generation_time || 0,
      words_per_chapter: chapters.length > 0 ? 
        Math.round((metadata.total_words || 0) / chapters.length) : 0,
      images_per_chapter: chapters.length > 0 ? 
        Math.round((metadata.total_images || 0) / chapters.length) : 0,
      complexity_score: this.calculateComplexityScore(bookData),
      quality_score: this.calculateQualityScore(bookData)
    };
  }

  private static calculateComplexityScore(bookData: any): number {
    // Simple algorithm to calculate content complexity
    const metadata = bookData.book_metadata || {};
    const averageWordsPerChapter = metadata.total_words / (metadata.total_chapters || 1);
    
    let score = 0;
    
    // Word count factor
    if (averageWordsPerChapter > 3000) score += 3;
    else if (averageWordsPerChapter > 2000) score += 2;
    else score += 1;
    
    // Chapter count factor
    if (metadata.total_chapters > 15) score += 3;
    else if (metadata.total_chapters > 10) score += 2;
    else score += 1;
    
    // Images factor
    if (metadata.total_images > 20) score += 2;
    else if (metadata.total_images > 10) score += 1;
    
    return Math.min(Math.round((score / 8) * 10), 10); // Scale to 1-10
  }

  private static calculateQualityScore(bookData: any): number {
    // Simple algorithm to estimate content quality
    const metadata = bookData.book_metadata || {};
    const chapters = bookData.chapters || [];
    
    let score = 5; // Base score
    
    // Consistency check
    const avgChapterLength = chapters.reduce((sum: number, ch: any) => 
      sum + (ch.word_count || 0), 0) / chapters.length;
    
    const consistency = chapters.reduce((consistency: number, ch: any) => {
      const deviation = Math.abs((ch.word_count || 0) - avgChapterLength) / avgChapterLength;
      return consistency + (deviation < 0.3 ? 1 : 0);
    }, 0) / chapters.length;
    
    score += consistency * 2; // Add up to 2 points for consistency
    
    // Image integration
    if (metadata.total_images > 0) {
      score += 1;
    }
    
    // Bibliography and TOC
    if (bookData.bibliography && bookData.bibliography.length > 0) score += 0.5;
    if (bookData.table_of_contents && bookData.table_of_contents.length > 0) score += 0.5;
    
    return Math.min(Math.round(score), 10);
  }

  static generateProjectReport(projectData: any): string {
    const stats = this.calculateProjectStats(projectData);
    
    return `
📊 Project Analysis Report

📈 Content Statistics:
• Total Words: ${stats.total_words?.toLocaleString() || 0}
• Chapters: ${stats.total_chapters || 0}
• Images: ${stats.total_images || 0}
• Estimated Reading Time: ${stats.reading_time || 0} minutes

⚡ Performance Metrics:
• Generation Time: ${stats.generation_time || 0} seconds
• Words per Chapter: ${stats.words_per_chapter || 0}
• Images per Chapter: ${stats.images_per_chapter || 0}

🎯 Quality Indicators:
• Complexity Score: ${stats.complexity_score || 0}/10
• Quality Score: ${stats.quality_score || 0}/10

📝 Recommendations:
${this.generateRecommendations(stats)}
    `.trim();
  }

  private static generateRecommendations(stats: any): string {
    const recommendations = [];

    if (stats.words_per_chapter < 1500) {
      recommendations.push("• Consider expanding chapters for more detailed content");
    }

    if (stats.images_per_chapter < 1) {
      recommendations.push("• Add more images to improve visual appeal");
    }

    if (stats.quality_score < 7) {
      recommendations.push("• Review content for consistency and completeness");
    }

    if (stats.complexity_score < 5) {
      recommendations.push("• Consider adding more detailed examples and explanations");
    }

    return recommendations.length > 0 ? 
      recommendations.join('\n') : 
      "• Excellent work! Your book meets high quality standards.";
  }
}

// Export utility functions for common project management tasks
export const ProjectUtils = {
  generateUniqueSlug: (title: string): string => {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
  },

  validateProjectSettings: (settings: Partial<ProjectSettings>): string[] => {
    const errors = [];

    if (!settings.concept || settings.concept.trim().length < 10) {
      errors.push("Concept must be at least 10 characters long");
    }

    if (settings.chapters_count && (settings.chapters_count < 3 || settings.chapters_count > 25)) {
      errors.push("Chapters count must be between 3 and 25");
    }

    if (settings.sections_per_chapter && (settings.sections_per_chapter < 2 || settings.sections_per_chapter > 10)) {
      errors.push("Sections per chapter must be between 2 and 10");
    }

    return errors;
  },

  estimateGenerationTime: (settings: ProjectSettings): number {
    const baseTime = 300; // 5 minutes base
    const chapterTime = (settings.chapters_count || 10) * 120; // 2 minutes per chapter
    const imageTime = settings.include_images ? (settings.chapters_count || 10) * 60 : 0; // 1 minute per chapter for images
    
    return Math.round((baseTime + chapterTime + imageTime) / 60); // Return in minutes
  },

  estimateCreditsRequired: (settings: ProjectSettings): number {
    const baseCredits = 30;
    const chapterCredits = (settings.chapters_count || 10) * 2;
    const imageCredits = settings.include_images ? (settings.chapters_count || 10) * 3 : 0;
    
    return baseCredits + chapterCredits + imageCredits;
  }
};