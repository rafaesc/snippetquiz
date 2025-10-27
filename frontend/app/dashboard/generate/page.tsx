"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Sparkles,
  AlertCircle,
  Globe,
  FileText,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiService } from "@/lib/api-service";
import { ContentEntry } from "@/lib/types";
import { useQuiz } from "@/contexts/QuizContext";
import { useQueryClient } from "@tanstack/react-query";

type MediaType = ContentEntry["contentType"];

export default function GenerateQuiz() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setCurrentQuizId } = useQuiz();
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);
  const [createQuizError, setCreateQuizError] = useState<string | null>(null);

  const entriesPerPage = 10;

  // Fetch content banks
  const {
    data: banksData,
    isLoading: banksLoading,
    error: banksError,
  } = useQuery({
    queryKey: ["contentBanks"],
    queryFn: () => apiService.getContentBanks(1, 100), // Get all banks
    staleTime: 0,
  });

  // Fetch content entries for selected bank with pagination
  const {
    data: entriesData,
    isLoading: entriesLoading,
    error: entriesError,
  } = useQuery({
    queryKey: ["contentEntries", selectedBankId, currentPage],
    queryFn: () =>
      apiService.getContentEntries(selectedBankId!, currentPage, entriesPerPage),
    enabled: !!selectedBankId, // Only run when a bank is selected
    staleTime: 0,
  });

  const banks = banksData?.content || [];
  const entries = entriesData?.content || [];
  const selectedBank = banks.find((bank) => bank.id === selectedBankId);
  const totalEntryPages = entriesData ? entriesData.page.totalPages : 0;

  const getMediaTypeIcon = (type: MediaType) => {
    switch (type) {
      case "full_html":
        return <Globe className="h-4 w-4 text-primary" />;
      case "selected_text":
        return <FileText className="h-4 w-4 text-secondary-foreground" />;
      case "video_transcript":
        return <Video className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedBank || !entriesData || entriesData.page.totalElements === 0)
      return;

    try {
      setIsCreatingQuiz(true);
      setCreateQuizError(null);

      // Step 1: Create the quiz using the new API endpoint
      const createdQuiz = await apiService.createQuiz({
        bankId: selectedBankId!,
      });

      // Step 2: If quiz creation is successful, start WebSocket generation
      if (createdQuiz.quizId) {
        setCurrentQuizId(createdQuiz.quizId);
        router.push("/dashboard/quizzes/play");
      } else {
        setIsCreatingQuiz(false);
      }
    } catch (error: any) {
      setCreateQuizError(
        error.message || "Failed to create quiz. Please try again."
      );
      setIsCreatingQuiz(false);
    }
  };

  // Reset pagination when bank changes
  const handleBankChange = (bankId: string) => {
    setSelectedBankId(bankId);
    queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    setCurrentPage(1);
  };

  // Clear create quiz error
  const clearCreateQuizError = () => {
    setCreateQuizError(null);
  };

  // Loading state
  if (banksLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Generate Quiz</h1>
          <p className="text-muted-foreground">Loading content banks...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (banksError) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Generate Quiz</h1>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load content banks. Please try again.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Quiz Creation Error Dialog */}
      <AlertDialog open={!!createQuizError} onOpenChange={clearCreateQuizError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Quiz Creation Error
            </AlertDialogTitle>
            <AlertDialogDescription>{createQuizError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={clearCreateQuizError}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Generate Quiz</h1>
        <p className="text-muted-foreground">
          Create a new quiz from your content banks
        </p>
      </div>

      {/* Select Bank */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Select Content Bank</span>
            <Button variant="outline" size="sm" asChild className="text-xs">
              <a
                href="/dashboard/content-banks"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Edit in Content Banks
              </a>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedBankId ? selectedBankId.toString() : undefined} onValueChange={handleBankChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a content bank..." />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank.id} value={bank.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{bank.name}</span>
                    <Badge variant="secondary" className="ml-2">
                      {bank.contentEntries || 0} items
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedBank && (
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{selectedBank.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedBank.contentEntries || 0} content entries available
                  </p>
                </div>
                <Badge variant="outline">
                  Created{" "}
                  {new Date(selectedBank.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Entries */}
      {selectedBank && (
        <Card>
          <CardHeader>
            <CardTitle>Content Preview</CardTitle>
            <p className="text-sm text-muted-foreground">
              {entriesLoading
                ? "Loading entries..."
                : entriesError
                ? "Failed to load entries"
                : entriesData
                ? `Showing ${entries.length} of ${entriesData.page.totalElements} entries (Page ${currentPage} of ${totalEntryPages})`
                : "No entries found"}
            </p>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">
                  Loading content entries...
                </p>
              </div>
            ) : entriesError ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load content entries for this bank.
                </AlertDescription>
              </Alert>
            ) : entries.length > 0 ? (
              <>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getMediaTypeIcon(entry.contentType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">
                            {entry.pageTitle || "Untitled"}
                          </h4>
                          {entry.questionsGenerated && (
                            <Badge
                              variant="default"
                              className="text-xs bg-green-100 text-green-800 hover:bg-green-200"
                            >
                              Questions Generated
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          {entry.sourceUrl && (
                            <a
                              href={entry.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Source
                            </a>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.topics && entry.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.topics.slice(0, 3).map((topic) => (
                              <Badge
                                key={topic}
                                variant="outline"
                                className="text-xs"
                              >
                                {topic}
                              </Badge>
                            ))}
                            {entry.topics.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{entry.topics.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalEntryPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: Math.min(5, totalEntryPages) },
                          (_, i) => {
                            const page = i + Math.max(1, currentPage - 2);
                            if (page > totalEntryPages) return null;
                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                        )}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalEntryPages, currentPage + 1)
                              )
                            }
                            className={
                              currentPage === totalEntryPages
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
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This content bank appears to be empty. Add some content
                  entries to generate a quiz.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <div className="text-center space-y-4">
        <Button
          size="lg"
          onClick={handleGenerateQuiz}
          disabled={
            !selectedBank ||
            !entriesData ||
            entriesData.page.totalElements === 0 ||
            entriesLoading ||
            isCreatingQuiz
          }
          className="px-8"
        >
          <Sparkles className="h-5 w-5 mr-2" />
          {isCreatingQuiz ? "Creating Quiz..." : "Generate Quiz"}
        </Button>

        {!selectedBank && (
          <p className="text-sm text-muted-foreground">
            Select a content bank to enable quiz generation
          </p>
        )}

        {selectedBank &&
          !entriesLoading &&
          entriesData &&
          entriesData.page.totalElements === 0 && (
            <p className="text-sm text-muted-foreground">
              The selected bank needs content entries to generate a quiz
            </p>
          )}
      </div>
    </div>
  );
}
