var player = null;
var editorExtensionId = "pcmngjiogdapgmdbcfegloonelminlpp";
var port = chrome.runtime.connect(editorExtensionId, { name: "webpage-netflix" });
var isActor = true;

window.addEventListener("load", async () => {
  player = new NetflixPlayer()
  await player.instantiate()
  player.setplayingStateChangeAction(() => {
    console.log("paused = ", !player.currentPlayState());
    if (isActor) {
      port.postMessage({ message: "Status Changed", status: !player.currentPlayState() });
    }
  });
  player.setplayingStateChangeListener();

  console.log(
    "DOM fully loaded and parsed",
    window,
    window.netflix,
    chrome,
    chrome.runtime,
    player
  );

  port.postMessage({ message: "Connection Established!", status: !player.currentPlayState() });

  window.addEventListener(
    "message",
    (event) => {
      isActor = false;
      console.log("injected", event, player);
      if (player.currentPlayState()) {
        player.pause();
      } else {
        player.play();
      }
      isActor = true;
    },
    false
  );
});