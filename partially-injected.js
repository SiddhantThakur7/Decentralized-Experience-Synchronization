var port = chrome.runtime.connect({ name: "content-script" });
port.postMessage({ message: "Connection Established!" });
port.onMessage.addListener(function (msg) {
    console.log(msg);
    window.postMessage("play/pause");
    console.log("partially-injected: Message Posted")
});

