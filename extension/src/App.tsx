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

  // Add this useEffect to handle messages from background script
  useEffect(() => {
    const handleMessage = async (request: any, _: any, sendResponse: any) => {
      if (request.action === 'createContentEntry') {
        try {
          // Get default bank ID from storage or user settings
          const result = await chrome.storage.local.get('defaultBankId');
          const bankId = result.defaultBankId;
          
          if (!bankId) {
            sendResponse({
              success: false,
              error: 'No default bank ID found. Please set a default bank.'
            });
            return;
          }
          
          // Create content entry using API service
          const contentEntry = await apiService.contentEntry.create({
            ...request.data,
            bankId: bankId
          });
          
          sendResponse({
            success: true,
            data: contentEntry
          });
        } catch (error) {
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'

          });
        }
      }
      
      return true; // Keep message channel open for async response
    };
    
    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

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