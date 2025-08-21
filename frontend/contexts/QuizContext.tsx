"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface QuizContextType {
    currentQuizId: number | null;
    setCurrentQuizId: (quizId: number | null) => void;
    quizData: any | null;
    setQuizData: (data: any | null) => void;
    clearQuizContext: () => void;
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
    const [quizData, setQuizData] = useState<any | null>(null);

    const clearQuizContext = () => {
        setCurrentQuizId(null);
        setQuizData(null);
    };

    const value: QuizContextType = {
        currentQuizId,
        setCurrentQuizId,
        quizData,
        setQuizData,
        clearQuizContext,
    };

    return (
        <QuizContext.Provider value={value}>
            {children}
        </QuizContext.Provider>
    );
}