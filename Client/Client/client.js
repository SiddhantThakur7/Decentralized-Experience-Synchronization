
import Constants from "../Constants/Constants.js";
import Player from "../Player/Player.js";

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
        return videoPlayer;
    }

    eventHandler = async (event) => {
        const evt = event.detail;
        switch (evt.event) {
            case Constants.REMOTE_STREAM_MANIPULATED_EVENT:
                if (evt.playState) {
                    this.player.playFrom(evt.timestamp);
                }
                else {
                    this.player.pauseAt(evt.timestamp);
                }
                break;
            case Constants.CREATE_SESSION:
                if (!this.player) {
                    this.player = await this.setupPlayer();
                }
                break;
            case Constants.PEER_CONNECTED:
                if (!this.player) {
                    this.player = await this.setupPlayer();
                }
                if (event.detail.getStatus) {
                    window.dispatchEvent(new CustomEvent("MESSAGE:MAIN",
                        {
                            detail: {
                                event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
                                playState: this.player.currentPlayState(),
                                timestamp: this.player.currentTimestamp()
                            }
                        })
                    );
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

