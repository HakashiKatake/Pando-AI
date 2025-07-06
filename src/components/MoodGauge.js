'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const moodColors = {
  1: 'bg-red-500',
  2: 'bg-orange-500', 
  3: 'bg-yellow-500',
  4: 'bg-lime-500',
  5: 'bg-green-500'
};

const moodLabels = {
  1: 'Very Low',
  2: 'Low', 
  3: 'Neutral',
  4: 'Good',
  5: 'Excellent'
};

export function MoodGauge({ mood, size = 'md', showLabel = true, className }) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const percentage = (mood / 5) * 100;
  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className={cn('p-4', className)}>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className={cn('relative', sizeClasses[size])}>
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={cn(
                'transition-all duration-1000 ease-in-out',
                mood >= 4 ? 'text-green-500' :
                mood >= 3 ? 'text-yellow-500' :
                mood >= 2 ? 'text-orange-500' : 'text-red-500'
              )}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{mood}</div>
              <div className="text-xs text-muted-foreground">/ 5</div>
            </div>
          </div>
        </div>
        
        {showLabel && (
          <div className="text-center">
            <p className="font-medium">{moodLabels[mood]}</p>
            <p className="text-sm text-muted-foreground">Current Mood</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MoodScale({ value, onChange, className }) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Very Low</span>
        <span className="text-sm text-muted-foreground">Excellent</span>
      </div>
      
      <div className="relative">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5].map((mood) => (
            <button
              key={mood}
              onClick={() => onChange(mood)}
              className={cn(
                'w-8 h-8 rounded-full text-xs font-medium transition-all',
                value === mood
                  ? `${moodColors[mood]} text-white scale-110`
                  : 'bg-muted text-muted-foreground hover:scale-105'
              )}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <p className="font-medium">{moodLabels[value]}</p>
      </div>
    </div>
  );
}
