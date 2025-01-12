var port = chrome.runtime.connect({ name: Constants.EXTENSION_BRIDGE_PORT });
port.postMessage({ message: "Connection Established!" });
port.onMessage.addListener(function (evt) {
    let eventData = JSON.parse(evt);
    if (eventData.event == Constants.REMOTE_STREAM_MANIPULATED_EVENT) {
        // window.postMessage(evt);
    }
});
console.log("extensionId = ", chrome.runtime.id);

window.extensionId = chrome.runtime.id;

const createSession = async () => {
    return await (new PeerEntity()).instantiate();
}
window.addEventListener("load", async () => {
    console.log("extensionId = ", chrome.runtime.id);

    // player = await setupPlayer(port);
    // console.log("player =", player);
    peer = await createSession();
    console.log("peer =", peer);
});