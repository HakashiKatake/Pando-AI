import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI);
const clientPromise = client.connect();

// For development - log emails to console instead of sending them
const sendVerificationRequest = async ({ identifier, url, provider }) => {
  console.log('\n🔗 EMAIL VERIFICATION LINK 🔗');
  console.log('To:', identifier);
  console.log('Sign-in URL:', url);
  console.log('Copy this URL and paste it in your browser to sign in');
  console.log('─'.repeat(80));
};

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      // Use console logging for development
      sendVerificationRequest,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
