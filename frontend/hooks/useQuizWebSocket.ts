import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

const API_BASE_URL = process.env.API_URL || "http://localhost:5000";

export interface QuizGenerationStatus {
  progress?: QuizGenerationProgress;
  completed?: {
    quizId: number;
  };
}

export interface QuizGenerationProgress {
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
  progress: QuizGenerationStatus | null;
  isConnected: boolean;
  isGenerating: boolean;
  progressPercentage: number;
  isComplete: boolean;
}

export function useQuizWebSocket(): UseQuizWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [progress, setProgress] = useState<QuizGenerationStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const initializeSocket = useCallback(() => {
    if (socketRef.current) {
      return; // Already initialized
    }

    // Initialize WebSocket connection
    socketRef.current = io(API_BASE_URL + "/ws", {
      transports: ["websocket"],
      withCredentials: true,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
      setIsGenerating(false);
    });

    const handleQuizComplete = () => {
      console.log("Quiz generation completed");
      setIsGenerating(false);
      setIsComplete(true);
      socket.disconnect();
    };

    // Quiz generation event handlers
    socket.on("quizProgress", (progressData: QuizGenerationStatus) => {
      console.log("Quiz progress:", progressData);
      setProgress(progressData);
      if (progressData.completed) {
        handleQuizComplete();
      }
    });

    socket.on("quizComplete", (completeData: QuizComplete) => {
      handleQuizComplete();
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

  const generateQuiz = (bankId: string) => {
    // Initialize socket connection when generateQuiz is called
    initializeSocket();

    if (!socketRef.current) {
      console.error("WebSocket not connected");
      return;
    }

    setProgress(null);
    setIsGenerating(true);
    setIsComplete(false);

    const requestData = {
      bankId: parseInt(bankId),
      userId: "c6d17967-46c9-4135-a2ed-b9374503a355", // Hardcoded as requested
    };

    console.log("Sending generateQuiz request:", requestData);
    socketRef.current.emit("generateQuiz", JSON.stringify(requestData));
  };

  // Calculate progress percentage based on current progress
  const progressPercentage = progress?.progress
    ? Math.round(
        (progress.progress.currentContentEntryIndex /
          progress.progress.totalContentEntries) *
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
  };
}
