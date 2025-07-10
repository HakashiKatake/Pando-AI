'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { 
  Trophy, 
  Star, 
  Clock, 
  Target, 
  Zap,
  CheckCircle2,
  Gift,
  Calendar
} from 'lucide-react';
import { useHabitStore } from '@/lib/store';

const QUEST_ICONS = {
  streak: Zap,
  complete_all: Target,
  early_bird: Clock,
  consistency: Calendar,
  habit_combo: Star,
  weekend_warrior: Trophy
};

export function DailyQuests({ showHeader = true, compact = false }) {
  const { 
    getTodaysQuests, 
    generateDailyQuests, 
    updateQuestProgress, 
    getQuestPoints,
    completions  // Add completions to trigger reactivity
  } = useHabitStore();

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    // Generate today's quests on mount
    generateDailyQuests();
  }, [generateDailyQuests]);

  useEffect(() => {
    if (isHydrated) {
      // Update quest progress when completions change
      updateQuestProgress();
    }
  }, [completions, updateQuestProgress, isHydrated]);

  // Get live data from store
  const quests = isHydrated ? getTodaysQuests() : {};
  const todaysPoints = isHydrated ? getQuestPoints() : 0;

  const questArray = Object.values(quests);
  const completedQuests = questArray.filter(quest => quest.completed).length;
  const totalQuests = questArray.length;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-purple-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              Daily Quests
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {completedQuests}/{totalQuests}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {questArray.length === 0 ? (
            <p className="text-sm text-gray-600 text-center py-4">
              No quests available today
            </p>
          ) : (
            questArray.map((quest) => {
              const IconComponent = QUEST_ICONS[quest.type] || Star;
              const progressPercentage = quest.target > 0 ? (quest.progress / quest.target) * 100 : 0;
              
              return (
                <div key={quest.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${quest.completed ? 'bg-green-100' : 'bg-purple-100'}`}>
                        <IconComponent className={`h-4 w-4 ${quest.completed ? 'text-green-600' : 'text-purple-600'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">{quest.title}</h4>
                          {quest.completed && (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{quest.description}</p>
                      </div>
                    </div>
                    <Badge variant={quest.completed ? "default" : "secondary"} className="text-xs">
                      {quest.points} pts
                    </Badge>
                  </div>
                  {!quest.completed && quest.target > 1 && (
                    <Progress value={progressPercentage} className="h-2" />
                  )}
                </div>
              );
            })
          )}
          
          {todaysPoints > 0 && (
            <div className="pt-3 border-t border-purple-200">
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-purple-700">
                <Gift className="h-4 w-4" />
                Today's Points: {todaysPoints}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Daily Quests
            </h2>
            <p className="text-gray-600 mt-1">
              Complete challenges to earn points and maintain streaks
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Completed</div>
            <div className="text-2xl font-bold text-purple-600">
              {completedQuests}/{totalQuests}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questArray.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Quests Today
              </h3>
              <p className="text-gray-600">
                Create some habits to unlock daily quests and challenges!
              </p>
            </CardContent>
          </Card>
        ) : (
          questArray.map((quest) => {
            const IconComponent = QUEST_ICONS[quest.type] || Star;
            const progressPercentage = quest.target > 0 ? (quest.progress / quest.target) * 100 : 0;
            
            return (
              <Card 
                key={quest.id} 
                className={`transition-all duration-200 ${
                  quest.completed 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg' 
                    : 'hover:shadow-md border-gray-200'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${
                        quest.completed 
                          ? 'bg-green-100' 
                          : 'bg-purple-100'
                      }`}>
                        <IconComponent className={`h-6 w-6 ${
                          quest.completed 
                            ? 'text-green-600' 
                            : 'text-purple-600'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {quest.title}
                          {quest.completed && (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    <Badge 
                      variant={quest.completed ? "default" : "secondary"}
                      className={quest.completed ? "bg-green-100 text-green-800" : ""}
                    >
                      {quest.points} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{quest.description}</p>
                  
                  {quest.target > 1 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                      <Progress 
                        value={progressPercentage} 
                        className={`h-3 ${quest.completed ? 'bg-green-100' : ''}`}
                      />
                    </div>
                  )}
                  
                  {quest.completed && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Quest Completed!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {todaysPoints > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Gift className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-purple-900">
                  Points Earned Today
                </h3>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {todaysPoints}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
