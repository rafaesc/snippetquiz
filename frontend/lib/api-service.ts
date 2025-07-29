
import { getAccessToken } from '@auth0/nextjs-auth0';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export interface DashboardData {
  title: string;
  isAuthenticated: boolean;
}

export interface UserProfile {
  sub: string;
  given_name: string;
  family_name: string;
  nickname: string;
  name: string;
  picture: string;
  updated_at: string;
  email: string;
  email_verified: boolean;
  permissions: string[];
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