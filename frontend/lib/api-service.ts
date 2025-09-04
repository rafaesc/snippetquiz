import   {
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

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

// Token management (now using cookies instead of localStorage)
export const tokenService = {
  // Since tokens are now httpOnly cookies, we can't access them directly
  // We'll rely on the browser to automatically send them with requests

  refreshAccessToken: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth-service/refresh`, {
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

  // Content Bank API methods
  getContentBanks: async (page = 1, limit = 10, name?: string): Promise<ContentBanksResponse> => {
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

  createContentBank: async (data: CreateContentBankRequest): Promise<ContentBank> => {
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

  updateContentBank: async (id: string, data: UpdateContentBankRequest): Promise<ContentBank> => {
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

  deleteContentBank: async (id: string): Promise<{ message: string }> => {
    const response = await makeAuthenticatedRequest(`/api/content-bank/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete content bank');
    }

    return response.json();
  },

  duplicateContentBank: async (id: string, data?: DuplicateContentBankRequest): Promise<ContentBank> => {
    const response = await makeAuthenticatedRequest(`/api/content-bank/${id}/duplicate`, {
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

    return response.json();
  },

  // Content Entry API methods
  getContentEntries: async (bankId: string, page = 1, limit = 10, name?: string): Promise<ContentEntriesResponse> => {
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

  createContentEntry: async (data: CreateContentEntryRequest): Promise<ContentEntry> => {
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

  cloneContentEntry: async (id: string, bankId: string): Promise<ContentEntry & { message: string }> => {
    const response = await makeAuthenticatedRequest(`/api/content-entry/${id}/clone-to/${bankId}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clone content entry');
    }

    return response.json();
  },

  deleteContentEntry: async (id: string): Promise<{ message: string }> => {
    const response = await makeAuthenticatedRequest(`/api/content-entry/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete content entry');
    }

    return response.json();
  },

  // Quiz API methods
  getQuizzes: async (page = 1, limit = 10): Promise<QuizzesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await makeAuthenticatedRequest(`/api/quiz?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quizzes');
    }

    return response.json();
  },

  getQuiz: async (id: number): Promise<FindOneQuizResponse> => {
    const response = await makeAuthenticatedRequest(`/api/quiz/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz');
    }

    return response.json();
  },

  getQuizResponses: async (id: string, page = 1, limit = 10): Promise<QuizResponsesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await makeAuthenticatedRequest(`/api/quiz/${id}/responses?${params}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz responses');
    }

    return response.json();
  },

  getQuizSummary: async (id: string): Promise<QuizSummaryResponse> => {
    const response = await makeAuthenticatedRequest(`/api/quiz/${id}/summary`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch quiz summary');
    }

    return response.json();
  },

  deleteQuiz: async (id: string): Promise<{ message: string }> => {
    const response = await makeAuthenticatedRequest(`/api/quiz/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete quiz');
    }

    return response.json();
  },

  updateQuiz: async (quizId: number, optionId: number): Promise<UpdateQuizResponse> => {
    const response = await makeAuthenticatedRequest(`/api/quiz/${quizId}/option/${optionId}`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update quiz');
    }

    return response.json();
  },

  validateQuizInProgress: async (): Promise<ValidateQuizInProgressResponse> => {
    const response = await makeAuthenticatedRequest('/api/quiz/validate');

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to validate quiz in progress');
    }

    return response.json();
  },

  createQuiz: async (data: CreateQuizRequest): Promise<CreateQuizResponse> => {
    const response = await makeAuthenticatedRequest('/api/quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create quiz');
    }

    return response.json();
  },
};