"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/contexts/QuizContext";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sourceUrl: string;
}

interface Quiz {
  id: string;
  title: string;
  currentQuestionIndex: number;
  questions: QuizQuestion[];
}

// Mock quiz data
const mockQuiz: Quiz = {
  id: "1",
  title: "React & JavaScript Fundamentals",
  currentQuestionIndex: 2, // Starting at question 3 (0-indexed)
  questions: [
    {
      id: "q1",
      question: "What is the virtual DOM in React?",
      options: [
        "A copy of the real DOM stored in memory",
        "A programming concept where UI is kept in memory",
        "A JavaScript representation of the real DOM",
        "All of the above",
      ],
      correctAnswer: "All of the above",
      explanation:
        "The virtual DOM is a programming concept where a virtual representation of the real DOM is kept in memory and synced with the real DOM.",
      sourceUrl: "https://react.dev/learn/react-developer-tools",
    },
    {
      id: "q2",
      question: "Which hook is used to manage state in functional components?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correctAnswer: "useState",
      explanation:
        "useState is the primary hook for managing local state in functional components.",
      sourceUrl: "https://react.dev/reference/react/useState",
    },
    {
      id: "q3",
      question: "What does JSX stand for?",
      options: [
        "JavaScript XML",
        "JavaScript Extension",
        "Java Syntax Extension",
        "JavaScript eXtended",
      ],
      correctAnswer: "JavaScript XML",
      explanation:
        "JSX stands for JavaScript XML and allows you to write HTML-like syntax in JavaScript.",
      sourceUrl: "https://react.dev/learn/writing-markup-with-jsx",
    },
    {
      id: "q4",
      question: "Which method is used to update state in a class component?",
      options: [
        "this.updateState()",
        "this.setState()",
        "this.changeState()",
        "this.modifyState()",
      ],
      correctAnswer: "this.setState()",
      explanation:
        "this.setState() is the method used to update state in React class components.",
      sourceUrl: "https://react.dev/reference/react/Component#setstate",
    },
    {
      id: "q5",
      question: "What is the purpose of useEffect hook?",
      options: [
        "To manage component state",
        "To perform side effects in functional components",
        "To create context",
        "To optimize performance",
      ],
      correctAnswer: "To perform side effects in functional components",
      explanation:
        "useEffect lets you perform side effects in functional components, such as data fetching, subscriptions, or DOM manipulation.",
      sourceUrl: "https://react.dev/reference/react/useEffect",
    },
  ],
};

export default function QuizPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { currentQuizId, setCurrentQuizId, quizData, setQuizData } = useQuiz();

  const [quiz] = useState<Quiz>(mockQuiz);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    quiz.currentQuestionIndex
  );
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  // Set the current quiz ID when component mounts
  useEffect(() => {
    if (id && Number(id) !== currentQuizId) {
      setCurrentQuizId(Number(id));
      setQuizData(quiz);
    }
  }, [id, currentQuizId, setCurrentQuizId, quiz, setQuizData]);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleAnswerSelect = async (answer: string) => {
    if (selectedAnswer || isTransitioning) return;

    setSelectedAnswer(answer);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));

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
          // Store results in context instead of localStorage
          setQuizData({ ...quiz, userAnswers, completed: true });
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

  return (
    <>
      {/* Header remains the same */}
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
                </div>

                {/* Options */}
                <div className="space-y-3 w-full">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={getOptionButtonClass(option)}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={!!selectedAnswer || isTransitioning}
                    >
                      <div className="flex items-start space-x-3 w-full min-w-0">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-medium mt-0.5">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="flex-1 break-words min-w-0 text-center leading-relaxed">
                          {option}
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
