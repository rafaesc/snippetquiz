'use client';

import Link from "next/link";
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../lib/api-service';

function Dashboard() {
  // Query for dashboard data
  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    error: dashboardError 
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: apiService.getDashboardData,
  });

  // Query for user profile (optional, only if user is authenticated)
  const { 
    data: userProfile, 
    isLoading: isProfileLoading, 
    error: profileError 
  } = useQuery({
    queryKey: ['userProfile'],
    queryFn: apiService.getUserProfile,
    enabled: dashboardData?.isAuthenticated || false, // Only fetch if authenticated
  });

  if (isDashboardLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="text-center py-8">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <div className="text-center py-8 text-red-500">
          <p>Error loading dashboard: {dashboardError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link 
          href="/dashboard/content/new" 
          className="rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          Create New Content
        </Link>
      </div>
      
      {/* Display backend data */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-medium mb-2">Backend Status</h2>
        <p className="text-sm">Title: {dashboardData?.title}</p>
        <p className="text-sm">Authentication Status: {dashboardData?.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
        
        {dashboardData?.isAuthenticated && userProfile && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <h3 className="font-medium">User Profile:</h3>
            <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(userProfile, null, 2)}</pre>
          </div>
        )}
        
        {dashboardData?.isAuthenticated && isProfileLoading && (
          <p className="text-sm mt-2">Loading profile...</p>
        )}
        
        {dashboardData?.isAuthenticated && profileError && (
          <p className="text-sm mt-2 text-red-500">Profile error: {profileError.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Content Overview</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Published pieces</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Views</h2>
          <p className="text-3xl font-bold">0</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total views</p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-2">Engagement</h2>
          <p className="text-3xl font-bold">0%</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Average engagement rate</p>
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent activity to display.</p>
          <p className="mt-2 text-sm">Create your first content to get started!</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;