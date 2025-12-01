
import chromeStorage from '../lib/chrome-storage';
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Token management for Chrome Extension (using chrome.storage instead of cookies)
export const tokenService = {
  // Get access token from chrome storage
  getAccessToken: async (): Promise<string | null> => {
    const result = await chromeStorage.local.get('accessToken');
    return result.accessToken || null;
  },

  // Get refresh token from chrome storage
  getRefreshToken: async (): Promise<string | null> => {
    const result = await chromeStorage.local.get('refreshToken');
    return result.refreshToken || null;
  },

  // Store tokens in chrome storage
  setTokens: async (accessToken: string, refreshToken: string) => {
    await chromeStorage.local.set({
      accessToken,
      refreshToken
    });
  },

  // Clear tokens from chrome storage
  clearTokens: async () => {
    await chromeStorage.local.remove(['accessToken', 'refreshToken']);
  },

  // Refresh access token using stored refresh token
  refreshAccessToken: async () => {
    const refreshToken = await tokenService.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/api/auth-service/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await tokenService.clearTokens();
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    await tokenService.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    return data;
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const accessToken = await tokenService.getAccessToken();
      if (!accessToken) return false;

      const response = await fetch(`${API_BASE_URL}/api/auth-service/verify`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Generate one-time code for dashboard access
  generateCode: async (): Promise<{ code: string; }> => {
    const response = await makeAuthenticatedRequest('/api/code/generate', {

      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate code');
    }

    return response.json();
  }
};

// Helper function to make authenticated requests with automatic token refresh
export const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  let accessToken = await tokenService.getAccessToken();

  if (!accessToken) {
    throw new Error('No access token available');
  }

  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  };

  let response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      await tokenService.refreshAccessToken();
      accessToken = await tokenService.getAccessToken();

      // Retry with new token
      defaultOptions.headers = {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      };
      response = await fetch(`${API_BASE_URL}${url}`, defaultOptions);
    } catch (error) {
      await tokenService.clearTokens();
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
  contentEntries?: number;
}

export interface ContentBanksResponse {
  content: ContentBank[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
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
  content: ContentEntry[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CreateContentEntryRequest {
  sourceUrl?: string;
  content?: string;
  type: 'full_html' | 'selected_text' | 'video_transcript';
  pageTitle?: string;
  bankId: string;

  youtubeVideoId?: string;
  youtubeVideoDuration?: number;
  youtubeChannelId?: string;
  youtubeChannelName?: string;
  youtubeAvatarUrl?: string;
}

export const apiService = {
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth-service/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();

    // Store tokens in chrome storage
    if (data.tokens.accessToken && data.tokens.refreshToken) {
      await tokenService.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    }

    return data;
  },

  // Generate one-time code (convenience method)
  generateCode: async () => {
    return tokenService.generateCode();
  },

  // Register
  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth-service/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();

    // Store tokens in chrome storage if provided
    if (data.tokens && data.tokens.accessToken && data.tokens.refreshToken) {
      await tokenService.setTokens(data.tokens.accessToken, data.tokens.refreshToken);
    }

    return data;
  },

  // Logout - clear tokens from chrome storage
  logout: async () => {
    try {
      const accessToken = await tokenService.getAccessToken();
      if (accessToken) {
        await fetch(`${API_BASE_URL}/api/auth-service/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await tokenService.clearTokens();
    }
  },

  // Get user profile
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await makeAuthenticatedRequest('/api/auth-service/profile');

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
        page: (page - 1).toString(),
        size: limit.toString(),
      });

      if (name) {
        params.append('name', name);
      }

      const response = await makeAuthenticatedRequest(`/api/core/content-bank?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch content banks');
      }

      return response.json();
    },

    // Create a new content bank
    create: async (data: CreateContentBankRequest): Promise<void> => {
      const response = await makeAuthenticatedRequest('/api/core/content-bank', {
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

      return;
    },

    // Update/rename a content bank
    update: async (id: string, data: UpdateContentBankRequest): Promise<void> => {
      const response = await makeAuthenticatedRequest(`/api/core/content-bank/${id}`, {
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

      return;
    },

    // Delete a content bank
    delete: async (id: string): Promise<void> => {
      const response = await makeAuthenticatedRequest(`/api/core/content-bank/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete content bank');
      }

      return;
    },

    // Get all content banks for the user
    get: async (id: string): Promise<ContentBank> => {
      const response = await makeAuthenticatedRequest(`/api/core/content-bank/${id}`);

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
        page: (page - 1).toString(),
        size: limit.toString(),
      });

      if (name) {
        params.append('name', name);
      }

      const response = await makeAuthenticatedRequest(`/api/core/content-entry/bank/${bankId}?${params}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch content entries');
      }

      return response.json();
    },

    // Create a new content entry
    create: async (data: CreateContentEntryRequest): Promise<ContentEntry> => {
      const response = await makeAuthenticatedRequest('/api/core/content-entry', {
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
    delete: async (id: string): Promise<void> => {
      const response = await makeAuthenticatedRequest(`/api/core/content-entry/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete content entry');
      }

      return;
    },
  },
};