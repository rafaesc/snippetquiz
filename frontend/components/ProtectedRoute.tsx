"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, isResolvingCode } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated === false && !isLoading && !isResolvingCode) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, isLoading, isResolvingCode, router]);

    // Show loading while checking authentication or resolving code
    if (isAuthenticated === null || isLoading || isResolvingCode) {
        return fallback || (
            <div className="min-h-screen bg-background">
                <DashboardHeader />

                <div className="flex">
                    <DashboardSidebar />
                </div>
                <div className="container mt-10 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        {isResolvingCode && (
                            <p className="text-sm text-muted-foreground">
                                Authenticating with extension code...
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // If not authenticated, the useEffect will redirect
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}