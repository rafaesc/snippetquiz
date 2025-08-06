'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ExternalLink, ChevronLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuizList } from '@/components/QuizList';
import { apiService, Quiz, QuizResponse, QuizSummaryResponse } from '@/lib/api-service';

interface QuizWithDetails extends Quiz {
  responses?: QuizResponse[];
  summary?: QuizSummaryResponse;
}

export default function GeneratedQuizzesPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithDetails | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch quizzes using TanStack Query
  const {
    data: quizzesData,
    isLoading: isLoadingQuizzes,
    error: quizzesError,
    refetch: refetchQuizzes
  } = useQuery({
    queryKey: ['quizzes', page, limit],
    queryFn: () => apiService.getQuizzes(page, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch quiz responses when a quiz is selected
  const {
    data: responsesData,
    isLoading: isLoadingResponses,
  } = useQuery({
    queryKey: ['quiz-responses', selectedQuiz?.id],
    queryFn: () => selectedQuiz ? apiService.getQuizResponses(selectedQuiz.id) : Promise.resolve(null),
    enabled: !!selectedQuiz && selectedQuiz.questionsCompleted === selectedQuiz.totalQuestions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch quiz summary when a quiz is selected
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
  } = useQuery({
    queryKey: ['quiz-summary', selectedQuiz?.id],
    queryFn: () => selectedQuiz ? apiService.getQuizSummary(selectedQuiz.id) : Promise.resolve(null),
    enabled: !!selectedQuiz && selectedQuiz.questionsCompleted === selectedQuiz.totalQuestions,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleViewSummary = (quiz: Quiz) => {
    const quizWithDetails: QuizWithDetails = {
      ...quiz,
      responses: responsesData?.responses,
      summary: summaryData as QuizSummaryResponse
    };
    setSelectedQuiz(quizWithDetails);
  };

  const handleBackToList = () => {
    setSelectedQuiz(null);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Loading state
  if (isLoadingQuizzes) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Generated Quizzes</h1>
          <p className="text-muted-foreground">View and manage your quiz history</p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading quizzes...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (quizzesError) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Generated Quizzes</h1>
          <p className="text-muted-foreground">View and manage your quiz history</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load quizzes: {quizzesError instanceof Error ? quizzesError.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchQuizzes()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Quiz detail view
  if (selectedQuiz) {
    const isCompleted = selectedQuiz.questionsCompleted === selectedQuiz.totalQuestions;
    const isLoading = isLoadingResponses || isLoadingSummary;
    
    return (
      <div className="p-4 md:p-6 space-y-6">
        {/* Header with back button */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBackToList} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Quiz Summary</h1>
            <p className="text-muted-foreground">
              {isCompleted ? 'Detailed results for your completed quiz' : 'Quiz in progress'}
            </p>
          </div>
        </div>

        {/* Quiz metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quiz Details</span>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(selectedQuiz.createdAt).toLocaleDateString()}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Topics Covered</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedQuiz.topics.map((topic) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress</p>
                <p className="text-lg font-semibold">
                  {selectedQuiz.questionsCompleted} / {selectedQuiz.totalQuestions}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Score</p>
                <p className="text-lg font-semibold">
                  {isCompleted && summaryData ? 
                    `${summaryData.totalCorrectAnswers} / ${summaryData.totalQuestions}` : 
                    'In Progress'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Show loading or content based on completion status */}
        {!isCompleted ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                This quiz is still in progress. Complete all questions to view detailed results.
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading quiz details...</span>
          </div>
        ) : (
          /* Questions and answers */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Questions & Answers</h2>
            {responsesData?.responses?.map((response, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Question */}
                    <div>
                      <h3 className="font-medium text-lg">Question {index + 1}</h3>
                      <p className="text-foreground mt-1">{response.question}</p>
                    </div>

                    {/* Answers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-3 rounded-lg border ${
                        response.isCorrect 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                          : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          {response.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <span className="text-sm font-medium">Your Answer</span>
                        </div>
                        <p className="mt-1">{response.answer}</p>
                      </div>

                      {!response.isCorrect && (
                        <div className="p-3 rounded-lg border bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Correct Answer</span>
                          </div>
                          <p className="mt-1">{response.correctAnswer}</p>
                        </div>
                      )}
                    </div>

                    {/* Explanation */}
                    <div className="p-3 rounded-lg bg-muted">
                      <h4 className="font-medium text-sm mb-1">Explanation</h4>
                      <p className="text-sm">{response.explanation}</p>
                    </div>

                    {/* Source link */}
                    {response.sourceUrl && (
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="text-primary hover:text-primary"
                        >
                          <a href={response.sourceUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Source
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Quiz list view
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Generated Quizzes</h1>
        <p className="text-muted-foreground">View and manage your quiz history</p>
      </div>

      {quizzesData?.quizzes && quizzesData.quizzes.length > 0 ? (
        <>
          <QuizList quizzesData={quizzesData} onViewSummary={handleViewSummary} />

          
          {/* Pagination */}
          {quizzesData.pagination.total > limit && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, quizzesData.pagination.total)} of {quizzesData.pagination.total} quizzes
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {page} of {Math.ceil(quizzesData.pagination.total / limit)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(quizzesData.pagination.total / limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No quizzes found. Create your first quiz to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}