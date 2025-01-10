var port = chrome.runtime.connect({ name: Constants.EXTENSION_BRIDGE_PORT });
port.postMessage({ message: "Connection Established!" });
port.onMessage.addListener(function (evt) {
    let eventData = JSON.parse(evt);
    if (eventData.event == Constants.REMOTE_STREAM_MANIPULATED_EVENT) {
        window.postMessage(evt);
    }
});

