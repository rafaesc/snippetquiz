import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import { apiService } from './lib/api-service';
import { Loader2 } from 'lucide-react';
import Layout from './Layout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

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
    return (
      <Layout>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </Layout>
    );
  }

  // Show dashboard if authenticated
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

export default App;