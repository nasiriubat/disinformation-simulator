


// Handle file upload and tweets rendering
document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('dataFile');
    const file = fileInput.files[0];

    if (!file || file.size > 20 * 1024 * 1024 || file.type !== "text/plain") {
        toastr.error("Please upload a valid .txt file under 20MB.", "Invalid File");
        return;
    }

    const formData = new FormData();
    formData.append('file', file); // Append the file to the form data

    try {
        const response = await fetch('https://disinformation-simulator.onrender.com/api/postdata', {
            method: 'POST',
            body: formData, // Send the form data
        });

        if (response.ok) {
            const data = await response.json();
            toastr.success("File uploaded and processed successfully!", "Success");
            updateTweetDisplay(data); // Call the function to update the tweets on the UI
        } else {
            const errorData = await response.json();
            toastr.error(errorData.error || "An error occurred while processing the file.", "Error");
        }
    } catch (error) {
        toastr.error("Could not connect to the server. Please try again later.", "Network Error");
    }
});

document.getElementById('loadSampleData').addEventListener('click', async function () {
    try {
        const response = await fetch('https://disinformation-simulator.onrender.com/api/sampledata', {
            method: 'GET',
        });

        if (response.ok) {
            const data = await response.json();
            toastr.success("Sample data loaded successfully!", "Success");
            updateTweetDisplay(data); // Call the function to update the tweets on the UI
            const tweetsContainer = document.getElementById('tweets');
            const showTweetsButton = document.getElementById('showTweetsButton');
            if (window.innerWidth < 768) {
                
                // showTweetsButton.classList.add('d-none');
                tweetsContainer.classList.remove('d-none');
                showTweetsButton.onclick = () => {
                    tweetsContainer.classList.toggle('d-none');
                };
            }
        } else {
            const errorData = await response.json();
            toastr.error(errorData.error || "Failed to load sample data.", "Error");
        }
    } catch (error) {
        toastr.error("Could not connect to the server. Please try again later.", "Network Error");
    }
});



// Function to update tweet display with responsiveness
function updateTweetDisplay(data) {
    const tweetsContainer = document.getElementById('tweets');
    const showTweetsButton = document.getElementById('showTweetsButton');
    const tweetListElement = document.querySelector('#tweetList');
    tweetListElement.style.display = 'block';

    // Clear the tweets container
    tweetsContainer.innerHTML = '';

    if (data.tweets && data.tweets.length > 0) {
        // Add tweets to the container
        data.tweets.forEach((tweetObj, index) => {
            // Create list item
            const li = document.createElement('li');
            li.classList.add('list-group-item', `list-${index}`, 'd-flex', 'justify-content-between', 'align-items-center');
            li.textContent = tweetObj.tweet; // Set tweet text



            // Add click event for fetching guide
            li.addEventListener('click', () => {
                fetchGuide(tweetObj.tweet);
            });

            // Append list item to the container
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

async function fetchGuide(tweetContent) {
    const guideDataElement = document.querySelector('.guide-data');
    const loadingScreen = document.getElementById('loadingScreen');


    try {
        // Show loading animation
        loadingScreen.classList.add('active');
        const startTime = Date.now(); // Track start time

        const response = await fetch(`https://disinformation-simulator.onrender.com/api/guide`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tweet: tweetContent }), // Send tweet content to backend
        });

        const data = await response.json();
        guideDataElement.style.display = 'block';

        // Ensure the loading animation stays for at least 1 second
        // const elapsedTime = Date.now() - startTime;
        // const delay = Math.max(0, 1000 - elapsedTime); // Wait at least 1 second
        // await new Promise(resolve => setTimeout(resolve, delay));

        // Hide loading animation
        loadingScreen.classList.remove('active');

        // Update Main Content
        const mainBanner = document.getElementById('mainBanner');
        mainBanner.textContent = data.old_tweet;

        const tweetDetails = document.getElementById('tweetDetails');
        const authenticityCard = document.getElementById('authenticity');

        // Update the content
        // tweetDetails.textContent = `${data.authentic}`;

        // Apply styles based on the authenticity
        if (data.authentic === 'True') {
            mainBanner.classList.remove('bg-warning', 'bg-danger', 'text-danger', 'text-warning');
            mainBanner.classList.add('bg-success', 'text-white'); // Bootstrap success theme

            authenticityCard.style.backgroundColor = '#e6ffe6'; // Light green background
            authenticityCard.style.borderColor = '#99ff99';    // Dark green border
            authenticityCard.querySelector('h6').style.color = '#28a745'; // Dark green title

            tweetDetails.textContent = `This information is authentic.`;
        } else if (data.authentic === 'Misinformation') {
            mainBanner.classList.remove('bg-success', 'bg-danger', 'text-success', 'text-danger');
            mainBanner.classList.add('bg-warning', 'text-dark'); // Bootstrap warning theme

            authenticityCard.style.backgroundColor = '#fffbe6'; // Light green background
            authenticityCard.style.borderColor = '#ffeb99';    // Dark green border
            authenticityCard.querySelector('h6').style.color = '#ffbf00'; // Dark green title

            tweetDetails.textContent = `This is misinformation.`;
        } else if (data.authentic === 'Disinformation') {
            mainBanner.classList.remove('bg-success', 'bg-warning', 'text-success', 'text-warning');
            mainBanner.classList.add('bg-danger', 'text-white'); // Bootstrap danger theme

            authenticityCard.style.backgroundColor = '#ffe6e6'; // Light green background
            authenticityCard.style.borderColor = '#ff9999';    // Dark green border
            authenticityCard.querySelector('h6').style.color = '#dc3545'; // Dark green title

            tweetDetails.textContent = `This is disinformation.`;
        }


        // Update Guide Section
        // const factCheckDetails = document.getElementById('factCheckDetails');
        // factCheckDetails.textContent = data.fact_check;
        const factCheckDiv = document.getElementById('factCheck');
        const factCheckDetails = document.getElementById('factCheckDetails');
        // Update the content of the #factCheckDetails
        factCheckDetails.textContent = data.fact_check;

        // Make the #factCheck div visible
        //remove class d-none from factCheckDiv
        factCheckDiv.classList.remove('d-none');


        const factCheckDefenceDetails = document.getElementById('factCheckDefenceDetails');
        factCheckDefenceDetails.textContent = data.fact_check_defence;



        const nextGuide = document.getElementById('nextGuide');
        nextGuide.textContent = data.todo;
        if (data.counter_tweet === undefined || data.counter_tweet === null || data.counter_tweet === "" || data.counter_tweet == "N/A") {
            data.counter_tweet = "N/A";
        }
        const counterTweetList = document.getElementById('counterTweetList');
        counterTweetList.textContent = data.counter_tweet;
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling animation
        });
        //  Add copy functionality to the "Copy" icon
        const copyIcon = document.getElementById('copyCounterIcon');
        copyIcon.addEventListener('click', () => {
            navigator.clipboard.writeText(data.counter_tweet)
                .then(() => {
                    toastr.success("Counter tweet copied to clipboard!", "Success");
                })
                .catch(() => {
                    toastr.error("Failed to copy counter tweet.", "Error");
                });
        });
        const tweetsContainer = document.getElementById('tweets');
        const showTweetsButton = document.getElementById('showTweetsButton');
        if (window.innerWidth < 768) {
            // showTweetsButton.classList.add('d-none');
            tweetsContainer.classList.add('d-none');
            showTweetsButton.onclick = () => {
                tweetsContainer.classList.toggle('d-none');
            };
        }
    } catch (error) {
        console.error('Error fetching guide:', error);
        toastr.error("An error occurred while loading the guide.", "Error");
    } finally {
        // Ensure loading screen is hidden in case of an error
        loadingScreen.classList.remove('active');
    }
}

// async function fetchGuide(tweetContent) {


//     try {
//         const response = await fetch(`https://disinformation-simulator.onrender.com/api/guide`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ tweet: tweetContent }), // Send tweet content to backend
//         });

//         const data = await response.json();
//         const guideDataElement = document.querySelector('.guide-data');
//         guideDataElement.style.display = 'block';
//         // Update Main Content
//         const mainBanner = document.getElementById('mainBanner');
//         mainBanner.textContent = data.old_tweet;

//         const tweetDetails = document.getElementById('tweetDetails');
//         tweetDetails.textContent = `Authenticity: ${data.authentic}`;

//         // Update Guide Section
//         const factCheckDetails = document.getElementById('factCheckDetails');
//         factCheckDetails.textContent = data.fact_check;

//         const factCheckDefenceDetails = document.getElementById('factCheckDefenceDetails');
//         factCheckDefenceDetails.textContent = data.fact_check_defence;

//         const nextGuide = document.getElementById('nextGuide');
//         nextGuide.textContent = data.todo;

//         const counterTweetList = document.getElementById('counterTweetList');
//         counterTweetList.textContent = data.counter_tweet;

//         // Add copy functionality to the "Copy" icon
//         const copyIcon = document.getElementById('copyCounterIcon');
//         copyIcon.addEventListener('click', () => {
//             navigator.clipboard.writeText(data.counter_tweet)
//                 .then(() => {
//                     alert("Counter tweet copied to clipboard!");
//                 })
//                 .catch(() => {
//                     alert("Failed to copy counter tweet.");
//                 });
//         });
//     } catch (error) {
//         console.error('Error fetching guide:', error);
//     }
// }




//copy button
const copyButtons = document.querySelectorAll('.copy-btn');

// Add functionality to the "Sample File" button
document.getElementById('downloadTweetsButton').addEventListener('click', (event) => {
    event.preventDefault(); // Prevent the default button action (form submission)

    const filePath = './tweets.txt'; // Path to the sample file
    const link = document.createElement('a');
    link.href = filePath;
    link.download = 'tweets.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
