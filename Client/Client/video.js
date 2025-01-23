// Get video element and buttons
const videoElement = document.getElementById('videoFeed');
const startVideoButton = document.getElementById('startVideo');
const stopVideoButton = document.getElementById('stopVideo');

// Function to start video feed
async function startVideo() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    videoElement.srcObject = stream;
    startVideoButton.disabled = true;
    stopVideoButton.disabled = false;
  } catch (error) {
    console.error('Error accessing video: ', error);
  }
}

// Function to stop video feed
function stopVideo() {
  const stream = videoElement.srcObject;
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    videoElement.srcObject = null;
    startVideoButton.disabled = false;
    stopVideoButton.disabled = true;
  }
}

// Event listeners for buttons
startVideoButton.addEventListener('click', startVideo);
stopVideoButton.addEventListener('click', stopVideo);

// Disable the stop button initially
stopVideoButton.disabled = true;
