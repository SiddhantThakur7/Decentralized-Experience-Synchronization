var videoPlayer = null;
var player = null;
var port = chrome.runtime.connect(Constants.EXTENSION_ID, { name: Constants.EXTENSION_ID });

window.addEventListener("load", async () => {
    player = new Player();
    await player.instantiate();
    port.postMessage({ message: "Connection Established!", status: !player.currentPlayState() });

    player.setPostEventAction(() =>
        port.postMessage({
            event: Constants.LOCAL_STREAM_MANIPULATED_EVENT,
            playState: player.currentPlayState(),
            timestamp: player.currentTimestamp()
        })
    );
    player.setplayingStateChangeListener(() => console.log(player.currentPlayState() ? "Played" : "Paused"));
    player.setSeekListener(() => console.log("Seeked"));
});

window.addEventListener(
    "message",
    (event) => {
        console.log(event);
        let eventData = JSON.parse(event.data);
        console.log("injected", event, eventData, player, !player.currentPlayState());
        if (eventData.playState != player.currentPlayState()) {
            if (player.currentPlayState()) {
                player.pauseAt(eventData.timestamp);
            } else {
                player.playFrom(eventData.timestamp);
            }
        }
    },
    false
);