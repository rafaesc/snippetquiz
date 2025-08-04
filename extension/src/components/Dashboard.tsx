import { useQuery } from '@tanstack/react-query';
import { apiService } from '../lib/api-service';
import chromeStorage from '../lib/chrome-storage';

function Dashboard() {
    // Check authentication status
    const { data: userProfile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            try {
                const profile = await apiService.getUserProfile();
                
                await chromeStorage.local.set({ userId: profile.id });
                return profile;
            } catch (error) {
                await chromeStorage.local.clear();
                console.log('Chrome storage cleared due to profile fetch failure:', error);
            }
        },
        retry: false,
    });

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

export default Dashboard;