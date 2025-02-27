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

    createAndInjectElementFromHTMLString = () => {
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string, sink) => string
            });
        }
        const htmlString = `
            <div id="popup" style="position: fixed; top: 0; left: 0; width: 100%; background: white; z-index: 1000000000; text-align: center; padding: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
            <button id="hi-btn" type="submit">Say Hi!!</button>
            <input type="text" id="hi-input" />
      </div>    
        `;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString.trim();
        console.log('tempDiv', tempDiv);
        document.body.appendChild(tempDiv);
        document.getElementById('hi-btn').addEventListener('click', (event) => {
            console.log('hiiiiiiiiiiiiii!!!!!');
            alert('Hi!!');
            document.getElementById('hi-input').value = 'Hi!!';
        })
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
            case 'Inject':
                this.createAndInjectElementFromHTMLString(evt.htmlString);
                break;
            default:
                break;
        }
    }
}

var client = null;
window.addEventListener("load", () => {
    client = new Client();
    console.log(`client = `, client);
});

