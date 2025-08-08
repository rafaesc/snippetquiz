"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService, tokenService, UserProfile } from "@/lib/api-service";

interface AuthContextType {
    user: UserProfile["user"] | null;
    isAuthenticated: boolean | null;
    isLoading: boolean;
    isResolvingCode: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<UserProfile["user"] | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolvingCode, setIsResolvingCode] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const checkAuth = async () => {
        try {
            setIsLoading(true);

            // Check if there's a code in the URL
            const code = searchParams.get('code');

            if (code) {
                setIsResolvingCode(true);
                try {
                    // Resolve the code to get authentication cookies
                    await tokenService.resolveCode(code);

                    // Remove the code from URL after successful resolution
                    const url = new URL(window.location.href);
                    url.searchParams.delete('code');
                    window.history.replaceState({}, '', url.toString());

                    // Now get user profile
                    const { user } = await apiService.getUserProfile();
                    setUser(user);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Code resolution failed:', error);
                    setIsAuthenticated(false);
                    router.push('/auth/login');
                } finally {
                    setIsResolvingCode(false);
                }
            } else {
                // Normal authentication check
                const { user } = await apiService.getUserProfile();
                setUser(user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            setIsAuthenticated(false);
            router.push('/auth/login');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            await apiService.login(email, password);
            const { user } = await apiService.getUserProfile();
            setUser(user);
            setIsAuthenticated(true);
            router.push('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await apiService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            router.push('/auth/login');
        }
    };

    const refreshAuth = async () => {
        await checkAuth();
    };

    useEffect(() => {
        checkAuth();
    }, [searchParams]);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        isResolvingCode,
        login,
        logout,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}