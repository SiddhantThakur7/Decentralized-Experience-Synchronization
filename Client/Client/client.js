var extensionId = null;
const setupCommunication = () => {
    window.addEventListener(
        "message",
        (event) => {
            console.log(event);
            let eventData = JSON.parse(event.data);
            if (eventData.event == Constants.REMOTE_STREAM_MANIPULATED_EVENT) {
                console.log("injected", event, eventData, player, !player.currentPlayState());
                if (eventData.playState != player.currentPlayState()) {
                    if (player.currentPlayState()) {
                        player.pauseAt(eventData.timestamp);
                    } else {
                        player.playFrom(eventData.timestamp);
                    }
                }
            } else if (eventData.event == Constants.REMOTE_STREAM_MANIPULATED_EVENT) {
                extensionId = eventData.extensionId;
            }

        },
        false
    );

    return chrome.runtime.connect(extensionId, { name: Constants.EXTENSION_ID });
}

const setupPlayer = async (port) => {
    let videoPlayer = await (new Player()).instantiate();
    // console.log("player =", player);
    port.postMessage({ message: "Connection Established!", status: !videoPlayer.currentPlayState() });

    videoPlayer.setPostEventAction(() =>
        port.postMessage({
            event: Constants.LOCAL_STREAM_MANIPULATED_EVENT,
            playState: videoPlayer.currentPlayState(),
            timestamp: videoPlayer.currentTimestamp()
        })
    );
    videoPlayer.setplayingStateChangeListener(() => console.log(videoPlayer.currentPlayState() ? "Played" : "Paused"));
    videoPlayer.setSeekListener(() => console.log("Seeked"));
    return videoPlayer;
}

const createSession = async () => {
    return await (new PeerEntity()).instantiate();
}

// var port = setupCommunication();
var player = null;
var peer = null;

window.addEventListener("load", async () => {
    // console.log("extensionId = ", chrome.runtime.id);

    // player = await setupPlayer(port);
    // console.log("player =", player);
    // peer = await createSession();
    // console.log("peer =", peer);
});

