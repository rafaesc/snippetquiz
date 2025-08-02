"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiService, tokenService } from "@/lib/api-service";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userProfile = await apiService.getUserProfile();
        setUser(userProfile);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

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

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, the useEffect will redirect
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dashboard Header/Navigation */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="QuizMaster logo"
              width={100}
              height={20}
              priority
            />
            <span className="font-semibold">Dashboard</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/dashboard" 
              className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
            >
              Overview
            </Link>
            <Link 
              href="/dashboard/content" 
              className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
            >
              Content
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="text-sm hover:text-gray-600 dark:hover:text-gray-300"
            >
              Settings
            </Link>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user.name}
                </span>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;