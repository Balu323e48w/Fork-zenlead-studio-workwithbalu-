import { config } from '@/config/env';
import { tokenManager } from '@/lib/token';

interface ChapterContent {
  chapter_number: number;
  title: string;
  full_content: string;
  formatted_content?: string;
  word_count: number;
  images: Array<{
    caption: string;
    data: string;
    source: string;
  }>;
}

interface BookData {
  usage_id: string;
  book_metadata: any;
  table_of_contents: any[];
  full_book_content: any;
  pdf_base64: string;
  chapters_summary: any[];
  generation_info: any;
  storage_info: any;
}

export class BookApiService {
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const token = tokenManager.getToken();
      if (token && tokenManager.isTokenValid(token)) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not access auth token:', error);
    }

    return headers;
  }

  static async getFullChapterContent(usageId: string, chapterNumber: number): Promise<ChapterContent> {
    const url = `${config.API_BASE_URL}/api/ai/long-form-book/${usageId}/chapter/${chapterNumber}/full`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chapter content: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch chapter content');
    }

    return result.data;
  }

  static async getStoredBook(usageId: string): Promise<BookData> {
    const url = `${config.API_BASE_URL}/api/ai/long-form-book/${usageId}/stored`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stored book: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch stored book');
    }

    return result.data;
  }

  static async downloadBookPDF(usageId: string): Promise<void> {
    const url = `${config.API_BASE_URL}/api/ai/long-form-book/${usageId}/pdf`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch PDF');
    }

    // Create download link
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${result.data.pdf_base64}`;
    link.download = result.data.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static async checkUserCredits(): Promise<{
    user_credits: number;
    credits_required: number;
    has_sufficient_credits: boolean;
    credits_needed: number;
  }> {
    const url = `${config.API_BASE_URL}/api/ai/long-form-book/check-credits`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to check credits: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to check credits');
    }

    return result.data;
  }

  static async getGenerationStatus(usageId: string): Promise<{
    usage_id: string;
    status: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    credits_used: number;
    error_message?: string;
    has_output: boolean;
    progress_info: any;
    estimated_completion?: string;
  }> {
    const url = `${config.API_BASE_URL}/api/ai/long-form-book/${usageId}/status`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to get status');
    }

    return result.data;
  }

  static async cancelGeneration(usageId: string): Promise<{
    usage_id: string;
    cancelled_at: string;
    credits_refunded: number;
    refund_policy: any;
  }> {
    const url = `${config.API_BASE_URL}/api/ai/long-form-book/${usageId}/cancel`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel generation: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to cancel generation');
    }

    return result.data;
  }

  static async getBookHistory(limit: number = 10, offset: number = 0): Promise<{
    books: any[];
    pagination: any;
    summary: any;
  }> {
    const url = `${config.API_BASE_URL}/api/ai/long-form-book/history?limit=${limit}&offset=${offset}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get book history: ${response.status}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to get book history');
    }

    return result.data;
  }
}
