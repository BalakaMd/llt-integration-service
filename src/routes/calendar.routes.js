const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const validate = require('../middlewares/validate');
const {
  userIdQuerySchema,
  callbackSchema,
  createEventSchema,
} = require('../validators/calendarValidators');

/**
 * @swagger
 * /calendar/google/connect:
 *   get:
 *     tags: [Calendar]
 *     summary: Start Google OAuth2 flow
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         description: User ID
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  '/google/connect',
  validate(userIdQuerySchema),
  calendarController.connect,
);

/**
 * @swagger
 * /calendar/google/callback:
 *   get:
 *     tags: [Calendar]
 *     summary: Google OAuth2 callback
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Calendar connected
 */
router.get(
  '/google/callback',
  validate(callbackSchema),
  calendarController.callback,
);

/**
 * @swagger
 * /calendar/status:
 *   get:
 *     tags: [Calendar]
 *     summary: Check calendar connection status
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Connection status
 *         content:
 *           application/json:
 *             example:
 *               connected: true
 */
router.get(
  '/status',
  validate(userIdQuerySchema),
  calendarController.getStatus,
);

/**
 * @swagger
 * /calendar/events:
 *   post:
 *     tags: [Calendar]
 *     summary: Create calendar event
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - title
 *               - startDate
 *               - endDate
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *               endDate:
 *                 type: string
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *               description:
 *                 type: string
 *           example:
 *             userId: 550e8400-e29b-41d4-a716-446655440000
 *             title: Trip to Paris
 *             startDate: '2024-01-15'
 *             endDate: '2024-01-20'
 *             description: Vacation in France
 *     responses:
 *       200:
 *         description: Event created
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 eventId: abc123xyz
 *                 link: https://calendar.google.com/event?eid=abc123xyz
 *       401:
 *         description: Calendar not connected
 */
router.post(
  '/events',
  validate(createEventSchema, 'body'),
  calendarController.createEvent,
);

module.exports = router;
