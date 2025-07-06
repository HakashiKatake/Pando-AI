'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Play, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export function ExerciseCard({
  exercise,
  onStart,
  className
}) {
  const {
    id,
    title,
    description,
    duration,
    difficulty,
    category,
    benefits = [],
    isCompleted = false
  } = exercise;

  return (
    <Card className={cn('group hover:shadow-lg transition-all duration-200', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{category}</Badge>
              <Badge 
                className={difficultyColors[difficulty] || difficultyColors.beginner}
              >
                {difficulty}
              </Badge>
              {isCompleted && (
                <Badge variant="success">Completed</Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
          {benefits.length > 0 && (
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span>{benefits[0]}</span>
            </div>
          )}
        </div>

        {benefits.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Benefits:</p>
            <div className="flex flex-wrap gap-1">
              {benefits.map((benefit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => onStart(exercise)}
          className="w-full"
          variant={isCompleted ? "outline" : "default"}
        >
          <Play className="h-4 w-4 mr-2" />
          {isCompleted ? 'Practice Again' : 'Start Exercise'}
        </Button>
      </CardContent>
    </Card>
  );
}

export function ExerciseGrid({ exercises, onStartExercise, className }) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onStart={onStartExercise}
        />
      ))}
    </div>
  );
}
