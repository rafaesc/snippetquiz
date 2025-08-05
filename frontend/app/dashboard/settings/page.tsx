'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiService } from '../../../lib/api-service';
import { useToast } from '../../../hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [globalInstructions, setGlobalInstructions] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // Query to fetch existing instructions
  const { data: instructionsData, isLoading: isLoadingInstructions } = useQuery({
    queryKey: ['quiz-instructions'],
    queryFn: apiService.getInstructions,
  });

  // Set instructions when data is loaded
  useEffect(() => {
    if (instructionsData?.instruction) {
      setGlobalInstructions(instructionsData.instruction);
    }
  }, [instructionsData]);

  // Mutation for saving global instructions
  const saveInstructionsMutation = useMutation({
    mutationFn: async (instructions: string) => {
      return await apiService.updateInstructions(instructions);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Global instructions saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save instructions',
        variant: 'destructive',
      });
    },
  });

  // Mutation for changing password
  const changePasswordMutation = useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      return await apiService.changePassword(currentPassword, newPassword);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password changed successfully. Please log in again.',
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Redirect to login after a short delay to show the success message
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive',
      });
    },
  });

  const handleSaveInstructions = () => {
    if (!globalInstructions.trim()) return;
    saveInstructionsMutation.mutate(globalInstructions);
  };

  const handleUpdatePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Global Quiz Instructions Section */}
      <Card>
        <CardHeader>
          <CardTitle>Global Quiz Instructions</CardTitle>
          <CardDescription>
            Set account-level AI prompts that will be used for all quiz generation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Enter your default instructions for quiz generation..."
              value={globalInstructions}
              onChange={(e) => setGlobalInstructions(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoadingInstructions}
            />
            <p className="text-sm text-muted-foreground">
              These instructions will apply to all quizzes you generate.
            </p>
          </div>
          <Button
            onClick={handleSaveInstructions}
            disabled={saveInstructionsMutation.isPending || !globalInstructions.trim() || isLoadingInstructions}
          >
            {saveInstructionsMutation.isPending ? "Saving..." : "Use for all future quizzes"}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your account password for enhanced security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>

          <Button
            onClick={handleUpdatePassword}
            disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || !confirmPassword}
          >
            {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}