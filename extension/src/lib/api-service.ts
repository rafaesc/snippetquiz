const API_BASE_URL = import.meta.env.API_URL || 'http://localhost:5000';

// Token management (now using cookies instead of localStorage)
export const tokenService = {
  // Since tokens are now httpOnly cookies, we can't access them directly
  // We'll rely on the browser to automatically send them with requests

  refreshAccessToken: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Important: include cookies in request
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return response.json();
  },

  // Check if user is authenticated by calling verify endpoint
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

// Helper function to make authenticated requests with automatic token refresh
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
  };

  let response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      await tokenService.refreshAccessToken();
      response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  return response;
};

export interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    created_date: string;
    verified: boolean;
  }
  banks: {
    id: string;
    name: string;
  }[];
}

// Content Bank Types
export interface ContentBank {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
}

export interface ContentBanksResponse {
  contentBanks: ContentBank[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateContentBankRequest {
  name: string;
}

export interface UpdateContentBankRequest {
  name: string;
}

// Content Entry Types
export interface ContentEntry {
  id: string;
  contentType: 'full_html' | 'selected_text' | 'video_transcript';
  content?: string;
  sourceUrl?: string;
  pageTitle?: string;
  createdAt: string;
  topics?: string[];
}

export interface ContentEntriesResponse {
  entries: ContentEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateContentEntryRequest {
  sourceUrl?: string;
  content?: string;
  type: 'full_html' | 'selected_text' | 'video_transcript';
  pageTitle?: string;
  bankId: string;
}

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

  // Logout
  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
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
    getAll: async (page = 1, limit = 10, name?: string): Promise<ContentBanksResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (name) {
        params.append('name', name);
      }

      const response = await makeAuthenticatedRequest(`/api/content-bank?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch content banks');
      }

      return response.json();
    },

    // Create a new content bank
    create: async (data: CreateContentBankRequest): Promise<ContentBank> => {
      const response = await makeAuthenticatedRequest('/api/content-bank', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content bank');
      }

      return response.json();
    },

    // Update/rename a content bank
    update: async (id: string, data: UpdateContentBankRequest): Promise<ContentBank> => {
      const response = await makeAuthenticatedRequest(`/api/content-bank/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update content bank');
      }

      return response.json();
    },

    // Delete a content bank
    delete: async (id: string): Promise<{ message: string }> => {
      const response = await makeAuthenticatedRequest(`/api/content-bank/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete content bank');
      }

      return response.json();
    },

    // Get all content banks for the user
    get: async (id?: string): Promise<ContentBank> => {
      const response = await makeAuthenticatedRequest(`/api/content-bank/${id}`);


      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch content bank');
      }

      return response.json();
    },
  },

  // Content Entry CRUD operations
  contentEntry: {
    // Get all content entries for a specific bank
    getByBank: async (bankId: string, page = 1, limit = 10, name?: string): Promise<ContentEntriesResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (name) {
        params.append('name', name);
      }

      const response = await makeAuthenticatedRequest(`/api/content-entry/bank/${bankId}?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch content entries');
      }

      return response.json();
    },

    // Create a new content entry
    create: async (data: CreateContentEntryRequest): Promise<ContentEntry> => {
      const response = await makeAuthenticatedRequest('/api/content-entry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create content entry');
      }

      return response.json();
    },

    // Delete a content entry
    delete: async (id: string): Promise<{ message: string }> => {
      const response = await makeAuthenticatedRequest(`/api/content-entry/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete content entry');
      }

      return response.json();
    },
  },
};