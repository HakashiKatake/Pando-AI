'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Circle,
  CheckCircle,
  Target,
  TrendingUp
} from 'lucide-react';
import { useHabitStore } from '@/lib/store';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitCalendar({ compact = false, showHeader = true }) {
  const { getMonthlyCalendar, habits } = useHabitStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);

  useEffect(() => {
    const calendar = getMonthlyCalendar(
      currentDate.getFullYear(),
      currentDate.getMonth()
    );
    setCalendarData(calendar);
  }, [currentDate, getMonthlyCalendar, habits]);

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getCompletionColor = (completionRate) => {
    if (completionRate === 0) return 'bg-gray-100 text-gray-400';
    if (completionRate < 25) return 'bg-red-100 text-red-600';
    if (completionRate < 50) return 'bg-orange-100 text-orange-600';
    if (completionRate < 75) return 'bg-yellow-100 text-yellow-600';
    if (completionRate < 100) return 'bg-blue-100 text-blue-600';
    return 'bg-green-100 text-green-600';
  };

  const getCompletionIcon = (day) => {
    if (!day) return null;
    if (day.completionRate === 100) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (day.completionRate > 0) {
      return <Circle className="h-4 w-4 text-blue-600" />;
    }
    return null;
  };

  const monthStats = calendarData.filter(day => day !== null);
  const totalDays = monthStats.length;
  const perfectDays = monthStats.filter(day => day.completionRate === 100).length;
  const activeDays = monthStats.filter(day => day.completionRate > 0).length;
  const averageCompletion = totalDays > 0 
    ? Math.round(monthStats.reduce((acc, day) => acc + day.completionRate, 0) / totalDays)
    : 0;

  if (compact) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              {MONTH_NAMES[currentDate.getMonth()]}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth(-1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth(1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Mini calendar grid */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {DAY_NAMES.map(day => (
              <div key={day} className="text-xs font-medium text-center text-gray-500 py-1">
                {day[0]}
              </div>
            ))}
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center text-xs relative ${
                  day 
                    ? `${getCompletionColor(day.completionRate)} rounded cursor-pointer hover:opacity-80 transition-opacity`
                    : ''
                }`}
              >
                {day && (
                  <>
                    <span className={`font-medium ${day.isToday ? 'font-bold' : ''}`}>
                      {day.day}
                    </span>
                    {day.completionRate === 100 && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-blue-600">{perfectDays}</div>
              <div className="text-xs text-gray-600">Perfect Days</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-600">{averageCompletion}%</div>
              <div className="text-xs text-gray-600">Avg Complete</div>
            </div>
          </div>
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
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              Habit Calendar
            </h2>
            <p className="text-gray-600 mt-1">
              Track your habit completion over time
            </p>
          </div>
          <Button
            variant="outline"
            onClick={goToToday}
            className="flex items-center gap-2"
          >
            <Target className="h-4 w-4" />
            Today
          </Button>
        </div>
      )}

      {/* Month Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{perfectDays}</div>
            <div className="text-sm text-gray-600">Perfect Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeDays}</div>
            <div className="text-sm text-gray-600">Active Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{averageCompletion}%</div>
            <div className="text-sm text-gray-600">Avg Completion</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{habits.length}</div>
            <div className="text-sm text-gray-600">Total Habits</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">
              {MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(-1)}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth(1)}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {DAY_NAMES.map(day => (
              <div key={day} className="text-sm font-semibold text-center text-gray-700 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  day 
                    ? `${getCompletionColor(day.completionRate)} hover:scale-105 cursor-pointer border border-gray-200`
                    : ''
                } ${day?.isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                title={day ? `${day.completedCount}/${day.totalCount} habits completed` : ''}
              >
                {day && (
                  <>
                    <div className="flex items-center justify-center mb-1">
                      <span className={`text-sm font-medium ${day.isToday ? 'font-bold' : ''}`}>
                        {day.day}
                      </span>
                      {getCompletionIcon(day)}
                    </div>
                    
                    {day.totalCount > 0 && (
                      <div className="text-xs text-center">
                        <div className={`font-medium ${
                          day.completionRate === 100 ? 'text-green-700' :
                          day.completionRate > 0 ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {day.completedCount}/{day.totalCount}
                        </div>
                      </div>
                    )}

                    {day.isToday && (
                      <Badge variant="secondary" className="text-xs mt-1 bg-blue-100 text-blue-700">
                        Today
                      </Badge>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 rounded"></div>
                <span>No habits</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 rounded"></div>
                <span>Low completion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                <span>Partial completion</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded"></div>
                <span>Perfect day</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
