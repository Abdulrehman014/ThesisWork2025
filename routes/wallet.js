const express = require('express');
const {
    registerUser,
    loginUser,
    getWallets,
    createDidForWallet, 
    acceptCredentialOffer,
    getWalletCredentials
} = require('../controllers/walletController');

const router = express.Router();

router.post('/register', registerUser);  //  Register User
router.post('/login', loginUser);        //  Login User
router.get('/wallets', getWallets);      //  Get Wallets
router.post('/did', createDidForWallet); //  Create DID for Wallet
router.post('/offer', acceptCredentialOffer); 
router.get("/credentials", getWalletCredentials);

module.exports = router;
