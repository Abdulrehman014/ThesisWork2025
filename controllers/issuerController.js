const axios = require('axios');
const { Console } = require('console');
const fs = require('fs');
require('dotenv').config();

const ISSUER_API = process.env.ISSUER_API;

// Onboard Issuer and Generate Key & DID
const onboardIssuer = async (req, res) => {
    try {
        const response = await axios.post(`${ISSUER_API}/onboard/issuer`, {
            key: {
                backend: "jwk",
                keyType: "secp256r1"
            },
            did: {
                method: "jwk"
            }
        });

        const issuerData = {
            issuerDid: response.data.issuerDid,
            issuerKey: response.data.issuerKey
        };

        fs.writeFileSync('./data/issuerData.json', JSON.stringify(issuerData, null, 2));

        return res.json({
            message: "Issuer onboarded successfully",
            issuerDid: issuerData.issuerDid,
            
        });
        

    } catch (error) {
        console.error(" Error onboarding issuer:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to onboard issuer" });
    }
};

// Issue Verifiable Credential (VC)
const issueCredential = async (req, res) => {
    try {
        const issuerData = JSON.parse(fs.readFileSync('./data/issuerData.json', 'utf8'));

        const response = await axios.post(`${ISSUER_API}/openid4vc/jwt/issue`, {
            issuerKey: {
                type: "jwk",
                jwk: issuerData.issuerKey.jwk
            },
            issuerDid: issuerData.issuerDid,
            authenticationMethod: "PRE_AUTHORIZED",
            credentialConfigurationId: "UniversityDegree_jwt_vc_json",
            credentialData: {
                "@context": [
                    "https://www.w3.org/2018/credentials/v1",
                    "https://www.w3.org/2018/credentials/examples/v1"
                ],
                "id": "http://example.gov/credentials/3732",
                "type": ["VerifiableCredential", "HealthCard"],
                "issuer": {
                    "id": issuerData.issuerDid
                },
                "issuanceDate": new Date().toISOString(),
                "credentialSubject": {
                    "id": "did:example:ebfeb1f712ebc6f1c276e12ec21",
                    "degree": {
                        "student ID": "301752",
                        "type": "Bachelor's Degree",
                        "name": "Bachelor of Science and Arts"
                        
                    }
                }
            },
            mapping: {
                "id": "<uuid>",
                "issuer": { "id": issuerData.issuerDid },
                "credentialSubject": { "id": "did:example:ebfeb1f712ebc6f1c276e12ec21" },
                "issuanceDate": new Date().toISOString(),
                "expirationDate": "<timestamp-in:365d>"
            }
        });

        // Save the issued VC URL as plain text (without extra quotes)
        fs.writeFileSync("./data/issuedVC.json", response.data);
        console.log(" Issued VC saved to issuedVC.json:", response.data);

        return res.json({
            message: "Credential issued successfully",
            credentialOfferUrl: response.data
        });

    } catch (error) {
        console.error(" Error issuing credential:", error.response?.data || error.message);
        return res.status(500).json({ error: "Failed to issue credential" });
    }
};




module.exports = { onboardIssuer, issueCredential };
