import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import chromeStorage from '../lib/chrome-storage';
import { ContentBank, apiService, UserProfile } from '../lib/api-service';

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ChevronDown, Edit2, Trash2, Plus, Check, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';


interface BankSelectorProps {
    banks: ContentBank[];
    onBankChange?: (bankId: string) => void;
    className?: string;
    selectedBankId?: string;
}

function BankSelector({ banks, onBankChange, selectedBankId }: BankSelectorProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [newBankName, setNewBankName] = useState("");
    const [renameBankName, setRenameBankName] = useState("");

    const queryClient = useQueryClient();

    // Mutation for updating bank name
    const updateBankMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            apiService.contentBank.update(id, name),
        onSuccess: (updatedBank) => {
            // Update the cache directly instead of invalidating
            queryClient.setQueryData(['userProfile'], (oldData: UserProfile | undefined) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    banks: oldData.banks.map(bank =>
                        bank.id === updatedBank.id ? updatedBank : bank
                    )
                };
            });

            setIsRenaming(null);
            setRenameBankName('');
        },
        onError: (error) => {
            console.error('Error updating bank name:', error);
        }
    });

    // Mutation for creating a new bank
    const createBankMutation = useMutation({
        mutationFn: (name: string) => apiService.contentBank.create(name),
        onSuccess: (newBank) => {
            // Update the cache directly
            queryClient.setQueryData(['userProfile'], (oldData: UserProfile | undefined) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    banks: [...oldData.banks, newBank]
                };
            });

            setIsCreating(false);
            setNewBankName('');

            // Automatically select the new bank
            handleBankSelect(newBank.id);
        },
        onError: (error) => {
            console.error('Error creating bank:', error);
        }
    });

    // Mutation for deleting a bank
    const deleteBankMutation = useMutation({
        mutationFn: (id: string) => apiService.contentBank.delete(id),
        onSuccess: (_, variables) => {
            // Update the cache directly
            queryClient.setQueryData(['userProfile'], (oldData: UserProfile | undefined) => {
                if (!oldData) return oldData;

                const updatedBanks = oldData.banks.filter(bank => bank.id !== variables);

                return {
                    ...oldData,
                    banks: updatedBanks
                };
            });

            // If the deleted bank was selected, select the first available bank
            if (selectedBankId === variables && banks.length > 1) {
                const remainingBanks = banks.filter(bank => bank.id !== variables);
                if (remainingBanks.length > 0) {
                    handleBankSelect(remainingBanks[0].id);
                }
            }
        },
        onError: (error) => {
            console.error('Error deleting bank:', error);
        }
    });

    // Handle bank selection
    const handleBankSelect = async (bankId: string) => {
        onBankChange?.(bankId);

        try {
            await chromeStorage.local.set({ selectedBankId: bankId });
        } catch (error) {
            console.error('Error saving selected bank to storage:', error);
        }
    };

    // Handle rename submit
    const handleRenameSubmit = (bankId: string) => {
        if (!renameBankName.trim()) {
            setIsRenaming(null);
            return;
        }

        updateBankMutation.mutate({ id: bankId, name: renameBankName.trim() });
    };

    // Handle create submit
    const handleCreateSubmit = async () => {
        if (!newBankName.trim()) {
            setIsCreating(false);
            return;
        }

        createBankMutation.mutate(newBankName.trim());
    };

    // Handle delete bank
    const handleDeleteBank = (bankId: string) => {
        if (banks.length <= 1) {
            return; // Prevent deleting the last bank
        }

        deleteBankMutation.mutate(bankId);
    };

    // Start renaming a bank
    const handleStartRename = (bank: ContentBank, e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRenaming(bank.id);
        setRenameBankName(bank.name);
    };

    if (!banks || banks.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Content Bank</h3>

            {/* Active Bank Display */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-between h-10 text-left"
                    >
                        <span className="truncate">{selectedBankId ? banks.find(bank => bank.id === selectedBankId)?.name : "Select a bank"}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[280px] bg-popover border border-border shadow-extension-sm">
                    {/* Existing Banks */}
                    {banks.map((bank) => (
                        <div key={bank.id} className="flex items-center group">
                            {isRenaming === bank.id ? (
                                <div className="flex items-center w-full px-2 py-1.5 gap-2">
                                    <Input
                                        value={renameBankName}
                                        onChange={(e) => setRenameBankName(e.target.value)}
                                        className="h-7 text-sm"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleRenameSubmit(bank.id);
                                            if (e.key === "Escape") setIsRenaming(null);
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => handleRenameSubmit(bank.id)}
                                    >
                                        <Check className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0"
                                        onClick={() => setIsRenaming(null)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <DropdownMenuItem
                                        className="flex-1 cursor-pointer"
                                        onClick={() => handleBankSelect(bank.id)}
                                    >
                                        <span className={`truncate ${selectedBankId === bank.id ? "font-medium" : ""}`}>
                                            {bank.name}
                                        </span>
                                        {selectedBankId === bank.id && <Check className="h-4 w-4 ml-auto" />}
                                    </DropdownMenuItem>
                                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 hover:bg-accent"
                                            onClick={(e) => handleStartRename(bank, e)}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                            disabled={banks.length <= 1}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBank(bank.id);
                                            }}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}

                    {/* Create New Bank */}
                    {isCreating ? (
                        <div className="flex items-center px-2 py-1.5 gap-2 border-t border-border">
                            <Input
                                value={newBankName}
                                onChange={(e) => setNewBankName(e.target.value)}
                                placeholder="Bank name..."
                                className="h-7 text-sm"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleCreateSubmit();
                                    if (e.key === "Escape") setIsCreating(false);
                                }}
                            />
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={handleCreateSubmit}
                            >
                                <Check className="h-3 w-3" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={() => setIsCreating(false)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ) : (
                        <DropdownMenuItem
                            className="cursor-pointer border-t border-border"
                            onClick={(e: any) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsCreating(true);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Bank
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default BankSelector;