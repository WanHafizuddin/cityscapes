document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('cityInput');
    const searchBtn = document.getElementById('searchBtn');
    const resultSection = document.getElementById('resultSection');
    const errorMsg = document.getElementById('errorMsg');
    const cityImage = document.getElementById('cityImage');
    const cityName = document.getElementById('cityName');
    const cityDescription = document.getElementById('cityDescription');
    const cityTags = document.getElementById('cityTags');
    const imageWrapper = document.querySelector('.image-wrapper');
    const loader = document.getElementById('loader');

    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    async function handleSearch() {
        const query = cityInput.value.trim();
        if (!query) return;

        // Reset UI
        errorMsg.classList.add('hidden');
        resultSection.classList.add('hidden');
        imageWrapper.classList.add('loading');
        if (loader) loader.style.display = 'block';
        cityImage.style.display = 'none';
        cityTags.innerHTML = '';

        try {
            console.log(`Searching Wikipedia for: ${query}`);

            // Wikipedia Opensearch to get the correct title
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json&origin=*`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (!searchData[1] || searchData[1].length === 0) {
                throw new Error(`City '${query}' not found.`);
            }

            const bestTitle = searchData[1][0];
            console.log(`Best match title: ${bestTitle}`);

            // Get Page Details (Image + Extract + Coordinates if needed)
            const detailsUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(bestTitle)}&prop=pageimages|extracts|coordinates&format=json&pithumbsize=1000&exintro&explaintext&origin=*`;
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            const pages = detailsData.query.pages;
            const pageId = Object.keys(pages)[0];

            if (pageId === "-1") {
                throw new Error('Page details not found');
            }

            const page = pages[pageId];

            // Image
            let imageUrl = null;
            if (page.thumbnail) {
                imageUrl = page.thumbnail.source;
            } else {
                // Try Unsplash as fallback if Wikipedia has no image
                imageUrl = `https://source.unsplash.com/1000x800/?${encodeURIComponent(bestTitle)}`;
            }

            // Description
            let summary = page.extract;
            if (summary && summary.length > 600) {
                summary = summary.substring(0, 600) + "...";
            }

            showResult(bestTitle, imageUrl, summary);

        } catch (error) {
            console.error("Error fetching data:", error);
            showError(error.message);
        } finally {
            imageWrapper.classList.remove('loading');
            if (loader) loader.style.display = 'none';
        }
    }

    function showResult(name, imgUrl, summaryText) {
        cityName.textContent = name;

        cityImage.src = imgUrl;
        cityImage.onload = () => {
            cityImage.style.display = 'block';
        };
        cityImage.onerror = () => {
            // Second fallback if unsplash fails or whatever
            cityImage.src = 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1000&q=80';
            cityImage.style.display = 'block';
        };

        if (summaryText) {
            cityDescription.textContent = summaryText;
        } else {
            cityDescription.textContent = "Explore this beautiful city.";
        }

        // Add a "Wikipedia" tag
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerText = 'Wikipedia Source';
        cityTags.appendChild(tag);

        resultSection.classList.remove('hidden');
    }

    function showError(message) {
        errorMsg.textContent = `Error: ${message || 'City not found or no image available.'}`;
        errorMsg.classList.remove('hidden');
    }
});
