// Handle file upload and tweets rendering
document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('dataFile');
    const file = fileInput.files[0];

    if (!file || file.size > 20 * 1024 * 1024 || file.type !== "text/plain") {
        alert("Please upload a valid .txt file under 20MB.");
        return;
    }

    // const formData = new FormData();
    // formData.append('file', file);
    const reader = new FileReader();

    const jsonData = {};
    reader.onload = function (event) {
        const fileContent = event.target.result;
        jsonData = {
            txt_file: fileContent
        };
    }

    const response = await fetch('https://www.northbeach.fi/information_warfare/api/postdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonData
    });

    const data = await response.json();
    updateTweetDisplay(data);
});

// Function to update tweet display with responsiveness
function updateTweetDisplay(data) {
    const tweetsContainer = document.getElementById('tweets');
    const showTweetsButton = document.getElementById('showTweetsButton');

    // Clear the tweets container
    tweetsContainer.innerHTML = '';

    if (data.tweets.length > 0) {
        // Add tweets to the container
        data.tweets.forEach((tweet, index) => {
            const li = document.createElement('li');
            li.textContent = tweet;
            li.classList.add('list-group-item');
            li.addEventListener('click', () => fetchGuide(index));
            tweetsContainer.appendChild(li);
        });

        // Add responsive logic
        const handleResize = () => {
            if (window.innerWidth < 768) {
                showTweetsButton.classList.remove('d-none');
                tweetsContainer.classList.add('d-none'); // Initially hide tweets
                showTweetsButton.onclick = () => {
                    tweetsContainer.classList.toggle('d-none');
                };
            } else {
                showTweetsButton.classList.add('d-none');
                tweetsContainer.classList.remove('d-none'); // Always show tweets
            }
        };

        // Attach resize event listener and execute it once
        window.addEventListener('resize', handleResize);
        handleResize();
    } else {
        showTweetsButton.classList.add('d-none');
    }
}

async function fetchGuide(index) {
    const response = await fetch(`https://www.northbeach.fi/information_warfare/api/guide?tweet=${index}`);
    const data = await response.json();

    // Update Main Content
    const mainBanner = document.getElementById('mainBanner');
    mainBanner.textContent = data.tweet;

    const tweetDetails = document.getElementById('tweetDetails');
    tweetDetails.textContent = data.information_quality;

    // Update Guide Section
    const keywordList = document.getElementById('keywordList');
    keywordList.innerHTML = data.keywords.map(keyword => `<li>${keyword}</li>`).join('');

    const counterTweetList = document.getElementById('counterTweetList');
    counterTweetList.innerHTML = data['counter-tweet'];

    const guideline = document.getElementById('nextGuide');
    guideline.innerHTML = data['guideline'];

    const newKeywordList = document.getElementById('newKeywordList');
    newKeywordList.innerHTML = data['new-keyword'].map(keyword => `<li>${keyword}</li>`).join('');
}
