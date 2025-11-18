// src/app/utils/googleCalendar.ts

export function getGoogleCalendarAuthUrl(): string {
  // Use same redirect URI as Cognito and backend
  const redirectUri = `http://localhost:3000/projects`;

  // Generate a random state for security
  const state = 'google_calendar_' + Math.random().toString(36).substring(7);
  sessionStorage.setItem('google_oauth_state', state);

  // Get Google client ID from env
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
  if (!clientId) {
    console.error('❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing in .env');
  }

  // Build OAuth parameters
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent select_account',
    state
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  console.log('📅 Google OAuth URL built:', url);
  return url;
}
