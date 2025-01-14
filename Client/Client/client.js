
class Client {
    player = null;

    constructor() {
        this.setupCommunicationChannels();
    }

    setupCommunicationChannels = () => {
        window.addEventListener("MESSAGE:CLIENT", this.eventHandler);
    }

    setupPlayer = async (port) => {
        const videoPlayer = await (new Player()).instantiate();
        port.postMessage({ message: "Connection Established!", status: !videoPlayer.currentPlayState() });
        videoPlayer.setPostEventAction(() =>
            port.dispatchEvent(new CustomEvent(
                "MESSAGE:MAIN",
                {
                    event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
                    playState: videoPlayer.currentPlayState(),
                    timestamp: videoPlayer.currentTimestamp()
                }
            ))
        );
        videoPlayer.setplayingStateChangeListener(() => console.log(videoPlayer.currentPlayState() ? "Played" : "Paused"));
        videoPlayer.setSeekListener(() => console.log("Seeked"));
        return videoPlayer;
    }

    eventHandler = (event) => {
        const evt = event.detail;
        switch (evt.event) {
            case Constants.REMOTE_STREAM_MANIPULATED_EVENT:
                if (evt.playState != this.player.currentPlayState())
                    if (evt.playState) {
                        this.player.playFrom(evt.timestamp);
                    }
                    else {
                        this.player.pauseAt(evt.timestamp);
                    }
                break;
            default:
                break;
        }
    }
}
var client = null;
window.addEventListener("load", async () => {
    client = new Client();
});

