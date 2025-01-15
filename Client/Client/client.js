
class Client {
    player = null;

    constructor() {
        this.setupCommunicationChannels();
    }

    setupCommunicationChannels = () => {
        window.addEventListener("MESSAGE:CLIENT", this.eventHandler);
    }

    setupPlayer = async () => {
        const videoPlayer = await (new Player()).instantiate();
        videoPlayer.setPostEventAction(() =>
            window.dispatchEvent(new CustomEvent(
                "MESSAGE:MAIN",
                {
                    detail: {
                        event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
                        playState: videoPlayer.currentPlayState(),
                        timestamp: videoPlayer.currentTimestamp()
                    }
                }
            ))
        );
        videoPlayer.setplayingStateChangeListener(() => console.log(videoPlayer.currentPlayState() ? "Played" : "Paused"));
        videoPlayer.setSeekListener(() => console.log("Seeked"));
        videoPlayer.pauseAt(0);
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
            case Constants.SESSION_CREATED:
                if (!this.player) {
                    this.player = this.setupPlayer();
                }
            default:
                break;
        }
    }
}

var client = null;
window.addEventListener("load", async () => {
    client = new Client();
});

