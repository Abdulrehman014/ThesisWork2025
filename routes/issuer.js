const express = require('express');
const { onboardIssuer, issueCredential } = require('../controllers/issuerController');

const router = express.Router();

router.post('/onboard', onboardIssuer);  // Onboard Issuer
router.post('/issue', issueCredential);  // Issue Credential

module.exports = router;
