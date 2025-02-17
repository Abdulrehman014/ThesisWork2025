const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const WALLET_API = process.env.WALLET_API;

//  Register a User
const registerUser = async (req, res) => {
    try {
        const response = await axios.post(`${WALLET_API}/wallet-api/auth/register`, {
            type: "email",
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        return res.json({
            message: "User registered successfully",
            userInfo: response.data
        });

    } catch (error) {
        console.error(" Error registering user:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to register user" });
    }
};

//  Login a User
const loginUser = async (req, res) => {
    try {
        const response = await axios.post(`${WALLET_API}/wallet-api/auth/login`, {
            type: "email",
            email: req.body.email,
            password: req.body.password
        });

        //  Save the session token for later use
        fs.writeFileSync('./data/walletData.json', JSON.stringify(response.data, null, 2));

        return res.json({
            message: "User logged in successfully",
            sessionData: response.data
        });

    } catch (error) {
        console.error(" Error logging in user:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to login user" });
    }
};

//  Get Wallets

const getWallets = async (req, res) => {
    try {
        //  Load saved token from walletData.json
        const walletData = JSON.parse(fs.readFileSync('./data/walletData.json', 'utf8'));
        const token = walletData.token;

        if (!token) {
            return res.status(401).json({ error: "No authentication token found. Please login first." });
        }

        console.log("🔍 Fetching wallets with token:", token);

        //  Send request with Authorization Header
        const response = await axios.get(`${WALLET_API}/wallet-api/wallet/accounts/wallets`, {
            headers: { "Authorization": `Bearer ${token}` }  //  Pass token
        });

        //  Extract the first wallet ID
        const walletId = response.data.wallets.length > 0 ? response.data.wallets[0].id : null;

        if (!walletId) {
            return res.status(404).json({ error: "No wallets found" });
        }

        //  Save wallet ID to walletData.json
        walletData.walletId = walletId;
        fs.writeFileSync("./data/walletData.json", JSON.stringify(walletData, null, 2));

        console.log(" Saved Wallet ID:", walletId);

        return res.json({
            message: "Wallets retrieved successfully",
            walletId: walletId,
            wallets: response.data.wallets
        });

    } catch (error) {
        console.error(" Error getting wallets:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to get wallets" });
    }
};



//  Create DID for a Wallet
const createDidForWallet = async (req, res) => {
    try {
        //  Load saved wallet data (walletId + token)
        const walletData = JSON.parse(fs.readFileSync('./data/walletData.json', 'utf8'));
        const walletId = walletData.walletId;
        const token = walletData.token;

        if (!walletId) {
            return res.status(400).json({ error: "No wallet ID found. Please fetch wallets first." });
        }
        if (!token) {
            return res.status(401).json({ error: "No authentication token found. Please login first." });
        }

        console.log(" Creating DID for Wallet ID:", walletId);

        //  Make request to create DID with Authorization Header
        const response = await axios.post(
            `${WALLET_API}/wallet-api/wallet/${walletId}/dids/create/key`, 
            {},  // Empty body
            { headers: { "Authorization": `Bearer ${token}` } } //  Pass token
        );

        return res.json({
            message: "DID created successfully",
            walletId: walletId,
            did: response.data
        });

    } catch (error) {
        console.error(" Error creating DID:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to create DID" });
    }
};



//  Accept Credential Offer & Store in Wallet
const acceptCredentialOffer = async (req, res) => {
    try {
        //  Load `walletId` and `token` from walletData.json
        const walletData = JSON.parse(fs.readFileSync('./data/walletData.json', 'utf8'));
        const walletId = walletData.walletId;
        const token = walletData.token;

        if (!walletId || !token) {
            return res.status(400).json({ error: "Wallet ID or Token not found. Please login & get wallets first." });
        }

        //  Load `credentialOfferUrl` as a raw string from issuedVC.json
        const credentialOfferUrl = fs.readFileSync('./data/issuedVC.json', 'utf8').trim();

        //  Ensure the offer starts correctly
        if (!credentialOfferUrl.startsWith("openid-credential-offer://")) {
            return res.status(400).json({ error: "Invalid credential offer URL format in issuedVC.json" });
        }
        console.log(" Accepting Credential Offer for Wallet:", walletId);
        console.log(" Offer URL:", credentialOfferUrl);

        //  Send the request to Wallet API
        const response = await axios.post(
            `${WALLET_API}/wallet-api/wallet/${walletId}/exchange/useOfferRequest`,
            credentialOfferUrl,  //  Sends raw string
            {
                
                headers: 
                { "Content-Type": "text/plain" ,
                    "Authorization": `Bearer ${token}`,
                }
         } 
            
        );

        console.log(" Credential Accepted & Stored in Wallet:", response.data);

        return res.json({
            message: "Credential successfully accepted & stored in wallet",
            credential: response.data
        });

    } catch (error) {
        console.error(" Error accepting credential:", error.response?.data || error.message);
        return res.status(500).json({
            error: "Failed to accept credential offer",
            details: error.response?.data || error.message
        });
    }
};



//  Get Credentials LIST for a Wallet
const getWalletCredentials = async (req, res) => {
    try {
       
        //  Load saved wallet data (walletId)
        const walletData = JSON.parse(fs.readFileSync("./data/walletData.json", "utf8"));
        const walletId = walletData.walletId;
        const token = walletData.token;

        if (!walletId) {
            return res.status(400).json({ error: "No wallet ID found. Please fetch wallets first." });
        }

        if (!token) {
            return res.status(401).json({ error: "No authentication token found. Please login first." });
        }

        console.log(" Fetching wallets with token:", token)

        console.log(" Fetching credentials for Wallet ID:", walletId);

        //  Make request to fetch wallet credentials
        const response = await axios.get(`${WALLET_API}/wallet-api/wallet/${walletId}/credentials`, {
            headers: { "Accept": "application/json",
                "Authorization": `Bearer ${token}`
             }
         
        });

        return res.json({
            message: "Credentials retrieved successfully",
            credentials: response.data
        });

    } catch (error) {
        console.error(" Error fetching credentials:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to fetch credentials" });
    }
};








module.exports = { registerUser, loginUser, getWallets, createDidForWallet, acceptCredentialOffer, getWalletCredentials };
