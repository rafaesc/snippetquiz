"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardSidebar from "@/components/DashboardSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { QuizProvider } from "@/contexts/QuizContext";

function DashboardContent({ children }: { children: React.ReactNode }) {
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <QuizProvider>
          <DashboardContent>{children}</DashboardContent>
        </QuizProvider>
      </ProtectedRoute>
    </AuthProvider>
  );
}
