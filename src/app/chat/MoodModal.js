import { useState } from 'react';
import { motion } from 'framer-motion';

const moods = [
{ value: 1, label: 'Terrible', img: '/asset/terrible.png', color: 'bg-red-500' },
{ value: 2, label: 'Poor', img: '/asset/sad.png', color: 'bg-orange-500' },
{ value: 3, label: 'Okay', img: '/asset/neutral.png', color: 'bg-yellow-500' },
{ value: 4, label: 'Good', img: '/asset/happy.png', color: 'bg-green-500' },
{ value: 5, label: 'Excellent', img: '/asset/excellet.png', color: 'bg-blue-500' }
];

export default function MoodModal({ onClose, onSave }) {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState('');

  
  const handleSave = () => {
    onSave({
      mood,
      emoji: moods.find(m => m.value === mood)?.emoji || '😐',
      note: note.trim(),
    });
  };

  return (
    <motion.div 
      className="fixed inset-0 flex items-center justify-center p-4 z-50" 
      style={{ background: 'rgba(247,245,250,0.6)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#6E55A0' }}>How are you feeling?</h2>
          <p className="text-muted-foreground">Check in your mood before chatting</p>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
          {moods.map((moodOption) => (
            <button
              key={moodOption.value}
              onClick={() => setMood(moodOption.value)}
              className={`p-3 rounded-xl text-center transition-all duration-200 ${
                mood === moodOption.value 
                  ? `${moodOption.color} text-white ring-2 ring-offset-2` 
                  : 'bg-muted hover:bg-accent'
              }`}
              style={mood === moodOption.value ? { ringColor: '#8A6FBF' } : {}}
            >
              <div className="mb-1 flex items-center justify-center">
                <img src={moodOption.img} alt={moodOption.label} className="w-8 h-8" />
              </div>
              <div className="text-xs font-medium">{moodOption.label}</div>
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How was your day? (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What made you feel this way?"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none"
            style={{ focusRingColor: '#8A6FBF' }}
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border text-muted-foreground rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ 
              background: 'linear-gradient(135deg, #8A6FBF 0%, #6E55A0 100%)',
            }}
          >
            Save Mood
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
