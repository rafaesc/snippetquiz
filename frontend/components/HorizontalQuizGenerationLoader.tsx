import { Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { QuizGenerationProgress } from '@/hooks/useQuizWebSocket';

interface HorizontalQuizGenerationLoaderProps {
  progress: QuizGenerationProgress | null;
  progressPercentage: number;
}

export function HorizontalQuizGenerationLoader({ progress, progressPercentage }: HorizontalQuizGenerationLoaderProps) {
  if (!progress) {
    return (
      <div className="px-4 md:px-6 pb-4  pt-4 bg-muted/20 animate-fade-in">
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Initializing...</div>
          <Progress value={0} className="h-2 bg-muted animate-fade-in" />
        </div>
      </div>
    );
  }

  if (!progress.contentEntry) {
    return null;
  }

  const generationProgress = {
    contentEntryName: progress.contentEntry?.name,
    questionsGeneratedSoFar: progress.questionsGeneratedSoFar,
    wordCountAnalyzed: progress.contentEntry?.wordCountAnalyzed
  };

  return (
    <div className="px-4 md:px-6 pb-4 pt-4 bg-muted/20 animate-fade-in">
      <div className="space-y-3">
        {/* Progress Stats */}
        <div className="flex flex-col md:flex-row md:justify-between gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">Processing:</span>
            <span className="text-xs font-medium text-foreground truncate max-w-[500px]">{generationProgress.contentEntryName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-muted-foreground">Questions generated:</span>
            <span className="font-semibold text-green-600">{generationProgress.questionsGeneratedSoFar}</span>
          </div>
        </div>
        
        {/* Progress Bar with Animation */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="h-2 bg-muted animate-fade-in" />
        </div>
      </div>
    </div>
  );
}