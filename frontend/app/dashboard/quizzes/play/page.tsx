"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/contexts/QuizContext";
import { apiService } from "@/lib/api-service";
import { useQuizWebSocket } from "@/hooks/useQuizWebSocket";
import { HorizontalQuizGenerationLoader } from "@/components/HorizontalQuizGenerationLoader";
import { QuizQuestion, QuizQuestionOption } from "@/lib/types";

export default function QuizPlayerPage() {
  const { currentQuizId } = useQuiz();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Add state to maintain previous question during transition
  const [displayQuestion, setDisplayQuestion] = useState<any>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // WebSocket hook for quiz generation
  const { 
    generateQuiz, 
    progress: wsProgress, 
    isGenerating, 
    progressPercentage, 
    isComplete, 
  } = useQuizWebSocket();

  const {
    data: quiz,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quiz", currentQuizId],
    queryFn: () => apiService.getQuiz(currentQuizId!),
    enabled: !!currentQuizId,
    staleTime: 0,
  });

  useEffect(() => {
    if ((quiz?.status === "IN_PROGRESS" || quiz?.status === "PREPARE") && !isGenerating && !isComplete) {
      generateQuiz();
    }
  }, [quiz?.status, isGenerating, isComplete, generateQuiz]);

  // Handle WebSocket completion - refetch quiz data
  useEffect(() => {
    if (isComplete) {
      refetch();
    }
  }, [isComplete, refetch]);

  // Handle wsProgress updates - refetch when new questions are generated
  useEffect(() => {
    if (wsProgress && quiz) {
      const shouldRefetch = 
        quiz.totalQuestions === 0 || 
        (quiz.questionsCompleted === quiz.totalQuestions && (quiz.status === 'IN_PROGRESS' || quiz.status === 'PREPARE'));
      
      if (shouldRefetch) {
        refetch();
      }
    }
  }, [wsProgress, quiz, refetch]);

  // Update display question when quiz data changes and not transitioning
  useEffect(() => {
    if (quiz?.question && !isTransitioning) {
      setDisplayQuestion(quiz.question);
    }
  }, [quiz?.question, isTransitioning]);

  // Add mutation for updating quiz
  const updateQuizMutation = useMutation({
    mutationFn: ({ quizId, optionId }: { quizId: string; optionId: number }) =>
      apiService.updateQuiz(quizId, optionId),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      
      // Show answer feedback for 2 seconds before transitioning
      setShowAnswerFeedback(true);
      
      setTimeout(async () => {
        // Start transition out
        setIsTransitioning(true);

        // Check if quiz is completed (no more questions)
        if (data?.completed) {
          // Quiz is completed, redirect to summary page
          router.push(`/dashboard/quizzes/${currentQuizId}/summary`);
          return;
        }
    
        // Refetch the quiz data to get the next question
        const updatedQuiz = await refetch();
    
        // Wait for transition animation, then update display
        setTimeout(() => {
          // Update display question with new data
          if (updatedQuiz.data?.question) {
            setDisplayQuestion(updatedQuiz.data.question);
          }
    
          // Reset states
          setSelectedAnswer(null);
          setIsTransitioning(false);
          setShowAnswerFeedback(false);
          setIsAnswerCorrect(null);
        }, 500); // Match the transition duration
      }, isAnswerCorrect ? 500 : 1500);
    },
    onError: (error) => {
      console.error("Failed to update quiz:", error);
      setSelectedAnswer(null);
      setIsTransitioning(false);
      setShowAnswerFeedback(false);
      setIsAnswerCorrect(null);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if ((!quiz)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">No questions available</p>
          <Button
            onClick={() => router.push("/dashboard/quizzes")}
            className="mt-4"
          >
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive">Failed to load quiz</p>
          <Button
            onClick={() => router.push("/dashboard/quizzes")}
            className="mt-4"
          >
            Back to Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // Check if we need to show waiting message
  const shouldShowWaitingMessage = quiz && (
    quiz.totalQuestions === 0 || 
    (quiz.questionsCompleted === quiz.totalQuestions && (quiz.status === 'IN_PROGRESS' || quiz.status === 'PREPARE'))
  );

  // Use displayQuestion for rendering to maintain question during transition
  const currentQuestion = (displayQuestion || quiz?.question) as QuizQuestion | null;

  const progress = quiz
    ? ((quiz.questionsCompleted) / (quiz?.totalQuestions || 1)) * 100
    : 0;

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || isTransitioning || updateQuizMutation.isPending) {
      return;
    }

    setSelectedAnswer(answer);

    try {
      // Find the selected option to get its ID
      const selectedOption = currentQuestion?.options.find(
        (option: any) => option.optionText === answer
      );

      if (!selectedOption || !quiz?.id) {
        throw new Error("Invalid option or quiz ID");
      }

      // Update the quiz with the selected option and get the response
      const response = await updateQuizMutation.mutateAsync({
        quizId: quiz.id,
        optionId: selectedOption.id,
      });

      // Use the API response to determine if the answer is correct
      setIsAnswerCorrect(response.correctOptionId === selectedOption.id);
    } catch (error) {
      setSelectedAnswer(null);
      setIsTransitioning(false);
      setShowAnswerFeedback(false);
      setIsAnswerCorrect(null);
    }
  };

  const getOptionButtonClass = (option: QuizQuestionOption) => {
    const baseClass =
      "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 break-words";

    // If showing answer feedback, apply correct/incorrect styling
    if (showAnswerFeedback) {
      // Use the correctOptionId from the API response to determine correct answer
      const isCorrectOption = updateQuizMutation.data?.correctOptionId === option.id;
      
      if (isCorrectOption) {
        // Correct answer - always green
        return `${baseClass} border-green-500 bg-green-200 dark:bg-green-900/30 text-green dark:text-green-200 font-medium`;
      } else if (selectedAnswer === option.optionText) {
        // Selected wrong answer - red
        return `${baseClass} border-red-500 bg-red-200 dark:bg-red-900/30 text-red dark:text-red-200 font-medium`;
      } else {
        // Other options - dimmed
        return `${baseClass} border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400`;
      }
    }

    // Normal state (before answer selection)
    if (selectedAnswer === option.optionText) {
      return `${baseClass} border-primary bg-primary/10 dark:bg-primary/20 text-primary font-medium`;
    }

    return `${baseClass} border-border bg-background hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:scale-[1.02]`;
  };

  return (
    <>
      <div className="bg-background">
        {isGenerating && (
          <HorizontalQuizGenerationLoader 
            progress={wsProgress?.progress || null} 
            progressPercentage={progressPercentage} 
          />
        )}
        
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/quizzes")}
            className="text-foreground"
          >
            Exit Quiz
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Show waiting message when no questions available or all completed but still generating */}
          {shouldShowWaitingMessage ? (
            <div className="text-center space-y-4">
              <Card>
                <CardContent className="p-8">
                  <div className="space-y-4">
                    <div className="text-xl font-semibold">
                      Generating More Questions...
                    </div>
                    <p className="text-muted-foreground">
                      Please wait while we generate more questions for your quiz. This may take a few moments.
                    </p>
                    {quiz && quiz.totalQuestions > 0 && (
                      <p className="text-sm text-muted-foreground">
                        You've completed {quiz.questionsCompleted} of {quiz.totalQuestions} questions so far.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="text-center space-y-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  Question {quiz.questionsCompleted + 1} of {quiz?.totalQuestions}
                </h2>
                <Progress value={progress} className="h-2" />
              </div>

              <Card
                className={`transition-all duration-500 ease-in-out ${
                  isTransitioning
                    ? "opacity-0 scale-95 translate-y-4"
                    : "opacity-100 scale-100 translate-y-0"
                }`}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold leading-relaxed">
                        {currentQuestion?.question}
                      </h3>
                      <div className="mt-2 text-sm text-muted-foreground">
                        {currentQuestion?.contentEntrySourceUrl && (
                          <a
                            href={currentQuestion.contentEntrySourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Source
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 w-full">
                      {currentQuestion?.options.map((option: any, index: any) => (
                        <Button
                          key={option.id}
                          variant="outline"
                          className={getOptionButtonClass(option)}
                          onClick={() => handleAnswerSelect(option.optionText)}
                          disabled={!!selectedAnswer || isTransitioning}
                        >
                          <div className="flex items-start space-x-3 w-full min-w-0">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium mt-0.5">
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="flex-1 break-words min-w-0 text-left leading-relaxed">
                              {option.optionText}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedAnswer ? (
                <div className="text-center animate-fade-in">
                  {showAnswerFeedback ? (
                    <div className="space-y-2">
                      <p className={`text-lg font-semibold ${
                        isAnswerCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isAnswerCorrect ? '✓ Correct!' : '✗ Incorrect'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {quiz.questionsCompleted < quiz?.totalQuestions - 1 || shouldShowWaitingMessage
                          ? "Moving to next question..."
                          : "Completing quiz..."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Checking answer...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Select an answer to continue</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
