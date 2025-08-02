import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import LoginPage from './components/LoginPage';
import { apiService } from './lib/api-service';
import { Loader2 } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication status
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: apiService.getUserProfile,
    enabled: isAuthenticated === true,
    retry: false,
  });

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      try {
        await apiService.getUserProfile();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    if (isAuthenticated === null) {
      checkAuth();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Show main app if authenticated
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              QuizMaster Extension
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back! You are successfully logged in.
            </p>
          </header>

          {userProfile && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">User Profile</h2>
              <pre className="text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-auto">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Extension Features</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your extension content will go here. You can now build features that require authentication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;