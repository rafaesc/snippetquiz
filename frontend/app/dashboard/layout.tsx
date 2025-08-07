"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiService, tokenService } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isResolvingCode, setIsResolvingCode] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
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
            const userProfile = await apiService.getUserProfile();
            setUser(userProfile);
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Code resolution failed:', error);
            setIsAuthenticated(false);
            redirect('/auth/login');
          } finally {
            setIsResolvingCode(false);
          }
        } else {
          // Normal authentication check
          const userProfile = await apiService.getUserProfile();
          setUser(userProfile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        redirect('/auth/login');
      }
    };

    checkAuth();
  }, [router, searchParams]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear tokens anyway and redirect
      router.push('/auth/login');
    }
  };

  // Show loading while checking authentication or resolving code
  if (isAuthenticated === null || isResolvingCode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          {isResolvingCode && (
            <p className="text-sm text-muted-foreground">
              Authenticating with extension code...
            </p>
          )}
        </div>
      </div>
    );
  }

  // If not authenticated, the useEffect will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <div className="flex">
        <DashboardSidebar />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;