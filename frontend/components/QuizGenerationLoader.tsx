import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

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

interface QuizGenerationLoaderProps {
  progress: QuizGenerationProgress | null;
  progressPercentage: number;
}

export function QuizGenerationLoader({ progress, progressPercentage }: QuizGenerationLoaderProps) {
  const getProgressMessage = () => {
    if (!progress) return "Initializing...";
    
    const { currentContentEntryIndex, totalContentEntries, questionsGeneratedSoFar, contentEntry } = progress;
    
    if (currentContentEntryIndex === 0) {
      return "Starting quiz generation...";
    }
    
    return `Processing "${contentEntry.name}" (${currentContentEntryIndex}/${totalContentEntries})`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          <span className="font-medium">Generating your quiz...</span>
        </div>
        <p className="text-sm text-muted-foreground">
          AI is analyzing your content and creating questions
        </p>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          {getProgressMessage()}
        </p>
        {progress && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Questions generated so far: {progress.questionsGeneratedSoFar}</p>
            <p>Words analyzed: {progress.contentEntry.wordCountAnalyzed}</p>
            {progress.totalContentEntriesSkipped > 0 && (
              <p>Entries skipped: {progress.totalContentEntriesSkipped}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}