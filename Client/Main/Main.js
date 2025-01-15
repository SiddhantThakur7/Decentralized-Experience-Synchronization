class Main {
    extensionPort = null;
    peer = null;

    constructor() {
        this.setupCommunicationChannels();
    }

    instantiate = async () => {
        this.peer = await (new PeerEntity()).instantiate();
    }

    setupCommunicationChannels = () => {
        this.setupExtensionCommunicationChannel();
        this.setupClientCommunicationChannel();
    }

    setupExtensionCommunicationChannel = () => {
        chrome.runtime.onConnect.addListener((port) => {
            console.log(port.name);
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
            default:
                break;
        }
    }

    clientEventHandler = async (event) => {
        // console.log(event.detail);
        switch (event.detail.event) {
            case Constants.REMOTE_STREAM_MANIPULATED_EVENT:
                await this.peer.BroadCast(event);
                break;
            case Constants.SESSION_CREATED:
                this.extensionPort.postMessage(event.detail);
                window.dispatchEvent(new CustomEvent("MESSAGE:CLIENT", { detail: event.detail }));
            default:
                break;
        }
    }

    createSession = async () => {
        await this.peer.CreateSessionRequest();
        this.peer.registerChannelOnMessageEventHandler(this.peerEventHandler);
        console.log(this.extensionPort);
        this.extensionPort.postMessage({
            event: Constants.CREATE_SESSION,
            sessionId: this.peer.session.sessionId
        });
    }

    peerEventHandler = (event) => {
        switch (event.event) {
            case Constants.REMOTE_STREAM_MANIPULATED_EVENT:
                window.dispatchEvent(
                    new CustomEvent(
                        "MESSAGE:CLIENT",
                        {
                            detail: event,
                        }
                    ));
                break;
            default:
                break;
        }
    }
}

window.addEventListener("load", async () => {
    console.log("extensionId = ", chrome.runtime.id);

    // player = await setupPlayer(port);
    // console.log("player =", player);
    // peer = await createSession();
    // console.log("peer =", peer);

    const main = await (new Main()).instantiate();
    console.log("main =", main);
});