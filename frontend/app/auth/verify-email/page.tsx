"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";

interface VerifyEmailResponse {
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
  };
}

interface ResendVerificationResponse {
  message: string;
}

function VerifyEmailContent() {
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const token = searchParams.get('token');
  const emailFromUrl = searchParams.get('email'); // Get email from URL parameter
  const [email, setEmail] = useState(emailFromUrl || '');

  // Verify email mutation using API service
  const verifyEmailMutation = useMutation({
    mutationFn: (token: string) => apiService.verifyEmail(token),
    onSuccess: (data: VerifyEmailResponse) => {
      setVerificationStatus('success');
      toast({
        title: "Email Verified!",
        description: "Your email has been successfully verified. You are now logged in.",
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    },
    onError: (error: Error) => {
      const message = error.message;
      if (message.includes('expired') || message.includes('Invalid')) {
        setVerificationStatus('expired');
        setErrorMessage('Your verification link has expired or is invalid.');
      } else {
        setVerificationStatus('error');
        setErrorMessage(message);
      }
    },
    
  });

  // Resend verification email mutation using API service
  const resendVerificationMutation = useMutation({
    mutationFn: (email: string) => apiService.resendVerificationEmail(email),
    onSuccess: () => {
      setIsResending(false);
      toast({
        title: "Email Sent!",
        description: "A new verification email has been sent to your inbox.",
      });
    },
    onError: (error: Error) => {
      setIsResending(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-verify when component mounts if token is present
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    } else {
      setVerificationStatus('error');
      setErrorMessage('No verification token provided.');
    }
  }, [token]);

  const handleResendVerification = () => {
    const email = prompt('Please enter your email address to resend verification:');
    if (email) {
      setIsResending(true);
      resendVerificationMutation.mutate(email);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
              <CardTitle>Verifying Your Email</CardTitle>
              <CardDescription>
                Please wait while we verify your email address: {email}
              </CardDescription>
            </CardHeader>
          </Card>
        );

      case 'success':
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Email Verified Successfully!</CardTitle>
              <CardDescription>
                Your email has been verified. You are now logged in and will be redirected to your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => router.push('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        );

      case 'expired':
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <XCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <CardTitle className="text-yellow-600">Verification Link Expired</CardTitle>
              <CardDescription>
                Your verification link has expired or is invalid. Please request a new one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button 
                  onClick={handleResendVerification} 
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'error':
      default:
        return (
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-600">Verification Failed</CardTitle>
              <CardDescription>
                There was an error verifying your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {errorMessage}
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button 
                  onClick={handleResendVerification} 
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {renderContent()}
    </div>
  );
}

// Loading fallback component
function VerifyEmailLoading() {
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>
            Please wait while we load the verification page.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}