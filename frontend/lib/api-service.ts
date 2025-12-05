import {
  UserProfile,
  GetInstructionsResponse,
  UpdateInstructionsResponse,
  ContentBank,
  ContentBanksResponse,
  CreateContentBankRequest,
  UpdateContentBankRequest,
  DuplicateContentBankRequest,
  ContentEntry,
  ContentEntriesResponse,
  CreateContentEntryRequest,
  QuizzesResponse,
  QuizResponsesResponse,
  QuizSummaryResponse,
  FindOneQuizResponse,
  UpdateQuizResponse,
  ValidateQuizInProgressResponse,
  CreateQuizRequest,
  CreateQuizResponse,
} from './types';

const API_BASE_URL = (typeof window !== 'undefined' && window.__ENV?.API_BASE_URL) || 'http://localhost:3001';


// Token management (now using cookies instead of localStorage)
export const tokenService = {
  // Since tokens are now httpOnly cookies, we can't access them directly
  // We'll rely on the browser to automatically send them with requests

  refreshAccessToken: async () => {
    const response = await fetch(API_BASE_URL + "/api/auth-service/refresh", {
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
      const response = await fetch(`${API_BASE_URL}/api/auth-service/verify`, {
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Resolve one-time code to get authentication cookies
  resolveCode: async (code: string) => {
    const response = await fetch(`${API_BASE_URL}/api/code/resolve`, {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resolve code');
    }

    return response.json();
  }
};

// Helper function to make authenticated requests with automatic token refresh
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...options,
  };

  let response = await fetch(fullUrl, defaultOptions);

  // If token expired, try to refresh
  if (response.status === 401) {
    try {
      await tokenService.refreshAccessToken();
      response = await fetch(fullUrl, defaultOptions);
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }

  return response;
};

// API service functions
export const apiService = {
  // Get user profile data (requires authentication)
  getUserProfile: async (): Promise<UserProfile> => {
    const response = await makeAuthenticatedRequest('/api/auth-service/profile');

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  },

  // Login
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth-service/login`, {
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
    const response = await fetch(`${API_BASE_URL}/api/auth-service/register`, {
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
    const response = await makeAuthenticatedRequest('/api/auth-service/change-password', {
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
      await fetch(`${API_BASE_URL}/api/auth-service/logout`, {
        method: 'POST',
        credentials: 'include',
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
    const response = await fetch(`${API_BASE_URL}/api/auth-service/verify-email`, {
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
    const response = await fetch(`${API_BASE_URL}/api/auth-service/resend-verification`, {
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

  // Resolve one-time code (also available as standalone function)
  resolveCode: async (code: string) => {
    return tokenService.resolveCode(code);
  },

  // Get quiz generation instructions
  getInstructions: async (): Promise<GetInstructionsResponse> => {
    const response = await makeAuthenticatedRequest('/api/core/instructions');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz generation instructions');
    }

    return response.json();
  },

  // Update quiz generation instructions
  updateInstructions: async (instruction: string): Promise<void> => {
    const response = await makeAuthenticatedRequest('/api/core/instructions', {
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

    return;
  },

  // Content Bank API methods
  getContentBanks: async (page = 1, limit = 10, name?: string): Promise<ContentBanksResponse> => {
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

  createContentBank: async (data: CreateContentBankRequest): Promise<void> => {
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

  updateContentBank: async (id: string, data: UpdateContentBankRequest): Promise<void> => {
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

  deleteContentBank: async (id: string): Promise<undefined> => {
    const response = await makeAuthenticatedRequest(`/api/core/content-bank/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete content bank');
    }
  },

  duplicateContentBank: async (id: string, data?: DuplicateContentBankRequest): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/core/content-bank/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to duplicate content bank');
    }

    return;
  },

  // Content Entry API methods
  getContentEntries: async (bankId: string, page = 1, limit = 10, name?: string): Promise<ContentEntriesResponse> => {
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

  createContentEntry: async (data: CreateContentEntryRequest): Promise<void> => {
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

    return;
  },

  cloneContentEntry: async (id: string, bankId: string): Promise<void> => {
    const response = await makeAuthenticatedRequest(`/api/core/content-entry/${id}/clone-to/${bankId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clone content entry');
    }

    return;
  },

  deleteContentEntry: async (id: string): Promise<undefined> => {
    const response = await makeAuthenticatedRequest(`/api/core/content-entry/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete content entry');
    }
  },

  // Quiz API methods
  getQuizzes: async (page = 1, limit = 10): Promise<QuizzesResponse> => {
    const params = new URLSearchParams({
      page: (page - 1).toString(),
      size: limit.toString(),
    });

    const response = await makeAuthenticatedRequest(`/api/core/quiz?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quizzes');
    }

    return response.json();
  },

  getQuiz: async (id: string): Promise<FindOneQuizResponse> => {
    const response = await makeAuthenticatedRequest(`/api/core/quiz/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz');
    }

    return response.json();
  },

  getQuizResponses: async (id: string, page = 1, limit = 10): Promise<QuizResponsesResponse> => {
    const params = new URLSearchParams({
      page: (page - 1).toString(),
      size: limit.toString(),
    });

    const response = await makeAuthenticatedRequest(`/api/core/quiz/${id}/responses?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz responses');
    }

    return response.json();
  },

  getQuizSummary: async (id: string): Promise<QuizSummaryResponse> => {
    const response = await makeAuthenticatedRequest(`/api/core/quiz/${id}/summary`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz summary');
    }

    return response.json();
  },

  deleteQuiz: async (id: string): Promise<undefined> => {
    const response = await makeAuthenticatedRequest(`/api/core/quiz/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete quiz');
    }
  },

  updateQuiz: async (quizId: string, optionId: number): Promise<UpdateQuizResponse> => {
    const response = await makeAuthenticatedRequest(`/api/core/quiz/${quizId}/option/${optionId}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update quiz');
    }

    return response.json();
  },

  validateQuizInProgress: async (): Promise<ValidateQuizInProgressResponse> => {
    const response = await makeAuthenticatedRequest('/api/core/quiz/validate');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to validate quiz in progress');
    }

    return response.json();
  },

  createQuiz: async (data: CreateQuizRequest): Promise<CreateQuizResponse> => {
    const response = await makeAuthenticatedRequest('/api/core/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // include client-generated quizId in the payload
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create quiz');
    }

    // Prefer server-provided quizId; fallback to client-generated if absent
    const payload = await response.json();
    return { quizId: payload.quizId };
  },
};