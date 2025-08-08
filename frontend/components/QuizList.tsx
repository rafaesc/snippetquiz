'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Quiz, QuizzesResponse } from '@/lib/api-service';

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
  onPageChange
}) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { quizzes, pagination } = quizzesData;

  const handleContinue = (quiz: Quiz) => {
    router.push(`/dashboard/quizzes/${quiz.id}/play`);
  };

  const handleDelete = async (quiz: Quiz) => {
    if (onDelete) {
      setIsDeleting(quiz.id);
      try {
        await onDelete(quiz.id);
      } catch (error) {
        console.error('Failed to delete quiz:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const isQuizCompleted = (quiz: Quiz): boolean => {
    return quiz.totalQuestions === quiz.questionsCompleted;
  };

  const getStatusBadge = (quiz: Quiz) => {
    const completed = isQuizCompleted(quiz);
    return (
      <Badge variant={completed ? 'default' : 'secondary'}>
        {completed ? 'Completed' : 'Incomplete'}
      </Badge>
    );
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
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
                    {quiz.questionsCompleted} / {quiz.totalQuestions} questions
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
                <DropdownMenuContent align="end" className="bg-background border">
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
                          Are you sure you want to delete this quiz? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(quiz)}
                          disabled={isDeleting === quiz.id}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting === quiz.id ? 'Deleting...' : 'Delete'}
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
                {quiz.topics.slice(0, 3).map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {quiz.topics.length > 3 && (
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
                <Button size="sm" variant="outline" onClick={() => onViewSummary(quiz)}>
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
                      <TableCell className="font-medium">
                        {quiz.questionsCompleted} / {quiz.totalQuestions}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(quiz)}
                      </TableCell>
                      <TableCell>
                        {quiz.contentEntriesCount}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {quiz.topics.slice(0, 2).map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                          {quiz.topics.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{quiz.topics.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border">
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
                                    Are you sure you want to delete this quiz? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(quiz)}
                                    disabled={isDeleting === quiz.id}
                                  >
                                    {isDeleting === quiz.id ? 'Deleting...' : 'Delete'}
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

      {/* Server-side Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.limit)) }, (_, i) => {
                const totalPages = Math.ceil(pagination.total / pagination.limit);
                let pageNumber;

                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (pagination.page <= 3) {
                  pageNumber = i + 1;
                } else if (pagination.page >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = pagination.page - 2 + i;
                }

                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNumber)}
                      isActive={pagination.page === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              {Math.ceil(pagination.total / pagination.limit) > 5 && pagination.page < Math.ceil(pagination.total / pagination.limit) - 2 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.limit))}
                      className="cursor-pointer"
                    >
                      {Math.ceil(pagination.total / pagination.limit)}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(Math.ceil(pagination.total / pagination.limit), pagination.page + 1))}
                  className={pagination.page === Math.ceil(pagination.total / pagination.limit) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};