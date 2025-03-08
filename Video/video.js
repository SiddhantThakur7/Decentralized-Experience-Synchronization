import Constants from "../Constants/Constants.js";

class Video {
    constructor(sessionId, peerId) {
        this.sessionId = sessionId;
        this.peerId = peerId;
        this.videoElement = null;
        this.startVideoButton = null;
        this.stopVideoButton = null;
        this.stream = null;
        window.addEventListener('MESSAGE:VIDEO', this.handleIncomingStream.bind(this));
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

        this.startVideoButton.addEventListener('click', this.startVideo);
        this.stopVideoButton.addEventListener('click', this.stopVideo);

        this.stopVideoButton.disabled = true;
    }

    startVideo = async () => {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            //logging only the video content from the stream
            //console.log('Video Stream:', this.stream.getVideoTracks());            

            // Logging the tracks of the stream
            this.stream.getTracks().forEach(track => {
                console.log('Track:', track.kind, track.id);
            });
            this.startVideoButton.disabled = true;
            this.stopVideoButton.disabled = false;

            this.videoElement.srcObject = this.stream;
            this.videoElement.play();

            // Sending the stream to PeerEntity for broadcasting
            window.dispatchEvent(new CustomEvent('MESSAGE:MAIN', { 
                detail: {
                    event: Constants.VIDEO_MESSAGE,
                    action: 'start', 
                    stream: this.stream
                }
            }));
        } catch (error) {
            console.error('Error accessing video: ', error);
        }
    };

    stopVideo = () => {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.startVideoButton.disabled = false;
            this.stopVideoButton.disabled = true;

            // Stop broadcasting the stream
            window.dispatchEvent(new CustomEvent('MESSAGE:MAIN', { 
                detail: {
                    event: Constants.VIDEO_MESSAGE, 
                    action: 'stop'
                }
            }));
            // Stop broadcasting the stream
            this.peerEntity.stopBroadcastStream();
        }
    }

    handleIncomingStream = (event) => {
        const stream = event.detail.stream;
        console.log('Incoming Stream: ', event);
        if (stream) {
            this.videoElement.srcObject = stream;
            this.videoElement.play();
        }
    };

    remove = () => {
        const videoContainer = document.querySelector('.video-container');
        if (videoContainer) {
            videoContainer.remove();
        }
    }
}

export default Video;