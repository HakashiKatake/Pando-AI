'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ChevronDown, 
  Edit, 
  Trash2,
  X,
  Calendar,
  Filter,
  Plus,
  BookOpen,
  Heart,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { FeedbackForm } from '@/components/FeedbackForm';
import { useFeedbackStore } from '@/lib/store';
import { useDataInitialization } from '@/lib/useDataInitialization';
import Header from '@/components/Header';

const JournalEntries = () => {
  const { user } = useUser();
  const { entries, addEntry, loadEntriesFromAPI, isLoading, deleteEntry, updateEntry } = useFeedbackStore();
  const dataInit = useDataInitialization();
  
  // Modal and form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  
  // Form states
  const [selectedMood, setSelectedMood] = useState("");
  const [title, setTitle] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [gratitude, setGratitude] = useState("");
  const [goals, setGoals] = useState("");
  const [tags, setTags] = useState("");
  
  // Filter states
  const [dateFilter, setDateFilter] = useState("All time");
  const [moodFilter, setMoodFilter] = useState("All Moods");
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");

  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
    
      // Update time every second
      useEffect(() => {
        const updateTime = () => {
          const now = new Date()
          setCurrentTime(now.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }))
          
          // Format date as "Jul 17 - Jul 31" (current date to end of month)
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          const startDateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          const endDateStr = endOfMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          setCurrentDate(`${startDateStr} - ${endDateStr}`)
        }
    
        updateTime()
        const interval = setInterval(updateTime, 1000)
      })


  useEffect(() => {
    if (dataInit.userId || dataInit.guestId) {
      loadEntriesFromAPI(dataInit.userId, dataInit.guestId);
    }
  }, [dataInit.userId, dataInit.guestId, loadEntriesFromAPI]);

  // Filter entries based on all criteria
  const filteredEntries = entries
    .filter(entry => {
      // Type filter
      if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
      
      // Search filter
      if (searchQuery && !entry.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Date filter
      if (dateFilter !== "All time") {
        const entryDate = new Date(entry.timestamp);
        const today = new Date();
        
        switch (dateFilter) {
          case "Today":
            if (entryDate.toDateString() !== today.toDateString()) return false;
            break;
          case "This week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (entryDate < weekAgo) return false;
            break;
          case "This month":
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (entryDate < monthAgo) return false;
            break;
        }
      }
      
      // Mood filter
      if (moodFilter !== "All Moods") {
        const moodValue = entry.mood;
        switch (moodFilter) {
          case "Happy":
            if (moodValue < 4) return false;
            break;
          case "Neutral":
            if (moodValue < 3 || moodValue > 3) return false;
            break;
          case "Sad":
            if (moodValue > 2) return false;
            break;
          case "Excited":
            if (moodValue !== 5) return false;
            break;
          case "Stressed":
            if (moodValue > 2) return false;
            break;
        }
      }
      
      return true;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const moodEmojis = ["😢", "😞", "😐", "😊", "😄"];
  const moodToEmoji = (mood) => {
    return moodEmojis[mood - 1] || "😐";
  };

  const getMoodColor = (mood) => {
    if (mood >= 4) return '#22C55E'; // Green
    if (mood >= 3) return '#EAB308'; // Yellow
    if (mood >= 2) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const journalPrompts = [
    {
      text: "What are three things you're grateful for today?",
      bgColor: "#F3E8FF", // Light purple
      textColor: "#C084FC"
    },
    {
      text: "Describe a moment today when you felt truly present.",
      bgColor: "#DBEAFE", // Light blue
      textColor: "#60A5FA"
    },
    {
      text: "How have you practiced self-care this week?",
      bgColor: "#FEF3C7", // Light yellow
      textColor: "#F59E0B"
    },
    {
      text: "What's one small step you can take tomorrow toward your wellness goals?",
      bgColor: "#D1FAE5", // Light green
      textColor: "#34D399"
    }
  ];

  const handleSubmitEntry = async (entryData) => {
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, entryData, dataInit.userId, dataInit.guestId);
        setEditingEntry(null);
      } else {
        await addEntry(entryData, dataInit.userId, dataInit.guestId);
      }
      setShowForm(false);
      setIsModalOpen(false);
      // Reset form
      setTitle("");
      setThoughts("");
      setGratitude("");
      setGoals("");
      setTags("");
      setSelectedMood("");
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleSaveEntry = () => {
    const entryData = {
      type: 'journal',
      content: thoughts,
      mood: moodEmojis.indexOf(selectedMood) + 1,
      gratitude: gratitude || undefined,
      goals: goals || undefined,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      title: title || undefined
    };
    
    handleSubmitEntry(entryData);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setShowForm(false);
    setEditingEntry(null);
    setTitle("");
    setThoughts("");
    setGratitude("");
    setGoals("");
    setTags("");
    setSelectedMood("");
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title || "");
    setThoughts(entry.content || "");
    setGratitude(entry.gratitude || "");
    setGoals(entry.goals || "");
    setTags(entry.tags ? entry.tags.join(', ') : "");
    setSelectedMood(moodToEmoji(entry.mood));
    setShowForm(true);
  };

  const handleDelete = async (entryId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entryId, dataInit.userId, dataInit.guestId);
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  // Show detailed form view
  if (showForm) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
       <Header />

        <div className="pt-20 px-4 py-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold" style={{ color: '#6E55A0' }}>
              {editingEntry ? 'Edit Entry' : 'New Entry'}
            </h1>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          
          <FeedbackForm
            onSubmit={handleSubmitEntry}
            isLoading={isLoading}
            type="journal"
            initialData={editingEntry}
          />
        </div>
      </div>
    );
  }

  // Show detailed entry view
  if (selectedEntry) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
        {/* Header */}
        <motion.header 
          className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-30"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                <span className="text-lg">🐼</span>
              </div>
              <h1 className="text-xl font-semibold" style={{ color: '#6E55A0' }}>PandoAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{currentDate}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <Button className="bg-red-500 hover:bg-red-600 text-white">SOS</Button>
            </div>
          </div>
        </motion.header>

        <div className="pt-20 px-4 py-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setSelectedEntry(null)}>
              ← Back to Entries
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{selectedEntry.type}</Badge>
              <span className="text-sm font-medium" style={{ color: getMoodColor(selectedEntry.mood) }}>
                Mood: {selectedEntry.mood}/5
              </span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#6E55A0' }}>
                {selectedEntry.type === 'journal' && <BookOpen className="h-5 w-5" />}
                {selectedEntry.type === 'reflection' && <Heart className="h-5 w-5" />}
                Entry from {formatDate(selectedEntry.timestamp)}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {selectedEntry.title && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: '#8A6FBF' }}>Title</h3>
                  <p style={{ color: '#6E55A0' }}>{selectedEntry.title}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-2" style={{ color: '#8A6FBF' }}>Content</h3>
                <p style={{ color: '#6E55A0' }} className="whitespace-pre-wrap">
                  {selectedEntry.content}
                </p>
              </div>

              {selectedEntry.gratitude && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: '#8A6FBF' }}>Gratitude</h3>
                  <p style={{ color: '#6E55A0' }} className="whitespace-pre-wrap">
                    {selectedEntry.gratitude}
                  </p>
                </div>
              )}

              {selectedEntry.goals && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: '#8A6FBF' }}>Goals</h3>
                  <p style={{ color: '#6E55A0' }} className="whitespace-pre-wrap">
                    {selectedEntry.goals}
                  </p>
                </div>
              )}

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2" style={{ color: '#8A6FBF' }}>Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedEntry.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleEdit(selectedEntry)}
                  className="p-3 text-gray-400 rounded-lg hover:bg-purple-50 transition-colors"
                  style={{ color: '#8A6FBF' }}
                >
                  <Edit className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(selectedEntry.id)}
                  className="p-3 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F5FA' }}>
      {/* Header */}
      <motion.header 
        className="bg-white border-b border-gray-200 px-6 py-4 fixed top-0 left-0 right-0 z-30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-lg">🐼</span>
            </div>
            <h1 className="text-xl font-semibold" style={{ color: '#6E55A0' }}>PandoAI</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{currentTime}</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            <Button className="bg-red-500 hover:bg-red-600 text-white">SOS</Button>
          </div>
        </div>
      </motion.header>

      {/* Container */}
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ color: '#6E55A0' }}>Journal Entries</h1>
            <p className="text-sm sm:text-base" style={{ color: '#8A6FBF' }}>
              Track your thoughts, feelings, and wellness journey
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="px-4 sm:px-6 py-2 sm:py-3 text-white rounded-full font-medium text-sm sm:text-base w-full sm:w-auto"
            style={{ backgroundColor: '#8A6FBF' }}
          >
            + New Entry
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Filters and Entries */}
          <div className="lg:col-span-8">
            {/* Stats Cards */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}>
                    <BookOpen className="h-5 w-5" style={{ color: '#8A6FBF' }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#6E55A0' }}>
                      {entries.filter(e => e.type === 'journal').length}
                    </p>
                    <p className="text-xs" style={{ color: '#8A6FBF' }}>Journal Entries</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}>
                    <Heart className="h-5 w-5" style={{ color: '#8A6FBF' }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#6E55A0' }}>
                      {entries.filter(e => e.type === 'reflection').length}
                    </p>
                    <p className="text-xs" style={{ color: '#8A6FBF' }}>Reflections</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#E3DEF1' }}>
                    <Calendar className="h-5 w-5" style={{ color: '#8A6FBF' }} />
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#6E55A0' }}>
                      {entries.length > 0 ? Math.round(entries.reduce((acc, e) => acc + e.mood, 0) / entries.length * 10) / 10 : 0}
                    </p>
                    <p className="text-xs" style={{ color: '#8A6FBF' }}>Avg Mood</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Filters Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl p-4 sm:p-6 mb-6 shadow-sm"
            >
              {/* Type Filter Buttons */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#8A6FBF' }}>Type</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'All', icon: Filter },
                    { key: 'journal', label: 'Journal', icon: BookOpen },
                    { key: 'reflection', label: 'Reflection', icon: Heart }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setTypeFilter(key)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                        typeFilter === key
                          ? 'text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      style={typeFilter === key ? { backgroundColor: '#8A6FBF' } : { backgroundColor: '#E5E7EB' }}
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Date Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#8A6FBF' }}>Date</label>
                  <div className="relative">
                    <select 
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      style={{ color: '#8A6FBF', backgroundColor: '#E5E7EB' }}
                    >
                      <option>All time</option>
                      <option>Today</option>
                      <option>This week</option>
                      <option>This month</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Mood Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#8A6FBF' }}>Mood</label>
                  <div className="relative">
                    <select 
                      value={moodFilter}
                      onChange={(e) => setMoodFilter(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                      style={{ color: '#8A6FBF', backgroundColor: '#E5E7EB' }}
                    >
                      <option>All Moods</option>
                      <option>Happy</option>
                      <option>Sad</option>
                      <option>Neutral</option>
                      <option>Excited</option>
                      <option>Stressed</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#8A6FBF' }}>Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Entries"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    style={{ backgroundColor: '#E5E7EB' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Journal Entries */}
            {filteredEntries.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl p-12 text-center shadow-sm"
              >
                <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: '#8A6FBF' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: '#6E55A0' }}>No entries found</h3>
                <p className="mb-4" style={{ color: '#8A6FBF' }}>
                  {searchQuery 
                    ? "Try adjusting your search terms or filters"
                    : "Start your wellness journey by creating your first entry"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#8A6FBF' }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Entry
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {filteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-xl p-4 sm:p-6 border-t-4 shadow-sm cursor-pointer"
                    style={{ borderTopColor: getMoodColor(entry.mood) }}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-lg font-semibold" style={{ color: '#6E55A0' }}>
                            {entry.title || 'Untitled Entry'}
                          </h3>
                          <div className="flex items-center gap-1">
                            <span className="text-xl">{moodToEmoji(entry.mood)}</span>
                            <span className="text-sm font-medium text-gray-600">{entry.mood}/5</span>
                          </div>
                          <Badge variant="outline" className="text-xs">{entry.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{formatDate(entry.timestamp)}</p>
                        <p className="leading-relaxed text-sm sm:text-base line-clamp-3" style={{ color: '#6E55A0' }}>
                          {entry.content}
                        </p>
                        
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
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
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEdit(entry)}
                        className="p-2 sm:p-3 text-gray-400 rounded-lg hover:bg-purple-50 transition-colors touch-manipulation"
                        style={{ color: '#8A6FBF' }}
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 sm:p-3 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors touch-manipulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Journal Prompts Container */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
              <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: '#8A6FBF' }}>
                Journal Prompts
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Need inspiration? Try one of these prompts:
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                {journalPrompts.map((prompt, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-3 sm:p-4 rounded-xl cursor-pointer transition-all touch-manipulation"
                    style={{ 
                      backgroundColor: prompt.bgColor,
                      color: prompt.textColor
                    }}
                    onClick={() => {
                      setThoughts(prompt.text);
                      setIsModalOpen(true);
                    }}
                  >
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      {prompt.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
            onClick={handleCancel}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#6E55A0' }}>New Journal Entry</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Title */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter a title for your entry..."
                />
              </div>

              {/* Mood */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Mood</label>
                <div className="flex gap-2 sm:gap-3 justify-center sm:justify-start">
                  {moodEmojis.map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedMood(emoji)}
                      className={`text-2xl sm:text-3xl p-2 sm:p-3 rounded-lg transition-all touch-manipulation ${
                        selectedMood === emoji 
                          ? 'bg-purple-100 ring-2 ring-purple-500' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Your thoughts */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your thoughts</label>
                <textarea
                  value={thoughts}
                  onChange={(e) => setThoughts(e.target.value)}
                  rows={6}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base"
                  placeholder="What's on your mind today?"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors order-2 sm:order-1 text-sm sm:text-base touch-manipulation"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEntry}
                  className="px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg font-medium order-1 sm:order-2 text-sm sm:text-base touch-manipulation"
                  style={{ backgroundColor: '#8A6FBF' }}
                  disabled={!thoughts.trim() || !selectedMood}
                >
                  Save Entry
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default JournalEntries