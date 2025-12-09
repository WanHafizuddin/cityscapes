const axios = require('axios');

let cityName = "London";

console.log("Testing RoadGoat API for city:", cityName);

axios.get(`https://www.roadgoat.com/business/cities-api/${cityName}`, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
})
  .then(response => {
    console.log("Success! Data received.");
    console.log(JSON.stringify(response.data, null, 2).substring(0, 500) + "...");
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    }
  });
