var videoPlayer = null;
var player = null;
var editorExtensionId = "pcmngjiogdapgmdbcfegloonelminlpp";
var port = chrome.runtime.connect(editorExtensionId, { name: "webpage-youtube" });
var isActor = true;

window.addEventListener("load", async () => {
    player = new Player();
    await player.instantiate();
    console.log('hiiiii', player, player.currentPlayState());
    port.postMessage({ message: "Connection Established!", status: !player.currentPlayState() });

    player.setplayingStateChangeListener((e) => {
        console.log(player.currentPlayState() ? "Played" : "Paused", e);
        port.postMessage({ message: "Status Changed", status: !player.currentPlayState(), timestamp: player.currentTimestamp() });
        isActor = true;
    })
    player.setSeekListener((e) => {
        console.log("Seeked", e);
        port.postMessage({ message: "Status Changed", status: !player.currentPlayState(), timestamp: player.currentTimestamp() });
        isActor = true;
    });
});

window.addEventListener(
    "message",
    (event) => {
        isActor = false;
        console.log("injected", event, player, !player.currentPlayState());
        if (player.currentPlayState()) {
            player.pause();
        } else {
            player.play();
        }
    },
    false
);