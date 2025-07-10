const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL;

// Updated with better error handling for API response structure
export async function sendChatMessage(messages, model = 'deepseek/deepseek-r1-0528-qwen3-8b:free') {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured');
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 150, // Reduced for shorter responses
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API error response:', errorData);
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different possible response structures
    let content = null;
    
    // Standard OpenAI-compatible format
    if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
      content = data.choices[0]?.message?.content;
    }
    // Alternative response format (some APIs return different structures)
    else if (data.message) {
      content = data.message;
    }
    // Direct content response
    else if (data.content) {
      content = data.content;
    }
    // Response in data field
    else if (data.data) {
      content = data.data.content || data.data.message || data.data;
    }
    // Error response
    else if (data.error) {
      console.error('OpenRouter API returned error:', data.error);
      throw new Error(`OpenRouter API error: ${data.error.message || data.error}`);
    }
    
    if (!content) {
      console.error('Unexpected OpenRouter API response structure:', data);
      return 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.';
    }
    
    return content;
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw error;
  }
}

export function buildWellnessPrompt(userMessage, context = {}, conversationHistory = []) {
  const { 
    userPreferences = {}, 
    currentMood = null, 
    userName = '',
    communicationStyle = 'supportive'
  } = context;

  // Build personalized system prompt based on user data
  let systemPrompt = `You are Alex, a warm and caring friend who works as a wellness companion. You're having a natural conversation with someone who needs support.`;

  // Add user's name if available
  if (userName) {
    systemPrompt += ` You're talking with ${userName}.`;
  }

  // Add communication style preference
  const styleInstructions = {
    supportive: "Be extra warm, encouraging, and use gentle, supportive language. Focus on validation and comfort.",
    direct: "Be straightforward and practical in your responses. Give clear, actionable advice without too much emotional cushioning.",
    empathetic: "Show deep understanding and emotional connection. Reflect their feelings back and validate their emotions strongly.",
    casual: "Be relaxed and informal. Use casual language like you're talking to a close friend.",
    professional: "Maintain a caring but slightly more structured tone. Be helpful while remaining professionally supportive."
  };

  if (communicationStyle && styleInstructions[communicationStyle]) {
    systemPrompt += ` Communication style: ${styleInstructions[communicationStyle]}`;
  }

  // Add current mood context
  if (currentMood !== null) {
    const moodDescriptions = {
      1: "They're feeling very low right now - be extra gentle and supportive",
      2: "They're having a tough time - offer comfort and understanding", 
      3: "They're feeling okay but could use some support",
      4: "They're feeling pretty good - maintain their positive energy",
      5: "They're feeling great - celebrate with them and keep the positive momentum"
    };
    
    if (moodDescriptions[currentMood]) {
      systemPrompt += ` Current mood context: ${moodDescriptions[currentMood]}.`;
    }
  }

  // Add user goals if available
  if (userPreferences.goals && userPreferences.goals.length > 0) {
    systemPrompt += ` Their wellness goals include: ${userPreferences.goals.join(', ')}.`;
  }

  systemPrompt += `

Conversation style:
- Talk like a close, understanding friend - casual but caring
- Keep responses short (1-2 sentences max) and natural
- NO formatting, bullet points, or structured lists
- Remember what they've told you and reference it
- Ask follow-up questions to show you're listening
- Be empathetic but not overly formal
- Use simple, everyday language
- If they mention something serious like self-harm, gently suggest they talk to someone they trust

Remember: You're having a conversation, not giving a lecture. Be human, be present, be brief.`;

  const messages = [{ role: 'system', content: systemPrompt }];
  
  // Add conversation history if available
  if (conversationHistory && conversationHistory.length > 0) {
    messages.push(...conversationHistory);
  }
  
  // Add current message
  messages.push({ role: 'user', content: userMessage });

  return messages;
}
