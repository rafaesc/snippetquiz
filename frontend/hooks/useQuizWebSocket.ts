import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = process.env.API_URL || 'http://localhost:5000';

interface QuizGenerationProgress {
  bankId: string;
  totalContentEntries: number;
  totalContentEntriesSkipped: number;
  currentContentEntryIndex: number;
  questionsGeneratedSoFar: number;
  contentEntry: {
    id: string;
    name: string;
    wordCountAnalyzed: number;
  };
}

interface QuizComplete {
  message: string;
}

interface UseQuizWebSocketReturn {
  generateQuiz: (bankId: string) => void;
  progress: QuizGenerationProgress | null;
  isConnected: boolean;
  isGenerating: boolean;
  progressPercentage: number;
  isComplete: boolean;
}

export function useQuizWebSocket(): UseQuizWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [progress, setProgress] = useState<QuizGenerationProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    socketRef.current = io(API_BASE_URL + '/ws', {
      transports: ['websocket'],
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
      setIsGenerating(false);
    });

    // Quiz generation event handlers
    socket.on('quizProgress', (progressData: QuizGenerationProgress) => {
      console.log('Quiz progress:', progressData);
      setProgress(progressData);
    });

    socket.on('quizComplete', (completeData: QuizComplete) => {
      console.log('Quiz generation completed:', completeData);
      setIsGenerating(false);
      setIsComplete(true);
      // Disconnect socket when quiz is complete
      socket.disconnect();
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const generateQuiz = (bankId: string) => {
    if (!socketRef.current) {
      console.error('WebSocket not connected');
      return;
    }

    setProgress(null);
    setIsGenerating(true);
    setIsComplete(false);

    const requestData = {
      bankId: parseInt(bankId),
      userId: "345ee4eb-f21d-4e8f-91b5-de3871cde1d6" // Hardcoded as requested
    };

    console.log('Sending generateQuiz request:', requestData);
    socketRef.current.emit('generateQuiz', JSON.stringify(requestData));
  };

  // Calculate progress percentage based on current progress
  const progressPercentage = progress
    ? Math.round((progress.currentContentEntryIndex / progress.totalContentEntries) * 100)
    : 0;

  return {
    generateQuiz,
    progress,
    isConnected,
    isGenerating,
    progressPercentage,
    isComplete,
  };
}