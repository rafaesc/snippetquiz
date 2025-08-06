'use client';

import React from 'react';
import { ExternalLink, MoreHorizontal, Copy, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ResponsiveEntryCard } from './ResponsiveEntryCard';
import { ContentEntry } from '@/lib/api-service';


interface ResponsiveEntryTableProps {
  entries: ContentEntry[];
  getMediaTypeIcon: (type: ContentEntry['contentType']) => React.ReactElement;
  onClone: (entry: ContentEntry) => void;
  onDelete: (entry: ContentEntry) => void;
}

export const ResponsiveEntryTable: React.FC<ResponsiveEntryTableProps> = ({
  entries,
  getMediaTypeIcon,
  onClone,
  onDelete,
}) => {
  return (
    <>
      {/* Mobile Cards - visible on small screens */}
      <div className="block md:hidden space-y-3">
        {entries.map((entry) => (
          <ResponsiveEntryCard
            key={entry.id}
            entry={entry}
            getMediaTypeIcon={getMediaTypeIcon}
            onClone={onClone}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Desktop Table - visible on medium screens and up */}
      <Card className="hidden md:block">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    <div className="max-w-[300px] truncate">{entry.pageTitle}</div>
                    {entry.contentType === 'selected_text' && (
                      <div className="max-w-[300px] truncate text-sm text-muted-foreground">
                        {entry.content}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {entry.topics?.slice(0, 2).map((topic) => (
                        <Badge key={topic} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {(entry.topics?.length || 0) > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(entry.topics?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getMediaTypeIcon(entry.contentType)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onClone(entry)}>
                          <FolderOpen className="mr-2 h-4 w-4" />
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
                              <AlertDialogAction onClick={() => onDelete(entry)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};