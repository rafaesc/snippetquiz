"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Sun, Menu, Home, Sparkles, FileText, Database, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useTheme } from 'next-themes';
import { apiService } from '@/lib/api-service';
import { useAuth } from "@/contexts/AuthContext";

const navigation = [{
  name: 'Home',
  href: '/dashboard',
  icon: Home
}, {
  name: 'Generate Quiz',
  href: '/dashboard/generate',
  icon: Sparkles,
  highlighted: true
}, {
  name: 'Generated Quizzes',
  href: '/dashboard/quizzes',
  icon: FileText
}, {
  name: 'Content Banks',
  href: '/dashboard/content',
  icon: Database
}, {
  name: 'Settings',
  href: '/dashboard/settings',
  icon: Settings
}];

function NavItems() {
  return (
    <nav className="flex flex-col space-y-1 p-4">
      {navigation.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${item.highlighted
              ? 'bg-primary text-primary-foreground font-medium'
              : 'hover:bg-accent hover:text-accent-foreground'
              }`}
          >
            <Icon className="h-4 w-4" />
            <span >{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardHeader() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (

    <header className="sticky top-0 z-40 w-full bg-gray-900/95 backdrop-blur shadow-lg">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile menu and Logo */}
        <div className="flex items-center space-x-2">
          {/* Mobile menu trigger - only visible on mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="pt-16">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-display font-bold text-white">SnippetQuiz</span>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-white"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* User greeting */}
          {user && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Hello, <span className="font-medium">{user.name}</span>
            </span>
          )}

          {/* Logout button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-1 text-black dark:text-white rounded-full"

          >
            <LogOut className="h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

