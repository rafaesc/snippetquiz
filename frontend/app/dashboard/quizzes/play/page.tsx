"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/contexts/QuizContext";
import { apiService } from "@/lib/api-service";

export default function QuizPlayerPage() {
  const { currentQuizId } = useQuiz();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  // Add state to maintain previous question during transition
  const [displayQuestion, setDisplayQuestion] = useState<any>(null);

  const {
    data: quiz,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["quiz", currentQuizId],
    queryFn: () => apiService.getQuiz(currentQuizId!),
    enabled: !!currentQuizId,
  });

  // Update display question when quiz data changes and not transitioning
  useEffect(() => {
    if (quiz?.question && !isTransitioning) {
      setDisplayQuestion(quiz.question);
    }
  }, [quiz?.question, isTransitioning]);

  // Add mutation for updating quiz
  const updateQuizMutation = useMutation({
    mutationFn: ({ quizId, optionId }: { quizId: number; optionId: number }) =>
      apiService.updateQuiz(quizId, optionId),
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
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
      }, 500); // Match the transition duration
    },
    onError: (error) => {
      console.error("Failed to update quiz:", error);
      setSelectedAnswer(null);
      setIsTransitioning(false);
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

  if ((!quiz || !quiz.question)) {
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

  // Use displayQuestion for rendering to maintain question during transition
  const currentQuestion = displayQuestion || quiz?.question;

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

      // Update the quiz with the selected option
      await updateQuizMutation.mutateAsync({
        quizId: parseInt(quiz.id),
        optionId: parseInt(selectedOption.id),
      });
    } catch (error) {
      setSelectedAnswer(null);
      setIsTransitioning(false);
    }
  };

  const getOptionButtonClass = (option: string) => {
    const baseClass =
      "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:border-primary hover:bg-primary/5 break-words";

    if (selectedAnswer === option) {
      return `${baseClass} border-primary bg-primary/10 text-primary font-medium`;
    }

    return `${baseClass} border-border bg-background hover:scale-[1.02]`;
  };

  return (
    <>
      <div className="bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/quizzes")}
          >
            Exit Quiz
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl space-y-6">
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
                    {currentQuestion.question}
                  </h3>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {currentQuestion.contentEntrySourceUrl && (
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
                  {currentQuestion.options.map((option: any, index: any) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className={getOptionButtonClass(option.optionText)}
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
              <p className="text-sm text-muted-foreground">
                {quiz.questionsCompleted < quiz?.totalQuestions - 1
                  ? "Moving to next question..."
                  : "Completing quiz..."}
              </p>
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              <p>Select an answer to continue</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
