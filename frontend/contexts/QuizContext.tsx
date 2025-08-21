"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextType {
    currentQuizId: number | null;
    setCurrentQuizId: (quizId: number | null) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function useQuiz() {
    const context = useContext(QuizContext);
    if (context === undefined) {
        throw new Error('useQuiz must be used within a QuizProvider');
    }
    return context;
}

interface QuizProviderProps {
    children: ReactNode;
}

export function QuizProvider({ children }: QuizProviderProps) {
    const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);

    const value: QuizContextType = {
        currentQuizId,
        setCurrentQuizId,
    };

    return (
        <QuizContext.Provider value={value}>
            {children}
        </QuizContext.Provider>
    );
}