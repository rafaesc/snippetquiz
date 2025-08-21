"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/contexts/QuizContext";
import { apiService } from "@/lib/api-service";

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentQuizId } = useQuiz();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  const {
    data: quiz,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quiz", currentQuizId],
    queryFn: () => apiService.getQuiz(currentQuizId!),
    enabled: !!currentQuizId,
  });

  const currentQuestion = quiz?.questions[currentQuestionIndex];
  const progress = quiz
    ? ((currentQuestionIndex + 1) / quiz?.questions?.length) * 100
    : 0;

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || isTransitioning) return;

    setSelectedAnswer(answer);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

    // Call TODO service when user answers a question
    try {
      console.log({
        title: `Quiz Answer Recorded`,
        description: `User answered question: "${currentQuestion.question}" with answer: "${answer}"`,
        quizId: quiz.id,
        questionId: currentQuestion.id,
        userAnswer: answer,
      });
    } catch (error) {
      console.error("Failed to create TODO for answer:", error);
      // Continue with quiz flow even if TODO creation fails
    }

    // Short delay to show selection
    setTimeout(() => {
      setIsTransitioning(true);

      // Transition delay
      setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          // Move to next question
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsTransitioning(false);
        } else {
          // Quiz completed - navigate to summary
          router.push(`/dashboard/quizzes/${id}/summary`);
        }
      }, 300);
    }, 500);
  };

  const getOptionButtonClass = (option: string) => {
    const baseClass =
      "w-full p-4 text-left rounded-lg border-2 transition-all duration-200 hover:border-primary hover:bg-primary/5 break-words";

    if (selectedAnswer === option) {
      return `${baseClass} border-primary bg-primary/10 text-primary font-medium`;
    }

    return `${baseClass} border-border bg-background hover:scale-[1.02]`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading quiz...</p>
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

  if (
    !quiz ||
    !quiz.questions ||
    quiz.questions.length === 0 ||
    !currentQuestion?.question
  ) {
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

  return (
    <>
      {/* Header */}
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

      {/* Quiz Content */}
      <div className="flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Progress Section */}
          <div className="text-center space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </h2>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card
            className={`transition-all duration-300 ${
              isTransitioning
                ? "opacity-0 scale-95 translate-y-4"
                : "opacity-100 scale-100 translate-y-0"
            }`}
          >
            <CardContent className="p-4 md:p-6">
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                  {/* Show content source info */}
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

                {/* Options */}
                <div className="space-y-3 w-full">
                  {currentQuestion.options.map((option, index) => (
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
                        <span className="flex-1 break-words min-w-0 text-center leading-relaxed">
                          {option.optionText}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>

                {/* Selection Feedback */}
                {selectedAnswer && (
                  <div className="text-center animate-fade-in">
                    <p className="text-sm text-muted-foreground">
                      {currentQuestionIndex < quiz.questions.length - 1
                        ? "Moving to next question..."
                        : "Completing quiz..."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Select an answer to continue</p>
          </div>
        </div>
      </div>
    </>
  );
}
