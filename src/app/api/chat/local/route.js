import { NextResponse } from 'next/server';
import { sendChatMessage, buildWellnessPrompt } from '../../../../lib/openrouter';

export async function POST(request) {
  try {
    const { message, guestId, privacy = false, isGuest = true } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!isGuest) {
      return NextResponse.json(
        { success: false, error: 'This endpoint is for guest users only' },
        { status: 400 }
      );
    }

    // For guests, we'll do a simple AI response without storing anything in MongoDB
    try {
      // Get conversation history from localStorage would be handled client-side
      // For now, we'll just process the current message
      const context = {
        userPreferences: {
          communicationStyle: 'supportive'
        },
        currentMood: null,
        userName: 'friend'
      };

      // Build the messages array for the AI
      const messages = buildWellnessPrompt(message, context, []);

      // Get AI response
      const aiResponse = await sendChatMessage(messages);

      // Simple trigger analysis for guests (basic keyword detection)
      const triggerAnalysis = analyzeTriggers(message);

      return NextResponse.json({
        success: true,
        message: aiResponse,
        messageType: triggerAnalysis.level === 'high' ? 'crisis_support' : 'response',
        triggerAnalysis
      });

    } catch (aiError) {
      console.error('OpenRouter API error:', aiError);
      
      // Fallback response for guests when AI fails
      const fallbackResponse = getFallbackResponse(message);
      
      return NextResponse.json({
        success: true,
        message: fallbackResponse,
        messageType: 'fallback',
        triggerAnalysis: { level: 'low', triggers: [] }
      });
    }

  } catch (error) {
    console.error('Local chat API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simple trigger analysis function for guests
function analyzeTriggers(message) {
  const lowerMessage = message.toLowerCase();
  
  // High-risk keywords
  const highRiskKeywords = [
    'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die', 
    'self harm', 'self-harm', 'cutting', 'hurt myself', 'no point living'
  ];
  
  // Medium-risk keywords  
  const mediumRiskKeywords = [
    'depressed', 'depression', 'hopeless', 'worthless', 'panic attack',
    'can\'t go on', 'give up', 'everything is wrong', 'hate myself'
  ];

  const highTriggers = highRiskKeywords.filter(keyword => lowerMessage.includes(keyword));
  const mediumTriggers = mediumRiskKeywords.filter(keyword => lowerMessage.includes(keyword));

  if (highTriggers.length > 0) {
    return {
      level: 'high',
      triggers: highTriggers,
      requiresIntervention: true
    };
  } else if (mediumTriggers.length > 0) {
    return {
      level: 'medium', 
      triggers: mediumTriggers,
      requiresIntervention: false
    };
  } else {
    return {
      level: 'low',
      triggers: [],
      requiresIntervention: false
    };
  }
}

// Fallback responses when AI is unavailable
function getFallbackResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Crisis-related fallback
  if (lowerMessage.includes('suicide') || lowerMessage.includes('kill myself') || lowerMessage.includes('end my life')) {
    return "I'm really concerned about you right now. Please reach out for immediate help: Call 988 (Suicide & Crisis Lifeline) or text 'HELLO' to 741741 (Crisis Text Line). You matter, and there are people who want to help you through this difficult time.";
  }
  
  // Anxiety-related fallback
  if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('panic')) {
    return "I hear that you're feeling anxious, and that's really difficult. Try taking some slow, deep breaths - breathe in for 4 counts, hold for 4, then breathe out for 6. You're safe right now. What's one small thing that usually helps you feel a bit calmer?";
  }
  
  // Depression-related fallback
  if (lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless')) {
    return "I'm sorry you're going through such a tough time. Your feelings are valid, and it's okay to not be okay sometimes. Even small steps matter - have you been able to eat or drink water today? Sometimes taking care of our basic needs can help a little.";
  }
  
  // General supportive fallback
  return "Thank you for sharing that with me. I want you to know that I'm here to listen and support you. Your feelings and experiences matter. While I'm having some technical difficulties right now, I encourage you to keep reaching out - whether that's to friends, family, or professional support if you need it.";
}
