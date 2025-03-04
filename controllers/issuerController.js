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
            credentialData:{
                "@context": [
                  "https://www.w3.org/2018/credentials/v1",
                  "https://europa.eu/schemas/v-id/2020/v1",
                  "https://europa.eu/schemas/eidas/2020/v1"
                ],
                "id": "urn:uuid:3252d03c-c168-45fd-bf0a-b0b838a65e2c",
                "type": [
                  "VerifiableCredential",
                  "EducationalID"
                ],
                "issuer": "did:jwk:eyJrdHkiOiJPS1AiLCJkIjoiSElOOVdjVkNxaEd2d1o4STQ3V2VNdHhHY2VTS3B2YUVudTVlWEFvV3lEbyIsImNydiI6IkVkMjU1MTkiLCJraWQiOiJDRlEtTnJhNXlueUJzZnh3eTdhTmY4ZHVBRVVDTWxNSXJSSXJEZzZESXk0IiwieCI6Img1bmJ3Nlg5Sm1JMEJ2dVE1TTBKWGZ6TzhzMmVFYlBkVjI5d3NIVEw5cGsifQ==",
                "issuanceDate": "2023-12-13T11:56:31.382517677Z",
                "issued": "2023-12-13T11:56:19Z",
                "validFrom": "2023-12-13T11:56:19Z",
                "credentialSubject": {
                  "id": "did:key:z6MksJPJvvPhV16vRPNkoDyGfp82bacJWor1fTPW62ZXL4Pw#z6MksJPJvvPhV16vRPNkoDyGfp82bacJWor1fTPW62ZXL4Pw",
                  "identifier": [
                    {
                      "schemeID": "European Student Identifier",
                      "value": "urn:schac:personalUniqueCode:int:esi:math.example.edu:xxxxxxxxxx",
                      "id": "urn:schac:personalUniqueCode:int:esi:university.eu:firstlast@email.eu"
                    }
                  ],
                  "schacPersonalUniqueID": "urn:schac:personalUniqueID:int:passport:{COUNTRY_CODE}:{PASSPORT_CODE}",
                  "commonName": "Bidhisha",
                  "displayName": "BHINDI",
                  "firstName": "Frist",
                  "familyName": "Ferreira",
                  "dateOfBirth": "01011990",
                  "schacHomeOrganization": " ",
                  "mail": "first.last@university.eu",
                  "eduPersonPrincipalName": "first.last@university.eu",
                  "eduPersonPrimaryAffiliation": "student",
                  "schacPersonalUniqueCode": "urn:schac:personalUniqueCode:int:esi:university.eu:firstlast@email.eu",
                  "eduPersonAffiliation": [
                    {
                      "value": "student, staff"
                    }
                  ],
                  "eduPersonScopedAffiliation": [
                    {
                      "value": "student@university.eu, staff@university.eu"
                    }
                  ],
                  "eduPersonAssurance": [
                    {
                      "value": "student, staff"
                    }
                  ]
                }
              },
              
              
              
              
            
            mapping: {
                "id": "<uuid>",
                "issuer": "<issuerDid>",
                "credentialSubject": {
                  "id": "<subjectDid>"
                },
                "issuanceDate": "<timestamp>"
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
