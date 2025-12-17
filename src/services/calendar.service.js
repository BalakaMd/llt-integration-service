const { google } = require('googleapis');
const oauth2Client = require('../../config/oauth');
const { CalendarToken } = require('../models');

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
];

// Generate Google OAuth2 authorization URL
// User will be redirected to Google to grant calendar access
const getAuthUrl = userId => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline', // Required to get refresh_token
    scope: SCOPES,
    state: userId, // Pass userId through OAuth flow
    prompt: 'consent', // Force consent to always get refresh_token
  });
};

// Save OAuth tokens to database
// Note: refresh_token is only sent on first authorization
const saveTokens = async (userId, tokens) => {
  const data = {
    user_id: userId,
    provider: 'google',
    access_token: tokens.access_token,
    expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    scope: tokens.scope,
  };

  // Only update refresh_token if provided (Google sends it only once)
  if (tokens.refresh_token) {
    data.refresh_token = tokens.refresh_token;
  }

  await CalendarToken.upsert(data);
};

// Exchange authorization code for access and refresh tokens
const exchangeCode = async code => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

const getTokens = async userId => {
  return CalendarToken.findByPk(userId);
};

// Step 1: Get user's tokens from database
// Step 2: Set credentials in OAuth client
// Step 3: Create event object with trip details
// Step 4: Insert event to user's primary calendar
// Step 5: Return event ID and link
const createEvent = async (userId, eventData) => {
  // Get stored tokens
  const tokenData = await CalendarToken.findByPk(userId);
  if (!tokenData) {
    throw new Error('Calendar not connected');
  }

  // Set credentials (googleapis auto-refreshes expired tokens)
  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: tokenData.expires_at ? tokenData.expires_at.getTime() : null,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Build event object (all-day event format)
  const event = {
    summary: eventData.title,
    description: eventData.description || '',
    start: {
      date: eventData.startDate, // YYYY-MM-DD format
    },
    end: {
      date: eventData.endDate,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  // Insert to primary calendar
  const result = await calendar.events.insert({
    calendarId: 'primary',
    resource: event,
  });

  return {
    eventId: result.data.id,
    link: result.data.htmlLink,
  };
};

module.exports = {
  getAuthUrl,
  saveTokens,
  exchangeCode,
  getTokens,
  createEvent,
};
