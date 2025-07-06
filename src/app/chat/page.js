'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAppStore, useChatStore } from '../../lib/store';
import { 
  Send, ArrowLeft, Shield, ShieldOff, Bot, User, 
  AlertTriangle, Heart, RefreshCw, MoreVertical
} from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const { user } = useUser();
  const { guestId, preferences } = useAppStore();
  const { messages, addMessage, setLoading, isLoading, startNewConversation } = useChatStore();
  
  const [input, setInput] = useState('');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      const newConversationId = `conv_${Date.now()}`;
      setConversationId(newConversationId);
      startNewConversation();
    }
  }, [conversationId, startNewConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to store
    addMessage({
      role: 'user',
      message: userMessage,
      privacy: privacyMode,
    });

    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          guestId: !session ? guestId : undefined,
          conversationId,
          privacy: privacyMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add assistant message to store
        addMessage({
          role: 'assistant',
          message: data.data.assistantMessage.message,
          messageType: data.data.assistantMessage.messageType,
          triggerAnalysis: data.data.triggerAnalysis,
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Chat error:', error);
      addMessage({
        role: 'assistant',
        message: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or if you're in crisis, please contact emergency services or call 988.",
        messageType: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    const newConversationId = `conv_${Date.now()}`;
    setConversationId(newConversationId);
    startNewConversation();
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI Wellness Companion</h1>
                <p className="text-sm text-gray-500">Here to support your mental health journey</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPrivacyMode(!privacyMode)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                privacyMode 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={privacyMode ? 'Privacy mode ON - messages are private' : 'Privacy mode OFF'}
            >
              {privacyMode ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
              <span className="text-sm">{privacyMode ? 'Private' : 'Standard'}</span>
            </button>

            <button
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Start new conversation"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>

            <Link 
              href="/emergency"
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              Crisis Support
            </Link>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <WelcomeMessage userName={preferences.name} />
          )}

          {messages.map((message, index) => (
            <MessageBubble 
              key={index} 
              message={message} 
              isUser={message.role === 'user'}
            />
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm p-4 shadow-sm border max-w-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`How are you feeling today, ${preferences.name || 'friend'}? I'm here to listen and support you.`}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={isLoading}
              />
            </div>
            
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>
              {privacyMode && (
                <span className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>Private mode - your messages are encrypted</span>
                </span>
              )}
            </span>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeMessage({ userName }) {
  const suggestions = [
    "I'm feeling anxious about work",
    "Can you help me with breathing exercises?",
    "I'm having trouble sleeping",
    "I feel overwhelmed lately",
    "What are some coping strategies for stress?",
    "I need someone to talk to"
  ];

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Heart className="w-8 h-8 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Hello{userName ? `, ${userName}` : ''}! 👋
      </h2>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        I'm your AI wellness companion. I'm here to provide support, listen to your concerns, 
        and help you with mental health resources. How can I support you today?
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => {
              const input = document.querySelector('textarea');
              if (input) {
                input.value = suggestion;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();
              }
            }}
            className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors border"
          >
            <span className="text-sm text-gray-700">{suggestion}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message, isUser }) {
  const isCrisis = message.messageType === 'crisis_support';
  const isConcern = message.triggerAnalysis?.level === 'medium';

  return (
    <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-gray-400 to-gray-600' 
          : 'bg-gradient-to-br from-blue-500 to-purple-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      
      <div className={`max-w-md lg:max-w-lg ${isUser ? 'ml-auto' : ''}`}>
        <div className={`rounded-2xl p-4 shadow-sm border ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-tr-sm' 
            : isCrisis
              ? 'bg-red-50 border-red-200 rounded-tl-sm'
              : isConcern
                ? 'bg-yellow-50 border-yellow-200 rounded-tl-sm'
                : 'bg-white rounded-tl-sm'
        }`}>
          {isCrisis && (
            <div className="flex items-center space-x-2 mb-3 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Crisis Support Resources</span>
            </div>
          )}
          
          <div className={`prose prose-sm max-w-none ${
            isUser ? 'prose-invert' : isCrisis ? 'prose-red' : 'prose-gray'
          }`}>
            {message.message.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {line.startsWith('**') && line.endsWith('**') ? (
                  <strong>{line.slice(2, -2)}</strong>
                ) : line.startsWith('• ') ? (
                  <span className="block ml-4">• {line.slice(2)}</span>
                ) : (
                  line
                )}
              </p>
            ))}
          </div>
        </div>
        
        <div className={`mt-1 text-xs text-gray-500 ${isUser ? 'text-right' : ''}`}>
          {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
          {message.privacy && (
            <span className="ml-2 inline-flex items-center">
              <Shield className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
