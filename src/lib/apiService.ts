// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Types based on your API models
export interface AIModel {
  _id: string;
  name: string;
  slug: string;
  category: 'audio' | 'text' | 'image' | 'video' | 'data' | 'content';
  description: string;
  success_rate: number;
  features: string[];
  input_types: string[];
  output_types: string[];
  pricing: {
    credits_per_use: number;
    premium_credits: number;
  };
  status: 'active' | 'inactive' | 'maintenance' | 'deprecated';
  estimated_time: string;
  tags: string[];
  extra_info: {
    description_detail: string;
    display_name: string;
    labels: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface UsageHistory {
  _id: string;
  ai_model_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  credits_used: number;
  created_at: string;
  completed_at?: string;
  has_output: boolean;
}

export interface APIResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  models?: T[];
  popular_models?: T[];
  categories?: Array<{
    category: string;
    count: number;
    models: Array<{
      name: string;
      slug: string;
      description: string;
    }>;
  }>;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

class APIService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all AI models with filtering
  async getAllModels(params: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}): Promise<APIResponse<PaginatedResponse<AIModel>>> {
    const searchParams = new URLSearchParams();
    
    if (params.category) searchParams.append('category', params.category);
    if (params.status) searchParams.append('status', params.status || 'active');
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.search) searchParams.append('search', params.search);

    const endpoint = `/api/ai/models?${searchParams.toString()}`;
    return this.makeRequest<PaginatedResponse<AIModel>>(endpoint);
  }

  // Get model by slug
  async getModelBySlug(slug: string): Promise<APIResponse<AIModel>> {
    return this.makeRequest<AIModel>(`/api/ai/models/${slug}`);
  }

  // Get model metadata
  async getModelMetadata(slug: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/api/ai/models/${slug}/metadata`);
  }

  // Get categories
  async getCategories(): Promise<APIResponse<PaginatedResponse<never>>> {
    return this.makeRequest<PaginatedResponse<never>>('/api/ai/categories');
  }

  // Get popular models
  async getPopularModels(limit: number = 10): Promise<APIResponse<PaginatedResponse<AIModel>>> {
    return this.makeRequest<PaginatedResponse<AIModel>>(`/api/ai/popular?limit=${limit}`);
  }

  // Get model pricing
  async getModelPricing(slug: string): Promise<APIResponse<any>> {
    return this.makeRequest<any>(`/api/ai/models/${slug}/pricing`);
  }

  // Get usage history for a model
  async getUsageHistory(
    slug: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<APIResponse<UsageHistory[]>> {
    return this.makeRequest<UsageHistory[]>(
      `/api/ai/models/${slug}/usage-history?limit=${limit}&offset=${offset}`
    );
  }

  // Get models by category
  async getModelsByCategory(category: string): Promise<APIResponse<PaginatedResponse<AIModel>>> {
    return this.getAllModels({ category, status: 'active' });
  }
}

export const apiService = new APIService();
