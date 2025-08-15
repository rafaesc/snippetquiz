import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, ContentBank } from '../lib/api-service';
import chromeStorage from '../lib/chrome-storage';
import { Button } from './ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ChevronDown, ChevronRight, ExternalLink, Trash2, FileText, Link as LinkIcon, LogOut, Settings, ChevronLeft, ChevronRight as ChevronRightIcon, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import tabService from '../lib/tab-service';
import { getYouTubeTranscriptFromTab } from '../lib/content-script-service';
import { isYouTubeTab, extractVideoId } from '../lib/youtube-service';

function Dashboard() {
    const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
    const [currentBank, setCurrentBank] = useState<ContentBank | null>(null);
    const [isContentExpanded, setIsContentExpanded] = useState(false);
    const [showBankSelector, setShowBankSelector] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [bankPage, setBankPage] = useState(1);
    const [editingBank, setEditingBank] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [newBankName, setNewBankName] = useState('');
    const [showCreateBank, setShowCreateBank] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [isAddingPageContent, setIsAddingPageContent] = useState(false);

    const queryClient = useQueryClient();
    const itemsPerPage = 5;
    const banksPerPage = 5;

    const startEditing = (bankId: string, currentName: string) => {
        setEditingBank(bankId);
        setEditingName(currentName);
    };

    const cancelEdit = () => {
        setEditingBank(null);
        setEditingName('');
    };

    // Check authentication status
    const { data: userProfile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            try {
                const profile = await apiService.getUserProfile();
                await chromeStorage.local.set({ userId: profile.user.id });
                return profile;
            } catch (error) {
                chrome.contextMenus.remove("saveSelectedText");
                await chromeStorage.local.clear();
                console.log('Chrome storage cleared due to profile fetch failure:', error);
                throw error;
            }
        },
        retry: false,
    });

    useEffect(() => {
        if (userProfile) {
            chrome.contextMenus.create({
                id: "saveSelectedText",
                title: "Add selected text to content bank",
                contexts: ["selection"]
            });
        } else {
            chrome.contextMenus.remove("saveSelectedText");
        }
    }, [userProfile]);

    // Fetch content banks
    const { data: contentBanks } = useQuery({
        queryKey: ['contentBanks', bankPage],
        queryFn: async () => {
            return await apiService.contentBank.getAll(bankPage, banksPerPage);
        },
        retry: false,
        enabled: !!userProfile,
    });

    // Fetch content entries for selected bank
    const { data: contentEntries } = useQuery({
        queryKey: ['contentEntries', selectedBankId, currentPage],
        queryFn: async () => {
            if (!selectedBankId) return null;
            return await apiService.contentEntry.getByBank(selectedBankId, currentPage, itemsPerPage);
        },
        retry: false,
        enabled: !!selectedBankId,
    });

    // Mutations
    const createBankMutation = useMutation({
        mutationFn: (name: string) => apiService.contentBank.create({ name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
            setShowCreateBank(false);
            setNewBankName('');
        },
    });

    const updateBankMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            apiService.contentBank.update(id, { name }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
            setEditingBank(null);
            setEditingName('');
        },
    });

    const deleteBankMutation = useMutation({
        mutationFn: (id: string) => apiService.contentBank.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentBanks'] });
            // If deleted bank was selected, reset to first available bank
            if (selectedBankId === deleteBankMutation.variables) {
                setSelectedBankId(null);
                setCurrentBank(null);
            }
        },
    });

    const deleteEntryMutation = useMutation({
        mutationFn: (id: string) => apiService.contentEntry.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentEntries'] });
        },
    });

    const createContentEntryMutation = useMutation({
        mutationFn: (data: { bankId: string; type: 'full_html' | 'selected_text' | 'video_transcript'; content?: string; sourceUrl?: string; pageTitle?: string }) =>
            apiService.contentEntry.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contentEntries'] });
            setIsAddingPageContent(false);
            window.close();
        },
        onError: (error) => {
            console.error('Failed to create content entry:', error);
            setIsAddingPageContent(false);
        },
    });

    // Helper function to get regular tab data
    const getRegularTabData = async () => {
        const tabData = await tabService.getCurrentTabData();
        return {
            pageTitle: tabData.pageTitle,
            sourceUrl: tabData.sourceUrl,
            content: tabData.content,
            type: 'full_html' as const
        };
    };

    const handleGetPageContent = async () => {
        if (!selectedBankId) {
            console.error('No bank selected');
            return;
        }

        setIsAddingPageContent(true);
        try {
            // First get the current tab URL to check if it's YouTube
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentTab = tabs[0];

            if (!currentTab || !currentTab.url) {
                throw new Error('No active tab found');
            }

            let tabData: {
                pageTitle: string;
                sourceUrl: string;
                content: string;
                type: "video_transcript" | "full_html" | "selected_text";
                youtubeVideoId?: string;
                youtubeVideoDuration?: number;
                youtubeChannelId?: string | null;
                youtubeChannelName?: string | null;
                youtubeAvatarUrl?: string | null;
            };

            // Check if current tab is YouTube and has a valid video ID
            if (isYouTubeTab(currentTab.url)) {
                const videoId = await extractVideoId(currentTab.url);
                if (videoId) {
                    try {
                        // Use content script to get transcript
                        const transcript = await getYouTubeTranscriptFromTab(currentTab.id!, { videoId });
                        tabData = {
                            pageTitle: transcript.title || currentTab.title || 'YouTube Video',
                            sourceUrl: currentTab.url,
                            content: transcript.text,
                            type: 'video_transcript',
                            youtubeVideoId: videoId,
                            youtubeVideoDuration: transcript.durationMs,
                            youtubeChannelId: transcript.channel?.id,
                            youtubeChannelName: transcript.channel?.name,
                            youtubeAvatarUrl: transcript.channel?.avatarUrl,
                        }

                    } catch (error) {
                        // If transcript fails, show error instead of falling back
                        setError('Unable to get YouTube video transcript. Please refresh the page.');
                        return; // Exit early to prevent mutation
                    }
                } else {
                    // No valid videoId found, use regular tab service
                    tabData = await getRegularTabData();
                }
            } else {
                // Use regular tab service for HTML content
                tabData = await getRegularTabData();
            }

            createContentEntryMutation.mutate({
                bankId: selectedBankId,
                ...tabData
            });

        } catch (error) {
            console.error('Failed to get page content:', error);
            setIsAddingPageContent(false);
        }
    };

    const saveEdit = (bankId: string) => {
        if (editingName.trim()) {
            updateBankMutation.mutate({ id: bankId, name: editingName.trim() });
        }
    };

    const handleCreateBank = () => {
        if (newBankName.trim()) {
            createBankMutation.mutate(newBankName.trim());
        }
    };

    const handleDeleteBank = (bankId: string) => {
        if (contentBanks?.contentBanks && contentBanks.contentBanks.length > 1) {
            deleteBankMutation.mutate(bankId);
        }
    };

    const handleDeleteEntry = (entryId: string) => {
        deleteEntryMutation.mutate(entryId);
    };

    const logout = async () => {
        try {
            await apiService.logout();
            chrome.contextMenus.remove("saveSelectedText");
            await chromeStorage.local.clear();
            // Redirect to login or refresh the component
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Effect to handle selectedBankId validation and initialization
    useEffect(() => {
        const initializeSelectedBank = async () => {
            if (!contentBanks?.contentBanks?.length) return;

            try {
                const storage = await chromeStorage.local.get<{ selectedBankId?: string }>(['selectedBankId']);

                if (!storage.selectedBankId) {
                    const firstBankId = contentBanks.contentBanks[0].id;
                    await chromeStorage.local.set({ selectedBankId: firstBankId });
                    setSelectedBankId(firstBankId);
                    setCurrentBank(contentBanks.contentBanks[0]);
                } else {
                    try {
                        const selectedBank = await apiService.contentBank.get(storage.selectedBankId);
                        if (selectedBank) {
                            setSelectedBankId(storage.selectedBankId);
                            setCurrentBank(selectedBank);
                        } else {
                            const firstBankId = contentBanks.contentBanks[0].id;
                            await chromeStorage.local.set({ selectedBankId: firstBankId });
                            setSelectedBankId(firstBankId);
                            setCurrentBank(contentBanks.contentBanks[0]);
                        }
                    } catch (error) {
                        const firstBankId = contentBanks.contentBanks[0].id;
                        await chromeStorage.local.set({ selectedBankId: firstBankId });
                        setSelectedBankId(firstBankId);
                        setCurrentBank(contentBanks.contentBanks[0]);
                    }
                }
            } catch (error) {
                console.error('Error initializing selected bank:', error);
                if (contentBanks.contentBanks.length > 0) {
                    const firstBankId = contentBanks.contentBanks[0].id;
                    await chromeStorage.local.set({ selectedBankId: firstBankId });
                    setSelectedBankId(firstBankId);
                    setCurrentBank(contentBanks.contentBanks[0]);
                }
            }
        };

        initializeSelectedBank();
    }, [contentBanks]);

    // Helper functions for pagination
    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const goToBankPage = (page: number) => {
        setBankPage(page);
    };

    const handleBankSelect = async (bankId: string) => {
        try {
            const bank = await apiService.contentBank.get(bankId);
            setSelectedBankId(bankId);
            setCurrentBank(bank);
            await chromeStorage.local.set({ selectedBankId: bankId });
            setShowBankSelector(false);
        } catch (error) {
            console.error('Error selecting bank:', error);
        }
    };

    // Derived values
    const savedContent = contentEntries?.entries || [];
    const currentItems = savedContent;
    const totalPages = contentEntries?.pagination.total ? Math.ceil(contentEntries.pagination.total / itemsPerPage) : 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentBanks = contentBanks?.contentBanks || [];
    const totalBankPages = contentBanks?.pagination.total ? Math.ceil(contentBanks.pagination.total / banksPerPage) : 1;
    const bankStartIndex = (bankPage - 1) * banksPerPage;
    const bankEndIndex = bankStartIndex + banksPerPage;
    const selectedBank = selectedBankId;
    const user = userProfile?.user;

    if (showBankSelector) {
        return (
            <div className="w-full">
                {/* Header */}
                <div className="bg-gray-900/95 px-4 py-3 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-white">Content Banks</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowBankSelector(false)}
                        className="text-white "
                    >
                        Back
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {showCreateBank ? (
                        <div className="space-y-2">
                            <Input
                                placeholder="Enter bank name"
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateBank();
                                    if (e.key === 'Escape') {
                                        setShowCreateBank(false);
                                        setNewBankName('');
                                    }
                                }}
                                autoFocus
                            />
                            <div className="flex space-x-2">
                                <Button
                                    onClick={handleCreateBank}
                                    disabled={!newBankName.trim() || createBankMutation.isPending}
                                    className="flex-1"
                                >
                                    {createBankMutation.isPending ? 'Creating...' : 'Create'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateBank(false);
                                        setNewBankName('');
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            className="w-full"
                            onClick={() => setShowCreateBank(true)}
                        >
                            Create New Bank
                        </Button>
                    )}

                    <div className="space-y-2">
                        {currentBanks.map((bank) => (
                            <div
                                key={bank.id}
                                className={`p-3 border rounded-lg transition-colors ${bank.id === selectedBank
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:bg-muted/50'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        {editingBank === bank.id ? (
                                            <div className="space-y-2">
                                                <Input
                                                    value={editingName}
                                                    onChange={(e) => setEditingName(e.target.value)}
                                                    className="h-8 text-sm"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(bank.id);
                                                        if (e.key === 'Escape') cancelEdit();
                                                    }}
                                                    autoFocus
                                                />
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => saveEdit(bank.id)}
                                                        className="h-6 px-2 text-xs"
                                                        disabled={updateBankMutation.isPending}
                                                    >
                                                        {updateBankMutation.isPending ? 'Saving...' : 'Save'}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={cancelEdit}
                                                        className="h-6 px-2 text-xs"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={bank.id !== selectedBank ? 'cursor-pointer' : ''}
                                                onClick={() => {
                                                    if (bank.id !== selectedBank) {
                                                        handleBankSelect(bank.id);
                                                    }
                                                }}
                                            >
                                                <div className="font-medium">{bank.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {bank.entryCount || 0} items
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2 ml-2">
                                        {bank.id === selectedBank && (
                                            <Badge variant="default" className="text-xs">Active</Badge>
                                        )}
                                        {editingBank !== bank.id && (
                                            <>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => startEditing(bank.id, bank.name)}
                                                >
                                                    <Settings size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={(contentBanks?.contentBanks?.length || 0) <= 1 || deleteBankMutation.isPending}
                                                    onClick={() => handleDeleteBank(bank.id)}
                                                >
                                                    <Trash2 size={14} className="text-destructive" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Banks Pagination Controls */}
                    {totalBankPages > 1 && (
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                            <div className="text-xs text-muted-foreground">
                                {bankStartIndex + 1}-{Math.min(bankEndIndex, contentBanks?.pagination.total || 0)} of {contentBanks?.pagination.total || 0} banks
                            </div>
                            <div className="flex items-center space-x-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => goToBankPage(bankPage - 1)}
                                    disabled={bankPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft size={14} />
                                </Button>
                                <span className="text-xs px-2">
                                    {bankPage} / {totalBankPages}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => goToBankPage(bankPage + 1)}
                                    disabled={bankPage === totalBankPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRightIcon size={14} />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-gray-900/95 px-4 py-3 flex items-center justify-between">
                <h1 className="text-lg font-display font-bold text-white">SnippetQuiz</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-white">Hello, {user?.name}</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={logout}
                        className="text-primary-foreground text-white"
                    >
                        <LogOut size={16} />
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-6">
                    {/* Section 1: Content Bank Selector */}
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            🧱 Content Bank
                        </h2>
                        <div className="space-y-2">
                            <div
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors"
                                onClick={() => setShowBankSelector(true)}
                            >
                                <div className="flex-1 flex items-center justify-between">
                                    <span>{currentBank?.name} ({contentEntries?.pagination.total || 0} items)</span>
                                    <ChevronRight size={16} className="text-muted-foreground" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to Add Content Instruction */}
                    <div className="bg-[#d3d3d34d] border border-[#d3d3d34d]/20 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-[#565656]">
                            <span className="text-sm">💡</span>
                            <p className="text-sm font-medium">
                                Right-click on any text and select "Add selected text to content bank" to save content
                            </p>
                        </div>
                    </div>


                    {/* Section 2: Saved Content List */}
                    <div className="space-y-3">
                        <Collapsible open={isContentExpanded} onOpenChange={setIsContentExpanded}>
                            <CollapsibleTrigger className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors">
                                {isContentExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                <span>📄 Saved Content ({contentEntries?.pagination.total})</span>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="space-y-3 mt-3">
                                <div className="space-y-2">
                                    {currentItems.map((item) => (
                                        <div key={item.id} className="border border-border rounded-lg p-3 space-y-2">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm line-clamp-2 mb-1">
                                                        {item.content || item.pageTitle || 'No content'}
                                                    </p>
                                                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                                        <LinkIcon size={12} />
                                                        <span className="truncate">{item.sourceUrl || 'No URL'}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-2 flex-shrink-0"
                                                    onClick={() => handleDeleteEntry(item.id)}
                                                    disabled={deleteEntryMutation.isPending}
                                                >
                                                    <Trash2 size={14} className="text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <div className="text-xs text-muted-foreground">
                                            {startIndex + 1}-{Math.min(endIndex, savedContent.length)} of {savedContent.length}
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => goToPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronLeft size={14} />
                                            </Button>
                                            <span className="text-xs px-2">
                                                {currentPage} / {totalPages}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => goToPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronRightIcon size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="border-t border-border p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    🔘 Actions
                </h3>
                <div className="space-y-2">
                    <Button
                        className="w-full"
                        onClick={handleGetPageContent}
                        disabled={isAddingPageContent || !selectedBankId}
                    >
                        <FileText size={16} className="mr-2" />
                        {isAddingPageContent ? 'Adding Content...' : 'Add Entire Website Content'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                        Note: Content analysis is limited to 5MB per capture.
                    </p>
                    <br />

                    {/* Error Alert for Generate Code */}
                    {error && (
                        <Alert variant="destructive" className="mb-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Button
                        variant="outline"
                        className="w-full"
                        disabled={isGeneratingCode}
                        onClick={async () => {
                            setError(null); // Clear previous errors
                            setIsGeneratingCode(true);

                            try {
                                const { code } = await apiService.generateCode();
                                chrome.tabs.create({
                                    url: `${import.meta.env.VITE_DASHBOARD_URL}?code=${code}`
                                });
                            } catch (error) {
                                console.error('Failed to generate code:', error);

                                // Set user-visible error message
                                const errorMessage = error instanceof Error
                                    ? error.message
                                    : 'Failed to generate quiz code. Please try again.';

                                setError(errorMessage);
                            } finally {
                                setIsGeneratingCode(false);
                            }
                        }}
                    >
                        <ExternalLink size={16} className="mr-2" />
                        {isGeneratingCode ? 'Loading...' : 'Generate Quiz'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;