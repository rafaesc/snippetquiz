const API_BASE_URL = import.meta.env.API_URL || 'http://localhost:3001';

export const apiService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    
    return response.json();
  },
  
  // Register
  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },
  
  // Get user profile
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  },

  // Content Bank CRUD operations
  contentBank: {
    // Get all content banks for the user
    getAll: async (): Promise<{ contentBanks: ContentBank[] }> => {
      const response = await fetch(`${API_BASE_URL}/api/content-bank`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch content banks');
      }
      
      return response.json();
    },

    // Create a new content bank
    create: async (name: string): Promise<ContentBank> => {
      const response = await fetch(`${API_BASE_URL}/api/content-bank`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content bank');
      }
      
      return response.json();
    },

    // Update/rename a content bank
    update: async (id: number, name: string): Promise<ContentBank> => {
      const response = await fetch(`${API_BASE_URL}/api/content-bank/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update content bank');
      }
      
      return response.json();
    },

    // Delete a content bank
    delete: async (id: number): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/content-bank/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete content bank');
      }
      
      return response.json();
    },
  },

  // Content Entry CRUD operations
  contentEntry: {
    // Create a new content entry
    create: async (data: CreateContentEntryRequest): Promise<ContentEntry> => {
      const response = await fetch(`${API_BASE_URL}/api/content-entry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content entry');
      }
      
      return response.json();
    },
  },
};


// Type definitions for API responses
export interface ContentBank {
  id: number;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_date: string;
  verified: boolean;
  banks: ContentBank[];
}

// Additional type definitions for the new services
export type ContentType = 'selected_text' | 'full_html';

export interface ContentEntry {
  id: number;
  bank_id: number;
  content_type: ContentType;
  content?: string;
  bucket_object_url?: string;
  source_url?: string;
  page_title?: string;
  created_at: string;
  prompt_summary?: string;
  ai_topic_id?: number;
}

export interface CreateContentEntryRequest {
  sourceUrl?: string;
  content?: string;
  type: ContentType;
  pageTitle?: string;
  bankId: number;
}