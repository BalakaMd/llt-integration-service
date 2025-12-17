const calendarService = require('../services/calendar.service');

const connect = (req, res) => {
  const { userId } = req.query;
  const authUrl = calendarService.getAuthUrl(userId);
  res.redirect(authUrl);
};

const callback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;
    const tokens = await calendarService.exchangeCode(code);
    await calendarService.saveTokens(userId, tokens);
    res.send('Calendar connected successfully. You can close this window.');
  } catch (error) {
    console.error('OAuth callback error:', error.message);
    res.status(500).json({ error: 'Failed to connect calendar' });
  }
};

const getStatus = async (req, res) => {
  try {
    const { userId } = req.query;
    const tokens = await calendarService.getTokens(userId);
    res.json({ connected: !!tokens });
  } catch (error) {
    console.error('Calendar status error:', error.message);
    res.status(500).json({ error: 'Failed to get calendar status' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { userId, title, startDate, endDate, description } = req.body;
    const result = await calendarService.createEvent(userId, {
      title,
      startDate,
      endDate,
      description,
    });
    res.json({ data: result });
  } catch (error) {
    console.error('Create event error:', error.message);
    if (error.message === 'Calendar not connected') {
      return res.status(401).json({ error: 'Calendar not connected' });
    }
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
};

module.exports = {
  connect,
  callback,
  getStatus,
  createEvent,
};
