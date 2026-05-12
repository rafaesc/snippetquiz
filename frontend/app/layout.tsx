import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { QueryProvider } from '../lib/query-client';

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SnippetQuiz",
  description: "SnippetQuiz is a platform for creating and playing quizzes",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/env-config.js" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={<div>Loading...</div>}>
            <QueryProvider>
              {children}
            </QueryProvider>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
