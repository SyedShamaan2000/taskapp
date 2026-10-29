const express = require('express');
const {
  verifyEmailController,
  resendVerificationController,
} = require('./../controllers/verifyController');
const validate = require('../middleware/validate');
const { resendVerificationSchema, verifySchema } = require('../utils/validators');

const router = express.Router();

router.post('/verify', validate(verifySchema, 'body'), verifyEmailController);
router.post('/resend', validate(resendVerificationSchema, 'body'), resendVerificationController);

module.exports = router;
