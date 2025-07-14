import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/chat(.*)',
  '/insights(.*)',
  '/exercises(.*)',
  '/games(.*)',
  '/feedback(.*)',
  '/settings(.*)',
  '/questionnaire(.*)',
  '/org(.*)',
  '/classroom-code(.*)',
  '/api/organizations(.*)',
  '/api/classrooms(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Protect these routes - require authentication
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
