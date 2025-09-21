import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.API_URL || "http://localhost:5000";
const TIMEOUT_TO_REFRESH_QUIZ = 500;


export interface QuizGenerationStatus {
  progress?: QuizGenerationProgress;
  completed?: {
    quizId: number;
  };
}

export interface QuizGenerationProgress {
  bankId: string;
  quizId: string;
  totalContentEntries: number;
  totalContentEntriesSkipped: number;
  currentContentEntryIndex: number;
  questionsGeneratedSoFar: number;
  totalChunks: number;
  currentChunkIndex: number;
  contentEntry?: {
    id: string;
    name: string;
    wordCountAnalyzed: number;
  };
}

interface QuizComplete {
  message: string;
}

interface QuizError {
  message: string;
  error: string;
  retryAfter?: number;
  limit?: number;
  resetTime?: number;
}

interface UseQuizWebSocketReturn {
  generateQuiz: () => void;
  progress: QuizGenerationStatus | null;
  isConnected: boolean;
  isGenerating: boolean;
  progressPercentage: number;
  isComplete: boolean;
  error: QuizError | null;
  clearError: () => void;
}

export function useQuizWebSocket(): UseQuizWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [progress, setProgress] = useState<QuizGenerationStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<QuizError | null>(null);
  const queryClient = useQueryClient();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const initializeSocket = useCallback(() => {
    setIsGenerating(true);
    console.log("Initializing WebSocket connection", socketRef.current);
    if (socketRef.current && isConnected) {
      return; // Already initialized
    }

    socketRef.current = io(API_BASE_URL + "/api/ws", {
      transports: ["websocket"],
      path: "/api/ws",
      withCredentials: true,
    });

    const socket = socketRef.current;

    const handleQuizComplete = () => {
      setIsGenerating(false);
      setIsComplete(true);
      setProgress(null);
      socket.disconnect();
    };

    // Connection event handlers
    socket.on("connect", () => {
      setIsConnected(true);
      setError(null); // Clear any previous errors on successful connection
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsGenerating(false);
      setProgress(null);
    });

    socket.on("connect_error", (error) => {
      setIsConnected(false);
      setIsGenerating(false);
      setProgress(null);
      setError({
        message: "Connection failed",
        error: error.message || "Unable to connect to server"
      });
    });

    // Quiz generation event handlers
    socket.on("quizProgress", (progressData: QuizGenerationStatus) => {
      setProgress(progressData);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["quiz"] });
      }, TIMEOUT_TO_REFRESH_QUIZ);
      if (progressData.completed) {
        handleQuizComplete();
      }
    });

    socket.on("quizComplete", () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quiz"] });
      handleQuizComplete();
    });

    socket.on("quizError", (errorData: QuizError) => {
      setIsGenerating(false);
      setError(errorData);
    });

    socket.on("rateLimitError", (errorData: QuizError) => {
      setIsGenerating(false);
      setError(errorData);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const generateQuiz = () => {
    if (isConnected || error) {
      console.log("WebSocket already connected");
      return; // Already initialized
    }

    // Initialize socket connection when generateQuiz is called
    initializeSocket();

    if (!socketRef.current) {
      console.error("WebSocket not connected");
      setError({
        message: "Connection Error",
        error: "WebSocket not connected"
      });
      return;
    }

    setProgress(null);
    setIsComplete(false);
    setError(null); // Clear any previous errors

    socketRef.current.emit("generateQuiz");
  };

  // Calculate progress percentage based on current progress
  const progressPercentage = progress?.progress
    ? Math.round(
        (progress.progress.currentChunkIndex /
          progress.progress.totalChunks) *
          100
      )
    : 0;

  return {
    generateQuiz,
    progress,
    isConnected,
    isGenerating,
    progressPercentage,
    isComplete,
    error,
    clearError,
  };
}
