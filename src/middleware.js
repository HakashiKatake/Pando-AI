import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/chat(.*)',
  '/insights(.*)',
  '/exercises(.*)',
  '/games(.*)',
  '/feedback(.*)',
  '/settings(.*)',
  '/questionnaire(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // Allow guest access to protected routes or redirect to sign-in
  if (isProtectedRoute(req)) {
    // For protected routes, allow guest access by not calling auth().protect()
    // This allows both authenticated users and guests to access these routes
    // The application logic will handle guest vs authenticated user experience
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
