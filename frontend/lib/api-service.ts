
import { getAccessToken } from '@auth0/nextjs-auth0';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export interface DashboardData {
  title: string;
  isAuthenticated: boolean;
}

export interface UserProfile {
  userProfile: string;
  title: string;
}

// API service functions
export const apiService = {
  // Get dashboard data from backend root endpoint
  getDashboardData: async (): Promise<DashboardData> => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}/`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    return response.json();
  },

  // Get user profile data (requires authentication)
  getUserProfile: async (): Promise<UserProfile> => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    return response.json();
  },
};