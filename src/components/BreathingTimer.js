'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, RotateCcw, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

const breathingTechniques = {
  '4-7-8': {
    name: '4-7-8 Relaxation',
    description: 'Inhale for 4, hold for 7, exhale for 8',
    pattern: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 7 },
      { phase: 'exhale', duration: 8 }
    ],
    benefits: ['Reduces anxiety', 'Improves sleep', 'Calms nervous system']
  },
  'box': {
    name: 'Box Breathing',
    description: 'Equal counts for inhale, hold, exhale, hold',
    pattern: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 },
      { phase: 'hold', duration: 4 }
    ],
    benefits: ['Improves focus', 'Reduces stress', 'Enhances control']
  },
  'coherent': {
    name: 'Coherent Breathing',
    description: 'Slow, steady 5-second breaths',
    pattern: [
      { phase: 'inhale', duration: 5 },
      { phase: 'exhale', duration: 5 }
    ],
    benefits: ['Balances nervous system', 'Improves heart rate variability']
  },
  'triangle': {
    name: 'Triangle Breathing',
    description: 'Inhale, hold, exhale in equal counts',
    pattern: [
      { phase: 'inhale', duration: 4 },
      { phase: 'hold', duration: 4 },
      { phase: 'exhale', duration: 4 }
    ],
    benefits: ['Simple and effective', 'Good for beginners']
  }
};

export function BreathingTimer({ 
  technique = 'box',
  onComplete,
  className 
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [targetCycles] = useState(10);
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const currentTechnique = breathingTechniques[technique];
  const currentPhase = currentTechnique.pattern[currentPhaseIndex];

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeRemaining === 0) {
      handlePhaseComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  const handlePhaseComplete = () => {
    const nextPhaseIndex = (currentPhaseIndex + 1) % currentTechnique.pattern.length;
    
    if (nextPhaseIndex === 0) {
      // Completed a full cycle
      const newCycleCount = cycleCount + 1;
      setCycleCount(newCycleCount);
      
      if (newCycleCount >= targetCycles) {
        handleSessionComplete();
        return;
      }
    }
    
    setCurrentPhaseIndex(nextPhaseIndex);
    setTimeRemaining(currentTechnique.pattern[nextPhaseIndex].duration);
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    const sessionDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    setTotalTime(sessionDuration);
    
    onComplete?.({
      technique,
      cycles: cycleCount,
      duration: sessionDuration,
      targetReached: cycleCount >= targetCycles
    });
  };

  const startSession = () => {
    setIsActive(true);
    setCurrentPhaseIndex(0);
    setTimeRemaining(currentTechnique.pattern[0].duration);
    setCycleCount(0);
    setTotalTime(0);
    startTimeRef.current = Date.now();
  };

  const pauseSession = () => {
    setIsActive(false);
  };

  const resumeSession = () => {
    setIsActive(true);
  };

  const resetSession = () => {
    setIsActive(false);
    setCurrentPhaseIndex(0);
    setTimeRemaining(0);
    setCycleCount(0);
    setTotalTime(0);
  };

  const getPhaseColor = (phase) => {
    switch (phase) {
      case 'inhale': return 'text-blue-500';
      case 'hold': return 'text-yellow-500';
      case 'exhale': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getPhaseInstruction = (phase) => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return 'Prepare';
    }
  };

  const progress = currentPhase ? 
    ((currentPhase.duration - timeRemaining) / currentPhase.duration) * 100 : 0;

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wind className="h-6 w-6" />
          {currentTechnique.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {currentTechnique.description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Circle */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={cn(
                'transition-all duration-1000 ease-in-out',
                currentPhase && getPhaseColor(currentPhase.phase)
              )}
              strokeLinecap="round"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={cn(
              'text-2xl font-bold transition-colors',
              currentPhase && getPhaseColor(currentPhase.phase)
            )}>
              {timeRemaining || (currentPhase?.duration || 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentPhase ? getPhaseInstruction(currentPhase.phase) : 'Ready'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 text-center">
          <div>
            <div className="text-lg font-bold">{cycleCount}</div>
            <div className="text-xs text-muted-foreground">Cycles</div>
          </div>
          <div>
            <div className="text-lg font-bold">{targetCycles}</div>
            <div className="text-xs text-muted-foreground">Goal</div>
          </div>
          {totalTime > 0 && (
            <div>
              <div className="text-lg font-bold">{Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Time</div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2">
          {!isActive && cycleCount === 0 && (
            <Button onClick={startSession} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start
            </Button>
          )}
          
          {isActive && (
            <Button onClick={pauseSession} variant="outline">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          
          {!isActive && cycleCount > 0 && timeRemaining > 0 && (
            <Button onClick={resumeSession}>
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          
          {cycleCount > 0 && (
            <Button onClick={resetSession} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Benefits:</p>
          <div className="flex flex-wrap gap-1">
            {currentTechnique.benefits.map((benefit) => (
              <Badge key={benefit} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Session Complete */}
        {cycleCount >= targetCycles && (
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-medium text-green-800 dark:text-green-200">
              🎉 Session Complete!
            </p>
            <p className="text-sm text-green-600 dark:text-green-300">
              Great job completing {cycleCount} breathing cycles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BreathingTechniqueSelector({ 
  selectedTechnique, 
  onSelect, 
  className 
}) {
  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-semibold">Choose a breathing technique:</h3>
      <div className="grid gap-3">
        {Object.entries(breathingTechniques).map(([key, technique]) => (
          <Card 
            key={key}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedTechnique === key && 'ring-2 ring-primary'
            )}
            onClick={() => onSelect(key)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{technique.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {technique.description}
                  </p>
                </div>
                {selectedTechnique === key && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
