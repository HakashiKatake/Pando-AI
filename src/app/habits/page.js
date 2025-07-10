'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Clock, 
  TrendingUp, 
  Target,
  Calendar,
  Flame,
  MoreVertical,
  Edit2,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useHabitStore } from '@/lib/store';
import { useDataInitialization } from '@/lib/useDataInitialization';
import { DailyQuests } from '@/components/DailyQuests';
import { HabitCalendar } from '@/components/HabitCalendar';

const HABIT_CATEGORIES = [
  { id: 'health', name: 'Health & Fitness', icon: '💪', color: 'bg-green-100 text-green-800' },
  { id: 'productivity', name: 'Productivity', icon: '⚡', color: 'bg-blue-100 text-blue-800' },
  { id: 'mindfulness', name: 'Mindfulness', icon: '🧘', color: 'bg-purple-100 text-purple-800' },
  { id: 'learning', name: 'Learning', icon: '📚', color: 'bg-orange-100 text-orange-800' },
  { id: 'social', name: 'Social', icon: '👥', color: 'bg-pink-100 text-pink-800' },
  { id: 'creative', name: 'Creative', icon: '🎨', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'other', name: 'Other', icon: '📝', color: 'bg-gray-100 text-gray-800' }
];

const HABIT_FREQUENCIES = [
  { id: 'daily', name: 'Daily', description: 'Every day' },
  { id: 'weekdays', name: 'Weekdays', description: 'Monday to Friday' },
  { id: 'weekends', name: 'Weekends', description: 'Saturday and Sunday' },
  { id: 'weekly', name: 'Weekly', description: 'Once a week' },
  { id: 'custom', name: 'Custom', description: 'Choose specific days' }
];

function CreateHabitDialog({ isOpen, onOpenChange, onHabitCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    frequency: 'daily',
    targetValue: 1,
    unit: '',
    reminderTime: '',
    isActive: true
  });
  
  const { addHabit } = useHabitStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    await addHabit(formData);
    
    setFormData({
      title: '',
      description: '',
      category: 'other',
      frequency: 'daily',
      targetValue: 1,
      unit: '',
      reminderTime: '',
      isActive: true
    });
    
    onHabitCreated();
    onOpenChange(false);
  };

  const selectedCategory = HABIT_CATEGORIES.find(cat => cat.id === formData.category);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Habit</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block text-gray-900">Habit Name</label>
            <Input
              placeholder="e.g., Morning run, Read for 30 minutes"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-gray-900">Description (Optional)</label>
            <Input
              placeholder="Why is this habit important to you?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-gray-900">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {HABIT_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: category.id }))}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    formData.category === category.id 
                      ? 'border-blue-500 bg-blue-50 text-blue-900' 
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-gray-900">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {HABIT_FREQUENCIES.map((freq) => (
                <option key={freq.id} value={freq.id}>
                  {freq.name} - {freq.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-900">Target</label>
              <Input
                type="number"
                min="1"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block text-gray-900">Unit (Optional)</label>
              <Input
                placeholder="e.g., minutes, pages, cups"
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function HabitsPage() {
  const { 
    habits, 
    completions, 
    toggleHabitCompletion, 
    deleteHabit,
    getHabitStreak,
    getHabitCompletionRate,
    getTodaysHabits,
    loadFromLocalStorage,
    generateDailyQuests,
    updateQuestProgress 
  } = useHabitStore();
  
  const dataInit = useDataInitialization();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setIsHydrated(true);
    loadFromLocalStorage();
    // Initialize quest system
    generateDailyQuests();
    updateQuestProgress();
  }, [loadFromLocalStorage, generateDailyQuests, updateQuestProgress]);

  const handleToggleHabit = async (habitId) => {
    await toggleHabitCompletion(habitId);
  };

  const handleHabitCreated = () => {
    // No need to manually refresh - store is reactive
  };

  const handleDeleteHabit = async (habitId) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habitId);
    }
  };

  // Get today's habits directly from store
  const todaysHabits = isHydrated ? getTodaysHabits() : [];

  const getOverallStats = () => {
    const total = todaysHabits.length;
    const completed = todaysHabits.filter(h => h.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalStreak = todaysHabits.reduce((sum, habit) => sum + habit.streak, 0);
    const avgCompletionRate = total > 0 
      ? Math.round(todaysHabits.reduce((sum, habit) => sum + habit.completionRate, 0) / total)
      : 0;
    
    return { total, completed, percentage, totalStreak, avgCompletionRate };
  };

  const filteredHabits = selectedCategory === 'all' 
    ? todaysHabits 
    : todaysHabits.filter(habit => habit.category === selectedCategory);

  const stats = getOverallStats();

  if (!isHydrated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
          <Target className="h-8 w-8" />
          Habit Tracker
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Build lasting habits that improve your life. Track your progress and stay motivated with streaks and insights.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}/{stats.total}</p>
                <p className="text-sm text-muted-foreground">Today's Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.percentage}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalStreak}</p>
                <p className="text-sm text-muted-foreground">Total Streak Days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avgCompletionRate}%</p>
                <p className="text-sm text-muted-foreground">Weekly Average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Today's Progress</h3>
                <Badge variant={stats.percentage >= 80 ? "default" : stats.percentage >= 50 ? "secondary" : "outline"}>
                  {stats.completed} of {stats.total} completed
                </Badge>
              </div>
              <div className="w-full bg-secondary h-3 rounded-full">
                <div 
                  className="bg-primary h-3 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Habits
        </Button>
        {HABIT_CATEGORIES.map((category) => {
          const categoryHabits = todaysHabits.filter(h => h.category === category.id);
          if (categoryHabits.length === 0) return null;
          
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center gap-2"
            >
              <span>{category.icon}</span>
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {categoryHabits.length}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Create Habit Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {selectedCategory === 'all' ? 'All Habits' : HABIT_CATEGORIES.find(c => c.id === selectedCategory)?.name}
        </h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </DialogTrigger>
          <CreateHabitDialog 
            isOpen={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onHabitCreated={handleHabitCreated}
          />
        </Dialog>
      </div>

      {/* Habits List */}
      {filteredHabits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {todaysHabits.length === 0 ? 'No habits yet' : 'No habits in this category'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {todaysHabits.length === 0 
                ? 'Create your first habit to start building a better routine'
                : 'Try selecting a different category or create a new habit'
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHabits.map((habit) => {
            const category = HABIT_CATEGORIES.find(cat => cat.id === habit.category);
            
            return (
              <Card key={habit.id} className="transition-all duration-200 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <button
                        onClick={() => handleToggleHabit(habit.id)}
                        className="flex-shrink-0 transition-colors"
                      >
                        {habit.completed ? (
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        ) : (
                          <Circle className="h-8 w-8 text-muted-foreground hover:text-primary" />
                        )}
                      </button>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`font-medium ${habit.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {habit.title}
                          </h3>
                          {category && (
                            <Badge variant="outline" className={`${category.color} text-xs`}>
                              {category.icon} {category.name}
                            </Badge>
                          )}
                        </div>
                        
                        {habit.description && (
                          <p className="text-sm text-muted-foreground mb-2">{habit.description}</p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Flame className="h-4 w-4" />
                            <span>{habit.streak} day streak</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>{habit.completionRate}% this week</span>
                          </div>
                          {habit.targetValue > 1 && (
                            <div className="flex items-center space-x-1">
                              <Target className="h-4 w-4" />
                              <span>{habit.targetValue} {habit.unit}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Daily Quests Section */}
      <div className="mt-12">
        <DailyQuests />
      </div>

      {/* Calendar Section */}
      <div className="mt-12">
        <HabitCalendar />
      </div>
    </div>
  );
}
