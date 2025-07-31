import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/mongoose';
import ChatMessage from '../../../models/ChatMessage';
import { sendChatMessage, buildWellnessPrompt } from '../../../lib/openrouter';
import { detectTriggers, getCrisisResponse, getConcernResponse } from '../../../lib/triggers';
import { auth } from '@clerk/nextjs/server';

export async function POST(request) {
  try {
    const { userId } = await auth();
    const body = await request.json();
    const { message, guestId, conversationId, privacy = false, isAutoGreeting = false, conversationHistory = [] } = body;
    
    // Only connect to database for authenticated users
    if (userId) {
      await connectToDatabase();
    }
    
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
    
    // Save user message (skip for auto-greetings and guests)
    let userMessage = null;
    if (!isAutoGreeting && userId) {
      // Only save to database for authenticated users
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
    } else if (!isAutoGreeting && guestId) {
      // For guests, create a mock user message object for response structure
      userMessage = {
        id: `guest_${Date.now()}`,
        message: message.trim(),
        role: 'user',
        timestamp: new Date().toISOString(),
        guestId,
        conversationId: currentConversationId,
      };
    }
    
    let assistantResponse;
    let responseType = 'text';
    
    // Handle crisis situations
    if (triggerAnalysis.crisis) {
      const detectedLang = triggerAnalysis.detectedLanguage || 'english';
      const crisisResponse = getCrisisResponse(detectedLang);
      
      const additionalHelp = {
        english: "Please reach out to someone who can help - you can call 988 (Suicide Prevention Lifeline) or text HOME to 741741 (Crisis Text Line) anytime. You matter and you're not alone in this.",
        hinglish: "Please kisi se help lene ke liye reach out karo - aap 988 (Suicide Prevention Lifeline) call kar sakte ho ya HOME text kar sakte ho 741741 (Crisis Text Line) par anytime. Aap matter karte ho aur aap is mein akele nahi ho.",
        spanish: "Por favor contacta a alguien que pueda ayudarte - puedes llamar al 988 (Línea de Prevención del Suicidio) o enviar un texto con HOME al 741741 (Línea de Crisis por Texto) en cualquier momento. Importas y no estás solo en esto.",
        french: "S'il te plaît, contacte quelqu'un qui peut t'aider - tu peux appeler le 988 (Ligne de Prévention du Suicide) ou envoyer HOME par texto au 741741 (Ligne de Crise par Texto) à tout moment. Tu comptes et tu n'es pas seul dans ça.",
        german: "Bitte wende dich an jemanden, der helfen kann - du kannst 988 (Suizidpräventions-Hotline) anrufen oder HOME an 741741 (Krisen-Textlinie) senden, jederzeit. Du bist wichtig und nicht allein damit."
      };
      
      assistantResponse = `${crisisResponse.message} ${additionalHelp[detectedLang] || additionalHelp.english}`;
      responseType = 'crisis_support';
    }
    // Handle concern situations
    else if (triggerAnalysis.concern) {
      const detectedLang = triggerAnalysis.detectedLanguage || 'english';
      const concernResponse = getConcernResponse(detectedLang);
      
      const additionalSupport = {
        english: "Sometimes it helps to try some deep breathing or talk to someone you trust. If these feelings keep happening, maybe consider talking to a counselor - they're really good at helping with this stuff.",
        hinglish: "Kabhi kabhi deep breathing try karna ya kisi trusted person se baat karna help karta hai. Agar ye feelings continue rahe to counselor se baat karna consider karo - woh is type ki cheezein handle karne mein bahut ache hote hain.",
        spanish: "A veces ayuda probar respiración profunda o hablar con alguien en quien confías. Si estos sentimientos continúan, tal vez considera hablar con un consejero - son muy buenos ayudando con este tipo de cosas.",
        french: "Parfois ça aide d'essayer la respiration profonde ou de parler à quelqu'un en qui tu as confiance. Si ces sentiments continuent, peut-être considère parler à un conseiller - ils sont très bons pour aider avec ce genre de choses.",
        german: "Manchmal hilft es, tiefes Atmen zu versuchen oder mit jemandem zu sprechen, dem du vertraust. Wenn diese Gefühle anhalten, erwäge vielleicht, mit einem Berater zu sprechen - sie sind sehr gut darin, bei solchen Sachen zu helfen."
      };
      
      assistantResponse = `${concernResponse.message} ${additionalSupport[detectedLang] || additionalSupport.english}`;
      responseType = 'guided';
    }
    // Regular AI response
    else {
      try {
        // Get conversation context
        let contextHistory = [];
        
        if (userId) {
          // For authenticated users, get from database
          const contextMessages = await ChatMessage.find({
            ...userIdentifier,
            conversationId: currentConversationId,
          })
          .sort({ createdAt: -1 })
          .limit(8);
          
          contextHistory = contextMessages.reverse().map(msg => ({
            role: msg.role,
            content: msg.message,
          }));
        } else if (guestId && conversationHistory) {
          // For guests, use the conversation history passed from frontend
          contextHistory = conversationHistory.slice(-8); // Last 8 messages
        }
        
        // Get user context - including preferences and recent mood
        let userContext = {
          conversationLength: contextHistory.length,
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
        
        const messages = buildWellnessPrompt(message, userContext, contextHistory);
        assistantResponse = await sendChatMessage(messages);
      } catch (aiError) {
        console.error('AI API error:', aiError);
        assistantResponse = "I'm here to listen and support you. While I'm having some technical difficulties right now, please know that your wellbeing matters. If you're in crisis, please consider reaching out to a mental health professional or crisis hotline.";
      }
    }
    
    // Save assistant message (only for authenticated users)
    let assistantMessage = null;
    if (userId) {
      assistantMessage = await ChatMessage.create({
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
    } else if (guestId) {
      // For guests, create a mock assistant message object for response structure
      assistantMessage = {
        id: `guest_ai_${Date.now()}`,
        message: assistantResponse,
        role: 'assistant',
        messageType: responseType,
        timestamp: new Date().toISOString(),
        guestId,
        conversationId: currentConversationId,
        triggerDetection: {
          level: triggerAnalysis.level,
          requiresIntervention: triggerAnalysis.crisis,
        },
      };
    }
    
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
