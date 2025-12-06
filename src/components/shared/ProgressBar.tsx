'use client';
import { Progress } from '@/components/ui/progress';

type ProgressBarProps = {
  current: number;
  goal: number;
};

export function ProgressBar({ current, goal }: ProgressBarProps) {
  const percentage = goal > 0 ? (current / goal) * 100 : 0;

  return (
    <div>
        <Progress value={percentage} className="h-2" />
        <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{percentage.toFixed(0)}%</span> funded
            </span>
            <span className="font-semibold text-foreground">
                ${current.toLocaleString()} / ${goal.toLocaleString()}
            </span>
        </div>
    </div>
  );
}
