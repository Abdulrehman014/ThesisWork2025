require('dotenv').config();
const express = require('express');
const issuerRoutes = require('./routes/issuer');
const verifierRoutes = require('./routes/verifier'); 
const walletRoutes = require('./routes/wallet');

const app = express();
app.use(express.json());

// Routes
app.use('/api/issuer', issuerRoutes);
app.use('/api/verifier', verifierRoutes); 
app.use('/api/wallet', walletRoutes);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
