const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Enable CORS for frontend
app.use(cors());

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Proxy Endpoint
app.get('/api/city/:cityName', async (req, res) => {
    const { cityName } = req.params;
    console.log(`Received request for city: ${cityName}`);

    try {
        // User provided API URL
        const apiUrl = `https://www.roadgoat.com/business/cities-api/${cityName}`;

        // Add User-Agent to mimic a browser, which might be required by RoadGoat
        const response = await axios.get(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json'
            },
            timeout: 10000 // 10 second timeout
        });

        console.log(`Successfully fetched data for ${cityName}`);
        res.json(response.data);

    } catch (error) {
        console.error(`Error fetching data for ${cityName}:`, error.message);

        if (error.response) {
            // API responded with an error code
            res.status(error.response.status).json({
                error: "API_ERROR",
                message: error.message,
                details: error.response.data
            });
        } else if (error.request) {
            // No response received (Timeout / Network issue)
            res.status(503).json({
                error: "NETWORK_ERROR",
                message: "Failed to connect to RoadGoat API. The service might be down or unreachable."
            });
        } else {
            res.status(500).json({
                error: "INTERNAL_ERROR",
                message: error.message
            });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser to use the app.`);
});
