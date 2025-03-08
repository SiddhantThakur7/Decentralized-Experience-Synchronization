import Constants from "../Constants/Constants.js";
import PeerEntity from "../Connections/PeerEntity.js";
import Chat from "../Chat/chat.js";
import Video from "../Video/video.js";

class Main {
    extensionPort = null;
    peer = null;
    chatController = null;
    videoController = null;

    constructor() {
        this.setupCommunicationChannels();
    }

    instantiate = async () => {
        this.peer = await (new PeerEntity()).instantiate();
        console.log(this.peer);
    }

    setupCommunicationChannels = () => {
        this.setupExtensionCommunicationChannel();
        this.setupClientCommunicationChannel();
    }

    setupExtensionCommunicationChannel = () => {
        chrome.runtime.onConnect.addListener((port) => {
            this.extensionPort = port;
            this.extensionPort.onMessage.addListener(this.extensionEventHandler);
        });
    }

    setupClientCommunicationChannel = () => {
        window.addEventListener("MESSAGE:MAIN", this.clientEventHandler);
    }

    extensionEventHandler = async (event) => {
        switch (event.event) {
            case Constants.CREATE_SESSION:
                await this.createSession();
                break;
            case Constants.EXTENSION_MAIN_CONNECTION_ESTABLISHED:
                console.log(event);
                break;
            case 'Inject':
                console.log('Injecting chat in Main.js', this.peer.session.sessionId, this.peer.peerId);
                if (!this.chatController) this.chatController = new Chat(this.peer.session.sessionId, this.peer.peerId);
                this.chatController.inject();
                break;
            case 'CloseChat':
                console.log('Closing chat in Main.js');
                if (this.chatController) {
                    this.chatController.remove();
                    this.chatController = null;
                }
                break;
            case 'InjectVideo':
                console.log('Injecting video in Main.js');
                if (!this.videoController) this.videoController = new Video(this.peer.session.sessionId, this.peer.peerId);
                this.videoController.inject();
                break;
            case 'CloseVideo':
                console.log('Closing video in Main.js');
                if (this.videoController) {
                    this.videoController.remove();
                    this.videoController = null;
                }
                break;
            default:
                console.log("No listener found:", event);
                break;
        }
    }

    clientEventHandler = (event) => {
        switch (event.detail.event) {
            case Constants.REMOTE_STREAM_MANIPULATED_EVENT:
                this.peer.Broadcast(event.detail);
                break;
            case Constants.SESSION_CREATED:
                this.extensionPort.postMessage(event.detail);
                window.dispatchEvent(new CustomEvent("MESSAGE:CLIENT", { detail: event.detail }));
                break;
            case Constants.CHAT_MESSAGE:
                this.peer.Broadcast({
                    event: Constants.CHAT_MESSAGE,
                    message: event.detail.message,
                    originator: this.peer.peerId
                });
                break;
            case Constants.VIDEO_MESSAGE:
                this.peer.broadcastStream(event.detail.stream);
                this.peer.Broadcast({
                    event: Constants.VIDEO_MESSAGE
                });
                break;
            default:
                console.log("No listener found:", event);
                break;
        }
    }

    startVideoStream = async () => {
        if (!this.videoController) {
            console.error('Video controller is not initialized.');
            return;
        }

        // Wait for connections to be established before starting the video stream
        await this.waitForConnections();

        await this.videoController.startVideo();
    }

    stopVideoStream = () => {
        if (!this.videoController) {
            console.error('Video controller is not initialized.');
            return;
        }
        this.videoController.stopVideo();
    }

    waitForConnections = async () => {
        while (this.peer.connections.length === 0 || !this.peer.connections.every(conn => conn.connected)) {
            console.log("Waiting for connections to be established...");
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log("All connections established.");
    }

    createSession = async () => {
        await this.peer.CreateSessionRequest();
        this.extensionPort.postMessage({
            event: Constants.CREATE_SESSION,
            sessionId: this.peer.session.sessionId
        });
        window.dispatchEvent(new CustomEvent("MESSAGE:CLIENT",
            {
                detail: {
                    event: Constants.CREATE_SESSION,
                }
            })
        );
    }
}

window.addEventListener("load", async () => {
    console.log("extensionId = ", chrome.runtime.id);

    const main = await (new Main()).instantiate();
    console.log("main =", main);
});