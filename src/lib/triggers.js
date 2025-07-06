// Crisis and trigger words detection
export const crisisKeywords = [
  'suicide', 'kill myself', 'end it all', 'want to die', 'no point living',
  'hurt myself', 'self harm', 'cutting', 'overdose', 'pills',
  'jump off', 'hang myself', 'gun', 'knife'
];

export const concernKeywords = [
  'panic attack', 'can\'t breathe', 'overwhelmed', 'hopeless', 'alone',
  'scared', 'anxious', 'depressed', 'worthless', 'trapped',
  'exhausted', 'numb', 'empty', 'broken'
];

export function detectTriggers(text) {
  const lowerText = text.toLowerCase();
  
  const crisisDetected = crisisKeywords.some(keyword => 
    lowerText.includes(keyword)
  );
  
  const concernDetected = concernKeywords.some(keyword => 
    lowerText.includes(keyword)
  );

  return {
    crisis: crisisDetected,
    concern: concernDetected,
    level: crisisDetected ? 'high' : concernDetected ? 'medium' : 'low'
  };
}

export function getCrisisResponse() {
  return {
    message: "I'm really concerned about what you've shared. Your safety is important, and there are people who want to help you right now.",
    resources: [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988",
        available: "24/7"
      },
      {
        name: "Crisis Text Line",
        text: "Text HOME to 741741",
        available: "24/7"
      },
      {
        name: "Emergency Services",
        phone: "911",
        available: "24/7"
      }
    ],
    guidance: "Please consider reaching out to one of these resources. You don't have to go through this alone."
  };
}

export function getConcernResponse() {
  return {
    message: "I hear that you're going through a difficult time. It's okay to feel this way, and I'm here to support you.",
    suggestions: [
      "Try some deep breathing exercises",
      "Consider talking to a trusted friend or family member",
      "Practice grounding techniques (5-4-3-2-1 method)",
      "Consider professional counseling if these feelings persist"
    ],
    guidance: "Remember that seeking help is a sign of strength, not weakness."
  };
}
