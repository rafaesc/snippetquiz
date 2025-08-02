import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const toast = (toast: Toast) => {
    setToasts(prev => [...prev, toast]);
    // Simple implementation - in a real app you'd want a proper toast system
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
  };
  
  return { toast, toasts };
}