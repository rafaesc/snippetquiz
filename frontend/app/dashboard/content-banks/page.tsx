'use client';

import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Globe, FileText, Video, MoreHorizontal, Edit, Copy, Trash2, FolderOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ResponsiveEntryTable } from '@/components/ResponsiveEntryTable';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiService, ContentBank, ContentEntry } from '@/lib/api-service';

type View = 'list' | 'bank';
type MediaType = ContentEntry['contentType'];

const getMediaTypeIcon = (type: MediaType) => {
  switch (type) {
    case 'full_html':
      return <Globe className="h-4 w-4 text-muted-foreground" />;
    case 'selected_text':
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    case 'video_transcript':
      return <Video className="h-4 w-4 text-muted-foreground" />;
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />;
  }
};

export default function ContentBanks() {
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedBank, setSelectedBank] = useState<ContentBank | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBankId, setEditingBankId] = useState<number | null>(null);
  const [editingBankName, setEditingBankName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentBankPage, setCurrentBankPage] = useState(1);
  const [showCreateBankDialog, setShowCreateBankDialog] = useState(false);
  const [newBankName, setNewBankName] = useState('');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const entriesPerPage = 10;
  const banksPerPage = 9;

  // Fetch content banks
  const { data: banksData, isLoading: banksLoading, error: banksError } = useQuery({
    queryKey: ['contentBanks', currentBankPage, banksPerPage, searchTerm],
    queryFn: () => apiService.getContentBanks(currentBankPage, banksPerPage, searchTerm || undefined),
  });

  // Fetch content entries for selected bank
  const { data: entriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ['contentEntries', selectedBank?.id, currentPage, entriesPerPage, searchTerm],
    queryFn: () => {
      if (!selectedBank) return null;
      return apiService.getContentEntries(selectedBank.id, currentPage, entriesPerPage, searchTerm || undefined);
    },
    enabled: !!selectedBank && currentView === 'bank',
  });

  // Create content bank mutation
  const createBankMutation = useMutation({
    mutationFn: apiService.createContentBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
      setShowCreateBankDialog(false);
      setNewBankName('');
      toast({
        title: 'Success',
        description: 'Content bank created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update content bank mutation
  const updateBankMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string } }) =>
      apiService.updateContentBank(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
      setEditingBankId(null);
      setEditingBankName('');
      toast({
        title: 'Success',
        description: 'Content bank updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete content bank mutation
  const deleteBankMutation = useMutation({
    mutationFn: apiService.deleteContentBank,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
      toast({
        title: 'Success',
        description: 'Content bank deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Duplicate content bank mutation
  const duplicateBankMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name?: string }) =>
      apiService.duplicateContentBank(id, name ? { name } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
      toast({
        title: 'Success',
        description: 'Content bank duplicated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete content entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: apiService.deleteContentEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentEntries'] });
      queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
      toast({
        title: 'Success',
        description: 'Content entry deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Clone content entry mutation
  const cloneEntryMutation = useMutation({
    mutationFn: ({ id, bankId }: { id: number; bankId: number }) =>
      apiService.cloneContentEntry(id, bankId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contentEntries'] });
      queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
      toast({
        title: 'Success',
        description: 'Content entry duplicated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleViewBank = (bank: ContentBank) => {
    setSelectedBank(bank);
    setCurrentView('bank');
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedBank(null);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleStartEdit = (bank: ContentBank) => {
    setEditingBankId(bank.id);
    setEditingBankName(bank.name);
  };

  const handleSaveEdit = () => {
    if (editingBankId && editingBankName.trim()) {
      updateBankMutation.mutate({
        id: editingBankId,
        data: { name: editingBankName.trim() }
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingBankId(null);
    setEditingBankName('');
  };

  const handleCreateBank = () => {
    if (newBankName.trim()) {
      createBankMutation.mutate({ name: newBankName.trim() });
    }
  };

  const handleDuplicateBank = (bank: ContentBank) => {
    duplicateBankMutation.mutate({
      id: bank.id,
      name: `${bank.name} (Copy)`
    });
  };

  const handleDeleteBank = (bank: ContentBank) => {
    deleteBankMutation.mutate(bank.id);
  };

  const handleDeleteEntry = (entry: ContentEntry) => {
    deleteEntryMutation.mutate(entry.id);
  };

  const handleCloneEntry = (entry: ContentEntry) => {
    if (selectedBank) {
      cloneEntryMutation.mutate({
        id: entry.id,
        bankId: selectedBank.id
      });
    }
  };

  const currentBanks = banksData?.contentBanks || [];
  const totalBankPages = banksData ? Math.ceil(banksData.pagination.total / banksPerPage) : 0;
  const totalEntryPages = entriesData ? Math.ceil(entriesData.pagination.total / entriesPerPage) : 0;

  if (currentView === 'bank' && selectedBank) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="flex items-center w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Banks</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{selectedBank.name}</h1>
              <p className="text-sm text-muted-foreground">
                {entriesData?.pagination.total || 0} entries
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {entriesLoading && (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading entries...</div>
          </div>
        )}

        {/* Entries Table/Cards */}
        {!entriesLoading && (
          <ResponsiveEntryTable
            entries={entriesData?.entries || []}
            getMediaTypeIcon={getMediaTypeIcon}
            onDelete={handleDeleteEntry}
            onClone={handleCloneEntry}
          />
        )}

        {/* Pagination */}
        {totalEntryPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalEntryPages) }, (_, i) => {
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
                })}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(Math.min(totalEntryPages, currentPage + 1))}
                    className={currentPage === totalEntryPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Banks</h1>
          <p className="text-muted-foreground">Manage your content collections</p>
        </div>
        <Dialog open={showCreateBankDialog} onOpenChange={setShowCreateBankDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center w-fit rounded-full">
              <Plus className="h-4 w-4" />
              <span>Create New Bank</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Content Bank</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter bank name..."
                value={newBankName}
                onChange={(e) => setNewBankName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBank();
                }}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  className="w-fit rounded-full"
                  variant="outline" onClick={() => setShowCreateBankDialog(false)}>
                  Cancel
                </Button>
                <Button
                  className="w-fit rounded-full"
                  onClick={handleCreateBank}
                  disabled={createBankMutation.isPending || !newBankName.trim()}
                >
                  {createBankMutation.isPending ? 'Creating...' : 'Create Bank'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search banks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error state */}
      {banksError && (
        <div className="flex justify-center py-8">
          <div className="text-destructive">Error loading content banks</div>
        </div>
      )}

      {/* Banks Grid */}
      {!banksError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentBanks.map((bank) => (
            <Card key={bank.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {editingBankId === bank.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <Input
                        value={editingBankName}
                        onChange={(e) => setEditingBankName(e.target.value)}
                        className="h-8"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={updateBankMutation.isPending}
                      >
                        {updateBankMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <CardTitle className="text-lg">{bank.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewBank(bank)}>
                            <FolderOpen className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStartEdit(bank)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicateBank(bank)}
                            disabled={duplicateBankMutation.isPending}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
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
                                <AlertDialogTitle>Delete Content Bank</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{bank.name}"? This will permanently delete all {bank.entry_count || 0} entries in this bank. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBank(bank)}
                                  disabled={deleteBankMutation.isPending}
                                >
                                  {deleteBankMutation.isPending ? 'Deleting...' : 'Delete Bank'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{bank.entry_count || 0} entries</span>
                    <span>Created {new Date(bank.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewBank(bank)}
                    className="w-fit rounded-full"
                  >
                    View Contents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Banks Pagination */}
      {totalBankPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentBankPage(Math.max(1, currentBankPage - 1))}
                  className={currentBankPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalBankPages) }, (_, i) => {
                const page = i + Math.max(1, currentBankPage - 2);
                if (page > totalBankPages) return null;
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentBankPage(page)}
                      isActive={currentBankPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentBankPage(Math.min(totalBankPages, currentBankPage + 1))}
                  className={currentBankPage === totalBankPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}