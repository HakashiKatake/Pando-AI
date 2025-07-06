# CalmConnect - AI-Powered Mental Wellness Platform

A comprehensive mental wellness web application built with Next.js 14, featuring AI-powered conversations, mood tracking, mindfulness exercises, and personalized insights.

## 🌟 Features

### Core Functionality
- **AI Chat Companion**: Intelligent conversations with crisis detection and supportive responses
- **Mood Tracking**: Daily mood check-ins with trend analysis and insights
- **Mindfulness Exercises**: Guided breathing exercises, meditation, and relaxation techniques
- **Wellness Games**: Interactive games designed to improve focus and reduce anxiety
- **Journal & Reflection**: Digital journaling with mood correlation and tag organization
- **Personal Insights**: Analytics and progress tracking with personalized recommendations

### User Experience
- **Guest Mode**: Full functionality without account creation (local storage)
- **Authenticated Mode**: User accounts with data persistence across devices
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark/Light Theme**: System-aware theme with manual override
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### Technical Features
- **Real-time Chat**: WebSocket-like experience with streaming responses
- **Offline Support**: Local storage fallback for guest users
- **Crisis Detection**: AI-powered detection of mental health crises with immediate resources
- **Privacy First**: Optional private mode for sensitive conversations
- **Data Export**: Download personal data in JSON format

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** (App Router)
- **React 19** with Hooks
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend
- **Next.js API Routes**
- **MongoDB** with Mongoose ODM
- **Clerk** for authentication
- **OpenRouter API** for AI conversations

### State Management
- **Zustand** with localStorage persistence
- **React Query** for server state
- **Next-themes** for theme management

### Development
- **TypeScript** (via JSDoc)
- **ESLint** for code quality
- **Turbopack** for fast development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- OpenRouter API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cc-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/calmconnect
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/calmconnect

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/questionnaire

# AI Provider
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=anthropic/claude-3-sonnet

# Crisis Detection
CRISIS_WEBHOOK_URL=https://your-crisis-response-webhook.com

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔒 Privacy & Security

- **Privacy First**: Guest mode requires no personal information
- **Data Minimization**: Only collect necessary data
- **Encryption**: All sensitive data encrypted in transit and at rest
- **Crisis Protocol**: Automatic detection with immediate resource provision
- **User Control**: Full control over data storage and sharing

## 🆘 Support

If you need immediate mental health support:
- **Crisis Text Line**: Text HOME to 741741
- **National Suicide Prevention Lifeline**: 988
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

---

**Note**: This application is designed to supplement, not replace, professional mental health care. Always consult with qualified healthcare providers for serious mental health concerns.
