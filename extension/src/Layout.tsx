import React from 'react';
import { X } from 'lucide-react';
import { Button } from './components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  className?: string;
}

export default function Layout({
  children,
  showHeader = true,
  className = ""
}: LayoutProps) {

  return (
  <div className={`w-[560px] max-w-[560px] mx-auto bg-background shadow-extension overflow-hidden ${className}`}>
      {showHeader && (
        <div className="bg-primary px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-primary-foreground font-semibold text-lg">QuizMaster</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-primary-foreground hover:bg-primary-hover h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
}