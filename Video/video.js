import Constants from "../Constants/Constants.js";

class Video {
    constructor(sessionId, peerId) {
        this.sessionId = sessionId;
        this.peerId = peerId;
        this.videoElement = null;
        this.startVideoButton = null;
        this.stopVideoButton = null;
        this.stream = null;
        this.canvas = null;
        this.context = null;
        this.frameInterval = null;
        this.frameBuffer = []; // Buffer to store frames before sending
        this.batchSize = 3; // Number of frames to send at once
        window.addEventListener('MESSAGE:VIDEO', this.handleIncomingFrames.bind(this));
    }

    inject = async () => {
        try {
            const videoHtmlUrl = chrome.runtime.getURL('Video/video.html');
            const response = await fetch(videoHtmlUrl);

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const htmlString = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString.trim();

            document.body.appendChild(tempDiv.firstChild);
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to fetch HTML:', error);
        }
    }

    setupEventListeners = () => {
        this.videoElement = document.getElementById('videoFeed');
        this.startVideoButton = document.getElementById('startVideo');
        this.stopVideoButton = document.getElementById('stopVideo');
        this.canvas = document.getElementById('frameCanvas'); // Get the canvas from video.html
        this.context = this.canvas.getContext('2d'); // Get the 2D context to draw frames
      
        this.startVideoButton.addEventListener('click', this.startVideo);
        this.stopVideoButton.addEventListener('click', this.stopVideo);
      
        this.stopVideoButton.disabled = true;
      
        // Dynamically set canvas size to match video metadata
        this.videoElement.onloadedmetadata = () => {
            this.canvas.width = this.videoElement.videoWidth;
            this.canvas.height = this.videoElement.videoHeight;
        };
    }

    startVideo = async () => {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            this.startVideoButton.disabled = true;
            this.stopVideoButton.disabled = false;
            console.log("This is the stream", this.stream);

            this.videoElement.srcObject = this.stream;
            this.videoElement.play(); 

            // Ensure the canvas matches the video size
            this.canvas.width = this.videoElement.videoWidth;
            this.canvas.height = this.videoElement.videoHeight;

            // Use the existing canvas for capturing frames
            this.frameInterval = setInterval(this.captureAndBufferFrames, 1000 / 30);
        } catch (error) {
            console.error('Error accessing video: ', error);
        }
    };

    stopVideo = () => {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.startVideoButton.disabled = false;
            this.stopVideoButton.disabled = true;

            clearInterval(this.frameInterval);
            this.frameBuffer = [];

            window.dispatchEvent(new CustomEvent('MESSAGE:MAIN', {
                detail: {
                    event: Constants.VIDEO_MESSAGE,
                    frames: [],
                    originator: this.peerId
                }
            }));
            console.log("Broadcasted VIDEO_MESSAGE event with empty frames");
        }
    }

    captureAndBufferFrames = () => {
        const videoAspectRatio = this.videoElement.videoWidth / this.videoElement.videoHeight;
        const canvasAspectRatio = this.canvas.width / this.canvas.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (videoAspectRatio > canvasAspectRatio) {
            drawWidth = this.canvas.width;
            drawHeight = this.canvas.width / videoAspectRatio;
            offsetX = 0;
            offsetY = (this.canvas.height - drawHeight) / 2;
        } else {
            drawWidth = this.canvas.height * videoAspectRatio;
            drawHeight = this.canvas.height;
            offsetX = (this.canvas.width - drawWidth) / 2;
            offsetY = 0;
        }

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.drawImage(this.videoElement, offsetX, offsetY, drawWidth, drawHeight);

        const frameData = this.canvas.toDataURL('image/webp');
        this.frameBuffer.push(frameData);

        if (this.frameBuffer.length >= this.batchSize) {
            this.sendFrameBatch();
        }
    }

    sendFrameBatch = () => {
        if (this.frameBuffer.length > 0) {
            window.dispatchEvent(new CustomEvent('MESSAGE:MAIN', {
                detail: {
                    event: Constants.VIDEO_MESSAGE,
                    frames: [...this.frameBuffer], 
                    originator: this.peerId
                }
            }));
            console.log("Sending batch of frames:", this.frameBuffer.length);
            this.frameBuffer = []; // Clear buffer after sending
        }
    }

    handleIncomingFrames = (event) => {
        console.log("Handling incoming frame batch event:", event.detail);
        
        // Check if the originator's peerId is different from the current instance's peerId
        if (event.detail.originator === this.peerId) {
            console.log("Ignoring frames from the same peer.");
            return;
        }
        
        if (!event.detail.frames || event.detail.frames.length === 0) {
          console.log("No frames received.");
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          return;
        }
      
        // Iterate over all frames in the received batch
        event.detail.frames.forEach((frameBase64, index) => {
          //console.log(`Frame ${index + 1} base64:`, frameBase64);
        
          const img = new Image();
          img.src = frameBase64; // Set the base64 image source
        
          img.onload = () => {
            if (this.context) {
              // Clear the canvas before drawing the new frame
              this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
              // Draw the image onto the canvas
              this.context.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            }
          };
        
          img.onerror = (e) => {
            console.error("Error loading image:", e);
          };
        });
    };

    remove = () => {
        const videoContainer = document.querySelector('.video-container');
        if (videoContainer) {
            videoContainer.remove();
        }
    }
}

export default Video;
