'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useExerciseStore } from '../../../lib/store';
import { useDataInitialization } from '../../../lib/useDataInitialization';

export default function BreathingExercisePage() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0); // Use index instead of string
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [selectedTechnique, setSelectedTechnique] = useState('4-7-8');
  const [startTime, setStartTime] = useState(null);
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  
  const { addSession } = useExerciseStore();
  const dataInit = useDataInitialization();

  const techniques = {
    '4-7-8': {
      name: '4-7-8 Breathing',
      description: 'Inhale for 4, hold for 7, exhale for 8. Great for relaxation and sleep.',
      phases: {
        inhale: 4,
        hold: 7,
        exhale: 8
      },
      cycles: 4
    },
    'box': {
      name: 'Box Breathing',
      description: 'Equal counts for all phases. Perfect for focus and stress relief.',
      phases: {
        inhale: 4,
        hold: 4,
        exhale: 4,
        pause: 4
      },
      cycles: 4
    },
    'triangle': {
      name: 'Triangle Breathing',
      description: 'Simple three-phase breathing for beginners.',
      phases: {
        inhale: 4,
        hold: 4,
        exhale: 4
      },
      cycles: 6
    },
    'coherent': {
      name: 'Coherent Breathing',
      description: 'Equal inhale and exhale for heart rate variability.',
      phases: {
        inhale: 5,
        exhale: 5
      },
      cycles: 10
    }
  };

  const currentTechnique = techniques[selectedTechnique];
  const phaseNames = Object.keys(currentTechnique.phases);
  const currentPhaseName = phaseNames[phaseIndex];
  const currentPhaseCount = currentTechnique.phases[currentPhaseName];

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setCount(prevCount => {
          if (prevCount >= currentPhaseCount - 1) {
            // Move to next phase
            const nextPhaseIndex = (phaseIndex + 1) % phaseNames.length;
            
            if (nextPhaseIndex === 0) {
              // Completed a full cycle
              setCycle(prevCycle => {
                const newCycle = prevCycle + 1;
                if (newCycle >= currentTechnique.cycles) {
                  // Exercise complete - save session
                  setIsActive(false);
                  setPhaseIndex(0);
                  saveCompletedSession();
                  return 0;
                }
                return newCycle;
              });
            }
            
            setPhaseIndex(nextPhaseIndex);
            return 0;
          }
          return prevCount + 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, currentPhaseCount, phaseIndex, phaseNames.length, currentTechnique.cycles]);

  const startExercise = () => {
    setIsActive(true);
    setPhaseIndex(0);
    setCount(0);
    setCycle(0);
    setStartTime(new Date());
  };

  const pauseExercise = () => {
    setIsActive(false);
  };

  const stopExercise = () => {
    setIsActive(false);
    setPhaseIndex(0);
    setCount(0);
    setCycle(0);
  };

  const resetExercise = () => {
    stopExercise();
  };

  const progress = ((count + 1) / currentPhaseCount) * 100;
  const overallProgress = ((cycle * phaseNames.length + phaseIndex) / (currentTechnique.cycles * phaseNames.length)) * 100;

  const getPhaseColor = (phaseName) => {
    switch (phaseName) {
      case 'inhale': return 'text-blue-600 bg-blue-100';
      case 'hold': return 'text-purple-600 bg-purple-100';
      case 'exhale': return 'text-green-600 bg-green-100';
      case 'pause': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseInstruction = (phaseName) => {
    switch (phaseName) {
      case 'inhale': return 'Breathe in slowly through your nose';
      case 'hold': return 'Hold your breath gently';
      case 'exhale': return 'Exhale slowly through your mouth';
      case 'pause': return 'Pause and relax';
      default: return 'Follow the breathing pattern';
    }
  };

  const saveCompletedSession = async () => {
    const endTime = new Date();
    const duration = startTime ? Math.round((endTime - startTime) / 1000) : 0;
    
    const sessionData = {
      exerciseType: 'breathing',
      technique: selectedTechnique,
      duration: duration,
      completedCycles: currentTechnique.cycles,
      timestamp: endTime.toISOString(),
    };

    try {
      await addSession(sessionData, dataInit.userId, dataInit.guestId);
      console.log('Breathing session saved successfully');
    } catch (error) {
      console.error('Failed to save breathing session:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link 
            href="/dashboard"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Breathing Exercises</h1>
            <p className="text-gray-600">Find your calm through mindful breathing</p>
          </div>
          
          <div></div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Technique Selector */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Technique</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(techniques).map(([key, technique]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedTechnique(key);
                  stopExercise();
                }}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedTechnique === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{technique.name}</h3>
                <p className="text-sm text-gray-600">{technique.description}</p>
                <div className="mt-2 text-xs text-gray-500">
                  {technique.cycles} cycles • {Object.values(technique.phases).join('-')} pattern
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Breathing Visualizer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {currentTechnique.name}
                </h3>
                <p className="text-gray-600">{currentTechnique.description}</p>
              </div>

              {/* Breathing Circle */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                
                <div 
                  className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ease-in-out ${
                    currentPhaseName === 'inhale' ? 'border-blue-500 scale-110' :
                    currentPhaseName === 'hold' ? 'border-purple-500 scale-110' :
                    currentPhaseName === 'exhale' ? 'border-green-500 scale-90' :
                    'border-yellow-500 scale-90'
                  }`}
                  style={{
                    transform: `scale(${
                      currentPhaseName === 'inhale' ? 1 + (progress / 200) :
                      currentPhaseName === 'hold' ? 1.1 :
                      currentPhaseName === 'exhale' ? 1.1 - (progress / 200) :
                      0.9
                    })`
                  }}
                ></div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium capitalize ${getPhaseColor(currentPhaseName)}`}>
                      {currentPhaseName}
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">
                      {currentPhaseCount - count}
                    </div>
                  </div>
                </div>
              </div>

              {/* Phase Instruction */}
              <div className="mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  {getPhaseInstruction(currentPhaseName)}
                </p>
                <p className="text-sm text-gray-500">
                  Cycle {cycle + 1} of {currentTechnique.cycles}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${overallProgress}%` }}
                ></div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                {!isActive ? (
                  <button
                    onClick={startExercise}
                    className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseExercise}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                  >
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </button>
                )}
                
                <button
                  onClick={stopExercise}
                  className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Square className="w-5 h-5" />
                  <span>Stop</span>
                </button>
                
                <button
                  onClick={resetExercise}
                  className="bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of Breathing Exercises</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Reduces Stress</p>
                    <p className="text-gray-600">Activates the body's relaxation response</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Improves Focus</p>
                    <p className="text-gray-600">Enhances concentration and mental clarity</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Better Sleep</p>
                    <p className="text-gray-600">Promotes relaxation and rest</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Emotional Balance</p>
                    <p className="text-gray-600">Helps regulate emotions and mood</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Success</h3>
              
              <div className="space-y-3 text-sm text-gray-700">
                <p>• Find a comfortable, quiet space</p>
                <p>• Sit or lie down with your back straight</p>
                <p>• Close your eyes or soften your gaze</p>
                <p>• Don't force your breathing - let it flow naturally</p>
                <p>• Practice regularly for best results</p>
                <p>• Start with shorter sessions and build up</p>
                <p>• Focus on the counting, not perfection</p>
              </div>
            </div>

            {/* Other Exercises */}
            
          </div>
        </div>
      </div>
    </div>
  );
}
