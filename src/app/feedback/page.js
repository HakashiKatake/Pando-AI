'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Calendar, Filter, Search, Plus, BookOpen, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FeedbackForm } from '@/components/FeedbackForm';
import { useFeedbackStore } from '@/lib/store';
import { useDataInitialization } from '@/lib/useDataInitialization';

export default function FeedbackPage() {
  const { user } = useUser();
  const { entries, addEntry, loadEntriesFromAPI, isLoading } = useFeedbackStore();
  const dataInit = useDataInitialization();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // all, journal, feedback, reflection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    if (dataInit.userId || dataInit.guestId) {
      loadEntriesFromAPI(dataInit.userId, dataInit.guestId);
    }
  }, [dataInit.userId, dataInit.guestId, loadEntriesFromAPI]);

  const handleSubmitEntry = async (entryData) => {
    try {
      await addEntry(entryData, dataInit.userId, dataInit.guestId);
      setShowForm(false);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const filteredEntries = entries
    .filter(entry => {
      if (filter !== 'all' && entry.type !== filter) return false;
      if (searchTerm && !entry.content.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const getMoodColor = (mood) => {
    if (mood >= 4) return 'text-green-500';
    if (mood >= 3) return 'text-yellow-500';
    if (mood >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">New Entry</h1>
          <Button variant="outline" onClick={() => setShowForm(false)}>
            Cancel
          </Button>
        </div>
        
        <FeedbackForm
          onSubmit={handleSubmitEntry}
          isLoading={isLoading}
          type="journal"
        />
      </div>
    );
  }

  if (selectedEntry) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setSelectedEntry(null)}>
            ← Back to Entries
          </Button>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{selectedEntry.type}</Badge>
            <span className={`text-sm font-medium ${getMoodColor(selectedEntry.mood)}`}>
              Mood: {selectedEntry.mood}/5
            </span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {selectedEntry.type === 'journal' && <BookOpen className="h-5 w-5" />}
                {selectedEntry.type === 'reflection' && <Heart className="h-5 w-5" />}
                Entry from {formatDate(selectedEntry.timestamp)}
              </CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Content</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {selectedEntry.content}
              </p>
            </div>

            {selectedEntry.gratitude && (
              <div>
                <h3 className="font-medium mb-2">Gratitude</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedEntry.gratitude}
                </p>
              </div>
            )}

            {selectedEntry.goals && (
              <div>
                <h3 className="font-medium mb-2">Goals</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedEntry.goals}
                </p>
              </div>
            )}

            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-1">
                  {selectedEntry.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Journal & Feedback</h1>
          <p className="text-muted-foreground">
            Track your thoughts, feelings, and wellness journey
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'journal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('journal')}
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Journal
          </Button>
          <Button
            variant={filter === 'reflection' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('reflection')}
          >
            <Heart className="h-4 w-4 mr-1" />
            Reflection
          </Button>
          <Button
            variant={filter === 'feedback' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('feedback')}
          >
            <Filter className="h-4 w-4 mr-1" />
            Feedback
          </Button>
        </div>
        
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.type === 'journal').length}
                </p>
                <p className="text-sm text-muted-foreground">Journal Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {entries.filter(e => e.type === 'reflection').length}
                </p>
                <p className="text-sm text-muted-foreground">Reflections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {entries.length > 0 ? Math.round(entries.reduce((acc, e) => acc + e.mood, 0) / entries.length * 10) / 10 : 0}
                </p>
                <p className="text-sm text-muted-foreground">Avg Mood</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No entries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? "Try adjusting your search terms or filters"
                : "Start your wellness journey by creating your first entry"
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Entry
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <Card 
              key={entry.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedEntry(entry)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{entry.type}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <div className={`text-sm font-medium ${getMoodColor(entry.mood)}`}>
                    {entry.mood}/5
                  </div>
                </div>
                
                <p className="text-muted-foreground line-clamp-3 mb-3">
                  {entry.content}
                </p>
                
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{entry.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
