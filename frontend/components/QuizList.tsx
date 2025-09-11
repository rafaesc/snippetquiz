"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Eye, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Quiz, QuizzesResponse } from "@/lib/types";
import { useQuiz } from "@/contexts/QuizContext";

interface QuizListProps {
  quizzesData: QuizzesResponse;
  onViewSummary: (quiz: Quiz) => void;
  onDelete?: (quizId: string) => Promise<void>;
  onPageChange?: (page: number) => void;
}

export const QuizList: React.FC<QuizListProps> = ({
  quizzesData,
  onViewSummary,
  onDelete,
}) => {
  const { setCurrentQuizId } = useQuiz();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { quizzes } = quizzesData;

  const handleContinue = (quiz: Quiz) => {
    setCurrentQuizId(Number(quiz.id));
    router.push("/dashboard/quizzes/play");
  };

  const handleDelete = async (quiz: Quiz) => {
    if (onDelete) {
      setIsDeleting(quiz.id);
      try {
        await onDelete(quiz.id);
      } catch (error) {
        console.error("Failed to delete quiz:", error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const isQuizCompleted = (quiz: Quiz): boolean => {
    return quiz.questionsCount === quiz.questionsCompleted && quiz.status === 'READY';
  };

  const getStatusBadge = (quiz: Quiz) => {
    if (quiz.status === "IN_PROGRESS") {
      return (
        <Badge variant="outline">
          Processing
        </Badge>
      );
    }
    
    const completed = isQuizCompleted(quiz);
    return (
      <Badge variant={completed ? "default" : "secondary"}>
        {completed ? "Completed" : "Incomplete"}
      </Badge>
    );
  };

  // Mobile card component
  const QuizCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const completed = isQuizCompleted(quiz);

    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm font-medium">
                    {quiz.questionsCompleted} / {quiz.questionsCount} questions
                  </span>
                  {getStatusBadge(quiz)}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-background border"
                >
                  {!completed && (
                    <DropdownMenuItem onClick={() => handleContinue(quiz)}>
                      <Play className="mr-2 h-4 w-4" />
                      Continue
                    </DropdownMenuItem>
                  )}
                  {completed && (
                    <DropdownMenuItem onClick={() => onViewSummary(quiz)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Summary
                    </DropdownMenuItem>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this quiz? This action
                          cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(quiz)}
                          disabled={isDeleting === quiz.id}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting === quiz.id ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Content entries */}
            <div>
              <p className="text-sm text-muted-foreground">
                {quiz.contentEntriesCount} content entries used
              </p>
            </div>

            {/* Topics */}
            <div>
              <div className="flex flex-wrap gap-1">
                {(quiz?.topics || [])?.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {(quiz?.topics || [])?.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{quiz.topics.length - 3}
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-2">
              {!completed ? (
                <Button size="sm" onClick={() => handleContinue(quiz)}>
                  <Play className="h-4 w-4 mr-1" />
                  Continue
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewSummary(quiz)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Summary
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Mobile Cards - visible on small screens */}
        <div className="block md:hidden space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>

        {/* Desktop Table - visible on medium screens and up */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creation Date</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Content Entries</TableHead>
                    <TableHead>Topics</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizzes.map((quiz) => {
                    const completed = isQuizCompleted(quiz);

                    return (
                      <TableRow key={quiz.id}>
                        <TableCell className="text-muted-foreground">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{quiz.name || "N/A"}</TableCell>
                        <TableCell className="font-medium">
                          {quiz.questionsCompleted} / {quiz.questionsCount}
                        </TableCell>
                        <TableCell>{getStatusBadge(quiz)}</TableCell>
                        <TableCell>{quiz.contentEntriesCount}</TableCell>
                        <TableCell>
                          {(quiz?.topics || []).length > 2 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-wrap gap-1 cursor-pointer">
                                  {(quiz?.topics || [])
                                    .slice(0, 2)
                                    .map((topic) => (
                                      <Badge
                                        key={topic}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {topic}
                                      </Badge>
                                    ))}
                                  {(quiz?.topics || []).length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{(quiz?.topics || []).length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <div className="flex flex-wrap gap-1">
                                  {(quiz?.topics || []).map((topic) => (
                                    <Badge
                                      key={topic}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {(quiz?.topics || []).map((topic) => (
                                <Badge
                                  key={topic}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="bg-background border"
                            >
                              {!completed && (
                                <DropdownMenuItem
                                  onClick={() => handleContinue(quiz)}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Continue
                                </DropdownMenuItem>
                              )}
                              {completed && (
                                <DropdownMenuItem
                                  onClick={() => onViewSummary(quiz)}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Summary
                                </DropdownMenuItem>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Quiz
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this quiz?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(quiz)}
                                      disabled={isDeleting === quiz.id}
                                    >
                                      {isDeleting === quiz.id
                                        ? "Deleting..."
                                        : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
