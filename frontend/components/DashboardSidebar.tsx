'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Sparkles, FileText, Database, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home
  },
  {
    name: 'Generate Quiz',
    href: '/dashboard/generate',
    icon: Sparkles,
    highlighted: true
  },
  {
    name: 'Generated Quizzes',
    href: '/dashboard/quizzes',
    icon: FileText
  },
  {
    name: 'Content Banks',
    href: '/dashboard/content-banks',
    icon: Database
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
];

export const DashboardSidebar = () => {
  const pathname = usePathname();

  const NavItems = () => (
    <nav className="space-y-2 p-4">
      {navigation.map(item => {
        const isActive = item.href === '/dashboard' 
          ? pathname === '/dashboard'
          : pathname.startsWith(item.href);
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-turquoise-50 text-turquoise-700 dark:bg-turquoise-900/20 dark:text-turquoise-300'
                : item.highlighted
                ? 'text-turquoise-600 hover:bg-turquoise-50 hover:text-turquoise-700 dark:text-turquoise-400 dark:hover:bg-turquoise-900/20 dark:hover:text-turquoise-300 font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:bg-background lg:border-r">
        <div className="flex-1 overflow-y-auto bg-[#171c28]">
          <NavItems />
        </div>
      </aside>
    </>
  );
};

export default DashboardSidebar;