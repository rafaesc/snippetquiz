const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';

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

export interface DashboardData {
  title: string;
  isAuthenticated: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// API service functions
export const apiService = {
  // Get user profile data (requires authentication)
  getUserProfile: async (): Promise<UserProfile> => {
    let response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
      credentials: 'include', // Include cookies
    });
    
    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        await tokenService.refreshAccessToken();
        response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: 'include',
        });
      } catch (error) {
        throw new Error('Authentication failed');
      }
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  },
  
  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
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
      credentials: 'include', // Include cookies
      body: JSON.stringify({ name, email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }
    
    return response.json();
  },
  
  // Change Password
  changePassword: async (currentPassword: string, newPassword: string) => {
    let response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
    // If token expired, try to refresh
    if (response.status === 401) {
      try {
        await tokenService.refreshAccessToken();
        response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ currentPassword, newPassword }),
        });
      } catch (error) {
        throw new Error('Authentication failed');
      }
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to change password');
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
  
  // Generic API call with automatic token refresh
  apiCall: async (url: string, options: RequestInit = {}) => {
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
  },
};