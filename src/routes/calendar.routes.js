const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');
const validate = require('../middlewares/validate');
const {
  userIdQuerySchema,
  callbackSchema,
  createEventSchema,
} = require('../validators/calendarValidators');

router.get(
  '/google/connect',
  validate(userIdQuerySchema),
  calendarController.connect,
);
router.get(
  '/google/callback',
  validate(callbackSchema),
  calendarController.callback,
);
router.get(
  '/status',
  validate(userIdQuerySchema),
  calendarController.getStatus,
);
router.post(
  '/events',
  validate(createEventSchema, 'body'),
  calendarController.createEvent,
);

module.exports = router;
