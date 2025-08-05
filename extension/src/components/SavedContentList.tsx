import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ChevronDown, ChevronRight, FileText, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { apiService, ContentEntry } from "../lib/api-service";

interface SavedContentListProps {
  selectedBankId: string;
}

export const SavedContentList = ({ selectedBankId }: SavedContentListProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Query to fetch content entries for the selected bank
  const { data, isLoading, error } = useQuery({
    queryKey: ['contentEntries', selectedBankId],
    queryFn: () => apiService.contentEntry.getByBank(selectedBankId),
    enabled: !!selectedBankId, // Only run query if selectedBankId is available
  });

  // Mutation for deleting content entries
  const deleteContentMutation = useMutation({
    mutationFn: (contentId: number) => apiService.contentEntry.delete(contentId),
    onSuccess: () => {
      // Invalidate and refetch the content entries query after successful deletion
      queryClient.invalidateQueries({ queryKey: ['contentEntries', selectedBankId] });
    },
    onError: (error) => {
      console.error('Error deleting content entry:', error);
    }
  });

  const handleDeleteContent = (contentId: number) => {
    deleteContentMutation.mutate(contentId);
  };

  const truncateText = (text: string, maxLength: number = 80) => {
    return text?.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const truncateUrl = (url: string, maxLength: number = 40) => {
    return url?.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  const contentEntries = data?.entries || [];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 h-auto font-medium text-foreground"
        >
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span>Saved Content</span>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
              {isLoading ? "..." : contentEntries.length}
            </span>
          </div>
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-2 mt-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 mx-auto mb-2 opacity-50 animate-spin" />
            <p className="text-sm">Loading content...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p className="text-sm">Error loading content</p>
            <p className="text-xs mt-1">Please try again later</p>
          </div>
        ) : contentEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content saved yet</p>
            <p className="text-xs mt-1">Start saving content to this bank!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {contentEntries.map((item: ContentEntry) => (
              <div
                key={item.id}
                className="group bg-card border border-border rounded-md p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground leading-relaxed break-words">
                      {truncateText(item.content || "")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 truncate"
                          title={item.sourceUrl}
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{truncateUrl(item.sourceUrl)}</span>
                        </a>
                      )}
                      {item.pageTitle && (
                        <span className="text-xs text-muted-foreground truncate">
                          {truncateText(item.pageTitle, 30)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteContent(item.id)}
                    title="Delete content"
                    disabled={deleteContentMutation.isPending}
                  >
                    {deleteContentMutation.isPending && deleteContentMutation.variables === item.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};