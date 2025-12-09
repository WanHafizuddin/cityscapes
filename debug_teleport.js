const https = require('https');

function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
    });
}

async function debug() {
    try {
        console.log("1. Searching for London...");
        const searchData = await fetch('https://api.teleport.org/api/cities/?search=London');
        const bestMatch = searchData._embedded['city:search-results'][0];
        console.log("   Match found:", bestMatch.matching_full_name);

        const cityUrl = bestMatch._links['city:item'].href;
        console.log("2. Fetching City Details:", cityUrl);
        const cityData = await fetch(cityUrl);

        if (!cityData._links['city:urban_area']) {
            console.error("   NO URBAN AREA FOUND FOR THIS CITY!");
            return;
        }

        const urbanAreaUrl = cityData._links['city:urban_area'].href;
        console.log("3. Urban Area URL:", urbanAreaUrl);

        // Check what links are available in Urban Area
        const uaData = await fetch(urbanAreaUrl);
        console.log("   Urban Area Links:", Object.keys(uaData._links));

        if (uaData._links['ua:images']) {
            console.log("   Has 'ua:images' link:", uaData._links['ua:images'].href);
            const imagesData = await fetch(uaData._links['ua:images'].href);
            console.log("4. Images Found:", imagesData.photos.length);
            console.log("   First Image:", imagesData.photos[0].image.web);
        } else {
            console.log("   No 'ua:images' link found directly. Checking manual path...");
            // My previous assumption was valid?
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

debug();
