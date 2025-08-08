'use client';

import React from 'react';
import { ExternalLink, MoreHorizontal, Copy, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ContentEntry } from '@/lib/api-service';

interface ResponsiveEntryCardProps {
  entry: ContentEntry;
  getMediaTypeIcon: (type: ContentEntry['contentType']) => React.ReactElement;
  onClone: (entry: ContentEntry) => void;
  onDelete: (entry: ContentEntry) => void;
}

export const ResponsiveEntryCard: React.FC<ResponsiveEntryCardProps> = ({
  entry,
  getMediaTypeIcon,
  onClone,
  onDelete,
}) => {
  return (
    <Card className="p-4">
      <CardContent className="p-0 space-y-3">
        {/* Title and Actions Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight break-words">
              {entry.pageTitle}
              {entry.contentType === 'selected_text' && (
                <div className="text-xs text-muted-foreground">
                  {entry.content}
                </div>
              )}

            </h3>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="h-8 w-8 p-0"
            >
              <a href={entry.sourceUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onClone(entry)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Clone to...
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{entry.pageTitle}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(entry)}
                        className="bg-destructive hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-1">
          {entry.topics?.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
          {(entry.topics?.length || 0) > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{(entry.topics?.length || 0) - 3}
            </Badge>
          )}
        </div>

        {/* Footer with Date and Type */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-1">
            {getMediaTypeIcon(entry.contentType)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};