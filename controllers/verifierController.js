const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const VERIFIER_API = process.env.VERIFIER_API;

var SESSION_ID= ''; 

// Verify Verifiable Credential (VC)
const verifyCredential = async (req, res) => {
    try {
       
        const credentialType =  "UniversityDegree"; // Use issued type or fallback

        console.log("🔍 Verifying credential of type:", credentialType);

        // Make request to the verification API
        const response = await axios.post(`${VERIFIER_API}/openid4vc/verify`, {
            request_credentials: [
                {
                    format: "jwt_vc_json",
                    type: credentialType  //  Dynamically replacing OpenBadgeCredential
                }
            ]
        }, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        });

        //  Extract `presentation_definition_uri` ID from the response
        const verificationUrl = response.data;
        const stateIdMatch = verificationUrl.match(/&state=([^&]*)/);
        const stateId = stateIdMatch ? stateIdMatch[1] : "Not Found";
        SESSION_ID = stateId;

        console.log(" Extracted Presentation Definition URI ID:", stateId);

        return res.json({
            message: "Verification successful",
            verificationResult: response.data,
            stateId: stateId //  Return extracted ID
        });

    } catch (error) {
        console.error(" Error verifying credential:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to verify credential" });
    }
};


// Get Session Details using `stateId`
const getSession = async (req, res) => {
    try {
        // Call the session API
        const response = await axios.get(`${VERIFIER_API}/openid4vc/session/${SESSION_ID}`, {
            headers: {
                "Accept": "application/json"
            }
        });

        return res.json({
            message: "Session retrieved successfully",
            sessionDetails: response.data
        });

    } catch (error) {
        console.error(" Error retrieving session:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to retrieve session" });
    }
};

module.exports = { verifyCredential, getSession };