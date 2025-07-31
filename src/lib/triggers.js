// Multi-language crisis and trigger words detection
export const crisisKeywords = {
  english: [
    'suicide', 'kill myself', 'end it all', 'want to die', 'no point living',
    'hurt myself', 'self harm', 'cutting', 'overdose', 'pills',
    'jump off', 'hang myself', 'gun', 'knife'
  ],
  hinglish: [
    'suicide', 'kill myself', 'mar jaana', 'marna chahta', 'zinda nahi rehna',
    'khud ko hurt', 'self harm', 'cutting', 'overdose', 'pills',
    'jump kar', 'hang kar', 'gun', 'knife', 'khatam kar', 'end kar',
    'mar jaun', 'jaan de dun', 'zindagi se pareshan', 'jeena nahi chahta'
  ],
  spanish: [
    'suicidio', 'matarme', 'terminar todo', 'quiero morir', 'no vale la pena vivir',
    'hacerme daño', 'autolesión', 'cortarme', 'sobredosis', 'pastillas',
    'saltar', 'ahorcarme', 'pistola', 'cuchillo'
  ],
  french: [
    'suicide', 'me tuer', 'en finir', 'veux mourir', 'pas la peine de vivre',
    'me faire mal', 'automutilation', 'me couper', 'overdose', 'pilules',
    'sauter', 'me pendre', 'pistolet', 'couteau'
  ],
  german: [
    'selbstmord', 'mich töten', 'alles beenden', 'sterben wollen', 'kein sinn zu leben',
    'mich verletzen', 'selbstverletzung', 'schneiden', 'überdosis', 'pillen',
    'springen', 'erhängen', 'pistole', 'messer'
  ]
};

export const concernKeywords = {
  english: [
    'panic attack', 'can\'t breathe', 'overwhelmed', 'hopeless', 'alone',
    'scared', 'anxious', 'depressed', 'worthless', 'trapped',
    'exhausted', 'numb', 'empty', 'broken'
  ],
  hinglish: [
    'panic attack', 'saans nahi aa rahi', 'overwhelmed', 'hopeless', 'akela',
    'scared', 'anxious', 'depressed', 'worthless', 'trapped', 'pareshan',
    'exhausted', 'numb', 'empty', 'broken', 'udaas', 'tension', 'stress',
    'ghabra gaya', 'dar lag raha', 'kuch samajh nahi aa raha', 'thak gaya'
  ],
  spanish: [
    'ataque de pánico', 'no puedo respirar', 'abrumado', 'sin esperanza', 'solo',
    'asustado', 'ansioso', 'deprimido', 'sin valor', 'atrapado',
    'agotado', 'entumecido', 'vacío', 'roto'
  ],
  french: [
    'crise de panique', 'ne peux pas respirer', 'débordé', 'sans espoir', 'seul',
    'effrayé', 'anxieux', 'déprimé', 'sans valeur', 'piégé',
    'épuisé', 'engourdi', 'vide', 'brisé'
  ],
  german: [
    'panikattacke', 'kann nicht atmen', 'überwältigt', 'hoffnungslos', 'allein',
    'verängstigt', 'ängstlich', 'deprimiert', 'wertlos', 'gefangen',
    'erschöpft', 'taub', 'leer', 'gebrochen'
  ]
};

// Simple language detection for trigger detection
function detectLanguageForTriggers(text) {
  const lowerText = text.toLowerCase();
  
  // Hindi/Hinglish patterns - expanded to catch more cases
  if (/\b(hai|hain|kya|kaise|main|mein|yaar|bhai|pareshan|tension|udaas|mujhe|nahi|nhi|acha|achha|lag|raha|rah|theek|haan)\b/.test(lowerText)) {
    return 'hinglish';
  }
  // Spanish patterns
  if (/\b(soy|estoy|tengo|como|que|si|no|muy|pero|todo)\b/.test(lowerText)) {
    return 'spanish';
  }
  // French patterns
  if (/\b(je|suis|ai|comment|que|oui|non|très|mais|tout)\b/.test(lowerText)) {
    return 'french';
  }
  // German patterns
  if (/\b(ich|bin|habe|wie|was|ja|nein|sehr|aber|alles)\b/.test(lowerText)) {
    return 'german';
  }
  
  return 'english';
}

export function detectTriggers(text) {
  const lowerText = text.toLowerCase();
  const detectedLang = detectLanguageForTriggers(text);
  
  // Get keywords for detected language, fallback to English
  const crisisWords = crisisKeywords[detectedLang] || crisisKeywords.english;
  const concernWords = concernKeywords[detectedLang] || concernKeywords.english;
  
  const crisisDetected = crisisWords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );
  
  const concernDetected = concernWords.some(keyword => 
    lowerText.includes(keyword.toLowerCase())
  );

  return {
    crisis: crisisDetected,
    concern: concernDetected,
    level: crisisDetected ? 'high' : concernDetected ? 'medium' : 'low',
    detectedLanguage: detectedLang
  };
}

export function getCrisisResponse(language = 'english') {
  const responses = {
    english: {
      message: "I'm really concerned about what you've shared. Your safety is important, and there are people who want to help you right now.",
      guidance: "Please consider reaching out to one of these resources. You don't have to go through this alone."
    },
    hinglish: {
      message: "Main bahut concerned hun jo aapne share kiya hai. Aapki safety important hai, aur log hain jo abhi aapki help karna chahte hain.",
      guidance: "Please consider karo in resources se contact karna. Aap akele nahi ho is mein."
    },
    spanish: {
      message: "Estoy muy preocupado por lo que has compartido. Tu seguridad es importante, y hay personas que quieren ayudarte ahora mismo.",
      guidance: "Por favor considera contactar a uno de estos recursos. No tienes que pasar por esto solo."
    },
    french: {
      message: "Je suis très inquiet de ce que tu as partagé. Ta sécurité est importante, et il y a des gens qui veulent t'aider maintenant.",
      guidance: "S'il te plaît, considère contacter l'une de ces ressources. Tu n'as pas à traverser ça seul."
    },
    german: {
      message: "Ich bin sehr besorgt über das, was du geteilt hast. Deine Sicherheit ist wichtig, und es gibt Menschen, die dir jetzt helfen wollen.",
      guidance: "Bitte erwäge, eine dieser Ressourcen zu kontaktieren. Du musst das nicht alleine durchstehen."
    }
  };

  return {
    message: responses[language]?.message || responses.english.message,
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
    guidance: responses[language]?.guidance || responses.english.guidance
  };
}

export function getConcernResponse(language = 'english') {
  const responses = {
    english: {
      message: "I hear that you're going through a difficult time. It's okay to feel this way, and I'm here to support you.",
      suggestions: [
        "Try some deep breathing exercises",
        "Consider talking to a trusted friend or family member", 
        "Practice grounding techniques (5-4-3-2-1 method)",
        "Consider professional counseling if these feelings persist"
      ]
    },
    hinglish: {
      message: "Main samajh raha hun ki aap difficult time se guzar rahe ho. Aise feel karna okay hai, aur main yahan hun aapko support karne ke liye.",
      suggestions: [
        "Deep breathing exercises try karo",
        "Kisi trusted friend ya family member se baat karo",
        "Grounding techniques practice karo (5-4-3-2-1 method)",
        "Agar ye feelings persist kare to professional counseling consider karo"
      ]
    },
    spanish: {
      message: "Entiendo que estás pasando por un momento difícil. Está bien sentirse así, y estoy aquí para apoyarte.",
      suggestions: [
        "Prueba algunos ejercicios de respiración profunda",
        "Considera hablar con un amigo o familiar de confianza",
        "Practica técnicas de conexión a tierra (método 5-4-3-2-1)",
        "Considera consejería profesional si estos sentimientos persisten"
      ]
    },
    french: {
      message: "Je comprends que tu traverses une période difficile. C'est normal de se sentir ainsi, et je suis là pour te soutenir.",
      suggestions: [
        "Essaie quelques exercices de respiration profonde",
        "Considère parler à un ami ou membre de famille de confiance",
        "Pratique des techniques d'ancrage (méthode 5-4-3-2-1)",
        "Considère un conseil professionnel si ces sentiments persistent"
      ]
    },
    german: {
      message: "Ich verstehe, dass du eine schwierige Zeit durchmachst. Es ist okay, sich so zu fühlen, und ich bin hier, um dich zu unterstützen.",
      suggestions: [
        "Versuche einige tiefe Atemübungen",
        "Erwäge, mit einem vertrauenswürdigen Freund oder Familienmitglied zu sprechen",
        "Übe Erdungstechniken (5-4-3-2-1 Methode)",
        "Erwäge professionelle Beratung, wenn diese Gefühle anhalten"
      ]
    }
  };

  return {
    message: responses[language]?.message || responses.english.message,
    suggestions: responses[language]?.suggestions || responses.english.suggestions,
    guidance: "Remember that seeking help is a sign of strength, not weakness."
  };
}
