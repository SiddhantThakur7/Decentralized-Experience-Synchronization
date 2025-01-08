var videoPlayer = null;
var player = null;
var editorExtensionId = "pcmngjiogdapgmdbcfegloonelminlpp";
var port = chrome.runtime.connect(editorExtensionId, { name: "webpage-youtube" });

window.addEventListener("load", async () => {
    player = new YouTubePlayer();
    await player.instantiate()
    console.log('hiiiii', player, player.currentPlayState());

    player.setplayingStateChangeAction((e) => {
        console.log(player.currentPlayState() ? "Played" : "Paused", e);
        port.postMessage({ message: "Status Changed", status: !player.currentPlayState() });
    })
    player.setplayingStateChangeListener()
    port.postMessage({ message: "Connection Established!", status: !player.currentPlayState() });
    window.addEventListener(
        "message",
        (event) => {
            console.log("injected", event, player, !player.currentPlayState());
            if (player.currentPlayState()) {
                player.pause();
            } else {
                player.play();
            }
        },
        false
    );
});