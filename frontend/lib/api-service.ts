const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

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

export interface DashboardData {
  title: string;
  isAuthenticated: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface GetInstructionsResponse {
  instruction: string;
  updatedAt: string; // ISO date string
}

export interface UpdateInstructionsResponse {
  id: number;
  instruction: string;
  updatedAt: string; // ISO date string
}

// API service functions
export const apiService = {
  // Get user profile data (requires authentication)
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await makeAuthenticatedRequest('/api/auth/profile');
    
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
    const response = await makeAuthenticatedRequest('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    
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
    return makeAuthenticatedRequest(url, options);
  },
  
  // Verify email
  verifyEmail: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email verification failed');
    }
    
    return response.json();
  },

  // Resend verification email
  resendVerificationEmail: async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resend verification email');
    }
    
    return response.json();
  },

  // Get quiz generation instructions
  getInstructions: async (): Promise<GetInstructionsResponse> => {
    const response = await makeAuthenticatedRequest('/api/instructions');
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz generation instructions');
    }
    
    return response.json();
  },

  // Update quiz generation instructions
  updateInstructions: async (instruction: string): Promise<UpdateInstructionsResponse> => {
    const response = await makeAuthenticatedRequest('/api/instructions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ instruction }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update quiz generation instructions');
    }
    
    return response.json();
  },
};