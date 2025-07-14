import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import ChatMessage from '../../../models/ChatMessage';
import { sendChatMessage, buildWellnessPrompt } from '../../../lib/openrouter';
import { detectTriggers, getCrisisResponse, getConcernResponse } from '../../../lib/triggers';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const body = await request.json();
    const { message, guestId, conversationId, privacy = false, isAutoGreeting = false } = body;
    
    // Validate required fields
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Check if user is authenticated or guest
    if (!userId && !guestId) {
      return NextResponse.json(
        { error: 'User authentication or guest ID required' },
        { status: 401 }
      );
    }
    
    const userIdentifier = userId 
      ? { userId }
      : { guestId };
    
    const currentConversationId = conversationId || `conv_${Date.now()}`;
    
    // Detect triggers in the message (skip for auto-greetings)
    const triggerAnalysis = isAutoGreeting ? { level: 'low', crisis: false, concern: false } : detectTriggers(message);
    
    // Save user message (skip for auto-greetings)
    let userMessage = null;
    if (!isAutoGreeting) {
      userMessage = await ChatMessage.create({
        ...userIdentifier,
        conversationId: currentConversationId,
        message: message.trim(),
        role: 'user',
        privacy,
        triggerDetection: {
          level: triggerAnalysis.level,
          keywords: triggerAnalysis.crisis || triggerAnalysis.concern ? 
            [...(triggerAnalysis.crisis ? ['crisis'] : []), ...(triggerAnalysis.concern ? ['concern'] : [])] : [],
          requiresIntervention: triggerAnalysis.crisis,
        },
      });
    }
    
    let assistantResponse;
    let responseType = 'text';
    
    // Handle crisis situations
    if (triggerAnalysis.crisis) {
      const crisisResponse = getCrisisResponse();
      assistantResponse = `${crisisResponse.message} Please reach out to someone who can help - you can call 988 (Suicide Prevention Lifeline) or text HOME to 741741 (Crisis Text Line) anytime. You matter and you're not alone in this.`;
      responseType = 'crisis_support';
    }
    // Handle concern situations
    else if (triggerAnalysis.concern) {
      const concernResponse = getConcernResponse();
      assistantResponse = `${concernResponse.message} Sometimes it helps to try some deep breathing or talk to someone you trust. If these feelings keep happening, maybe consider talking to a counselor - they're really good at helping with this stuff.`;
      responseType = 'guided';
    }
    // Regular AI response
    else {
      try {
        // Get conversation context (last 8 messages for better context)
        const contextMessages = await ChatMessage.find({
          ...userIdentifier,
          conversationId: currentConversationId,
        })
        .sort({ createdAt: -1 })
        .limit(8);
        
        // Build context for AI - only include actual conversation messages
        const conversationHistory = contextMessages.reverse().map(msg => ({
          role: msg.role,
          content: msg.message,
        }));
        
        // Get user context - including preferences and recent mood
        let userContext = {
          conversationLength: contextMessages.length,
          triggerLevel: triggerAnalysis.level,
        };

        // Get user preferences and recent mood if available
        if (userId) {
          // For authenticated users, get from User model
          try {
            const User = (await import('../../../models/User')).default;
            const user = await User.findOne({ clerkId: userId });
            if (user) {
              userContext.userPreferences = user.preferences || {};
              userContext.userName = user.preferences?.name || '';
              userContext.communicationStyle = user.preferences?.communicationStyle || 'supportive';
            }
          } catch (error) {
            console.error('Error fetching user preferences:', error);
          }

          // Get recent mood
          try {
            const MoodEntry = (await import('../../../models/MoodEntry')).default;
            const recentMood = await MoodEntry.findOne({ userId })
              .sort({ createdAt: -1 });
            if (recentMood) {
              userContext.currentMood = recentMood.mood;
            }
          } catch (error) {
            console.error('Error fetching recent mood:', error);
          }
        } else if (guestId) {
          // For guests, we could get from localStorage data passed in request
          // For now, use defaults - in a future update we could pass this from frontend
          userContext.userPreferences = {};
          userContext.communicationStyle = 'supportive';
        }
        
        const messages = buildWellnessPrompt(message, userContext, conversationHistory);
        assistantResponse = await sendChatMessage(messages);
      } catch (aiError) {
        console.error('AI API error:', aiError);
        assistantResponse = "I'm here to listen and support you. While I'm having some technical difficulties right now, please know that your wellbeing matters. If you're in crisis, please consider reaching out to a mental health professional or crisis hotline.";
      }
    }
    
    // Save assistant message
    const assistantMessage = await ChatMessage.create({
      ...userIdentifier,
      conversationId: currentConversationId,
      message: assistantResponse,
      role: 'assistant',
      messageType: responseType,
      privacy,
      triggerDetection: {
        level: triggerAnalysis.level,
        requiresIntervention: triggerAnalysis.crisis,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: {
        userMessage,
        assistantMessage,
        conversationId: currentConversationId,
        triggerAnalysis,
      },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit')) || 50;
    
    // Check if user is authenticated or guest
    if (!userId && !guestId) {
      return NextResponse.json(
        { error: 'User authentication or guest ID required' },
        { status: 401 }
      );
    }
    
    const query = userId 
      ? { userId }
      : { guestId };
    
    if (conversationId) {
      query.conversationId = conversationId;
    }
    
    // Fetch chat messages
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Get unique conversations
    const conversations = await ChatMessage.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastMessageAt: { $first: '$createdAt' },
          messageCount: { $sum: 1 },
          hasHighTriggers: {
            $max: {
              $cond: [
                { $eq: ['$triggerDetection.level', 'high'] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } },
      { $limit: 10 }
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        messages: messages.reverse(),
        conversations,
      },
    });
    
  } catch (error) {
    console.error('Chat GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages', details: error.message },
      { status: 500 }
    );
  }
}
