import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication - SnippetQuiz",
  description: "Login or register to access SnippetQuiz",
};
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          href={process.env.HOMEPAGE_URL || "/"} 
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        {children}
      </div>
    </div>
  );
}