"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { QuizList } from "@/components/QuizList";
import { apiService } from "@/lib/api-service";
import { Quiz } from "@/lib/types";

export default function QuizzesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    error: quizzesError,
    refetch: refetchQuizzes,
  } = useQuery({
    queryKey: ["quizzes", page, limit],
    queryFn: () => apiService.getQuizzes(page, limit),
    staleTime: 0,
  });

  const handleViewSummary = (quiz: Quiz) => {
    router.push(`/dashboard/quizzes/${quiz.id}/summary`);
  };
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoadingQuizzes) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Generated Quizzes</h1>
          <p className="text-muted-foreground">
            View and manage your quiz history
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading quizzes...</span>
        </div>
      </div>
    );
  }

  if (quizzesError) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Generated Quizzes</h1>
          <p className="text-muted-foreground">
            View and manage your quiz history
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load quizzes:{" "}
            {quizzesError instanceof Error
              ? quizzesError.message
              : "Unknown error"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchQuizzes()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">
          Generated Quizzes
        </h1>
        <p className="text-muted-foreground">
          View and manage your quiz history
        </p>
      </div>

      {quizzesData?.content && quizzesData.content.length > 0 ? (
        <>
          <QuizList
            quizzesData={quizzesData}
            onViewSummary={handleViewSummary}
          />

          {/* Pagination */}
          {quizzesData.page.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, page - 1))}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from(
                    {
                      length: Math.min(
                        5,
                        Math.ceil(quizzesData.page.totalElements / limit)
                      ),
                    },
                    (_, i) => {
                      const pageNum = i + Math.max(1, page - 2);
                      const totalPages = Math.ceil(
                        quizzesData.page.totalElements / limit
                      );
                      if (pageNum > totalPages) return null;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePageChange(pageNum)}
                            isActive={page === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            Math.ceil(quizzesData.page.totalElements / limit),
                            page + 1
                          )
                        )
                      }
                      className={
                        page >= Math.ceil(quizzesData.page.totalElements / limit)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No quizzes found. Create your first quiz to get started!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
