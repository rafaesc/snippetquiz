"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api-service";
import { QuizSummaryResponse, QuizResponsesResponse } from "@/lib/types";

export default function QuizSummaryPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  // Fetch quiz summary data
  const {
    data: summaryData,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ["quiz-summary", quizId],
    queryFn: () => apiService.getQuizSummary(quizId),
    enabled: !!quizId,
  });

  // Fetch quiz responses data
  const {
    data: responsesData,
    isLoading: responsesLoading,
    error: responsesError,
  } = useQuery({
    queryKey: ["quiz-responses", quizId],
    queryFn: () => apiService.getQuizResponses(quizId, 1, 100),
    enabled: !!quizId,
  });

  const isLoading = summaryLoading || responsesLoading;
  const hasError = summaryError || responsesError;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b bg-background">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Button variant="ghost" asChild className="p-2">
              <Link href="/dashboard/quizzes">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="ml-4">
              <h1 className="text-lg font-semibold">Quiz Summary</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading quiz results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError || !summaryData || !responsesData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 border-b bg-background">
          <div className="flex h-16 items-center px-4 md:px-6">
            <Button variant="ghost" asChild className="p-2">
              <Link href="/dashboard/quizzes">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="ml-4">
              <h1 className="text-lg font-semibold">Quiz Summary</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load quiz results</p>
            <Button onClick={() => router.push("/dashboard/quizzes")}>
              Back to Quizzes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const summary = summaryData;
  const responses = responsesData.responses;
  const totalQuestions = summary.totalQuestions;
  const correctAnswers = summary.totalCorrectAnswers;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = () => {
    if (score >= 80)
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Excellent
        </Badge>
      );
    if (score >= 60)
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          Good
        </Badge>
      );
    return (
      <Badge className="bg-red-100 text-red-800 border-red-200">
        Needs Improvement
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button variant="ghost" asChild className="p-2">
            <Link href="/dashboard/quizzes">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="ml-4">
            <h1 className="text-lg font-semibold">Quiz Complete!</h1>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
        {/* Score Overview */}
        <Card className="animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="space-y-2">
              <div
                className={`text-4xl md:text-6xl font-bold ${getScoreColor()}`}
              >
                {score}%
              </div>
              <div className="text-lg text-muted-foreground">
                {correctAnswers} out of {totalQuestions} correct
              </div>
              {getScoreBadge()}
              {/* Topics List */}
              {summary.topics && summary.topics.length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {summary.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Topics Overview */}
        {summary.topics && summary.topics.length > 0 && (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl">Topics Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detailed Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Detailed Results</h2>
          {responses.map((response, index) => {
            const isCorrect = response.isCorrect;

            return (
              <Card
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Question */}
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">
                          Question {index + 1}
                        </h3>
                        <p className="text-foreground mt-1">
                          {response.question}
                        </p>
                      </div>
                    </div>

                    {/* Answers */}
                    <div className="ml-9 space-y-3">
                      <div
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">
                            Your Answer:
                          </span>
                        </div>
                        <p className="mt-1">{response.answer}</p>
                      </div>

                      {!isCorrect && (
                        <div className="p-3 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              Correct Answer:
                            </span>
                          </div>
                          <p className="mt-1">{response.correctAnswer}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="p-3 rounded-lg bg-muted">
                        <h4 className="font-medium text-sm mb-1">
                          Explanation
                        </h4>
                        <p className="text-sm">{response.explanation}</p>
                      </div>

                      {/* Source link */}
                      {response.sourceUrl && (
                        <div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="text-primary hover:text-primary"
                          >
                            <a
                              href={response.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Source
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
