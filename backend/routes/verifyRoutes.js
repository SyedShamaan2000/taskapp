const express = require('express');
const { verifyEmailController, resendVerificationController } = require('./../controllers/verifyController');

const router = express.Router();

router.route('/verify').post(verifyEmailController);
router.route('/resend').post(resendVerificationController);

module.exports = router;