var port = chrome.runtime.connect({ name: Constants.EXTENSION_BRIDGE_PORT });
port.postMessage({ message: "Connection Established!" });
port.onMessage.addListener(function (msg) {
    console.log("partially-injected: Message Posted", msg)
    window.postMessage("play/pause");
});

