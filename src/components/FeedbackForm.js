'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Save, Heart, Calendar, Star } from 'lucide-react';
import { MoodScale } from '@/components/MoodGauge';
import { cn } from '@/lib/utils';

export function FeedbackForm({
  onSubmit,
  isLoading = false,
  initialData = {},
  type = 'journal', // 'journal' | 'feedback' | 'reflection'
  className
}) {
  const [formData, setFormData] = useState({
    content: initialData.content || '',
    mood: initialData.mood || 3,
    tags: initialData.tags || [],
    gratitude: initialData.gratitude || '',
    goals: initialData.goals || '',
    ...initialData
  });

  const [newTag, setNewTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.content.trim()) {
      onSubmit({
        ...formData,
        type,
        timestamp: new Date().toISOString()
      });
    }
  };

  const addTag = (tag) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const suggestedTags = [
    'anxiety', 'gratitude', 'progress', 'challenge', 'breakthrough',
    'relationships', 'work', 'health', 'mindfulness', 'growth'
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {type === 'journal' && <Calendar className="h-5 w-5" />}
          {type === 'feedback' && <Star className="h-5 w-5" />}
          {type === 'reflection' && <Heart className="h-5 w-5" />}
          {type === 'journal' ? 'Journal Entry' : 
           type === 'feedback' ? 'Session Feedback' : 'Daily Reflection'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {type === 'journal' ? 'How was your day?' :
               type === 'feedback' ? 'How did this session help you?' :
               'What\'s on your mind?'}
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder={
                type === 'journal' ? 'Write about your thoughts, feelings, and experiences...' :
                type === 'feedback' ? 'Share your thoughts about this session...' :
                'Reflect on your current state of mind...'
              }
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Mood Scale */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Mood</label>
            <MoodScale
              value={formData.mood}
              onChange={(mood) => setFormData(prev => ({ ...prev, mood }))}
            />
          </div>

          {/* Gratitude Section (for journal entries) */}
          {type === 'journal' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">What are you grateful for today?</label>
              <Textarea
                value={formData.gratitude}
                onChange={(e) => setFormData(prev => ({ ...prev, gratitude: e.target.value }))}
                placeholder="Three things I'm grateful for..."
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Goals Section (for reflections) */}
          {type === 'reflection' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Goals for tomorrow</label>
              <Textarea
                value={formData.goals}
                onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                placeholder="What do you want to focus on tomorrow?"
                className="min-h-[80px]"
              />
            </div>
          )}

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Tags</label>
            
            {/* Current Tags */}
            {(Array.isArray(formData.tags) && formData.tags.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}

            {/* Add New Tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(newTag);
                  }
                }}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-1 text-sm border border-input rounded-md"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>

            {/* Suggested Tags */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Suggested:</p>
              <div className="flex flex-wrap gap-1">
                {suggestedTags
                  .filter(tag => !formData.tags.includes(tag))
                  .slice(0, 6)
                  .map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.content.trim()}
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
