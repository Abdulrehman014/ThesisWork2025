const express = require('express');
const { verifyCredential, getSession } = require('../controllers/verifierController');

const router = express.Router();

router.post('/verify', verifyCredential);  //  Verify Credential
router.get('/session/:id', getSession);    //  Get Session Details

module.exports = router;
