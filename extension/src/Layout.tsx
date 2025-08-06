import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function Layout({
  children,
  className = ""
}: LayoutProps) {
  return (
    <div className={`w-[560px] max-w-[560px] mx-auto bg-background shadow-extension overflow-hidden ${className}`}>
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
}