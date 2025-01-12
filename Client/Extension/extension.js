var tabId = null;
var contentScriptConnection = null;
var webpageConnection = null;
var statusDisplay = null;
var connectionForm = null;
var answer = null;
var channel = null;

const servers = {
  iceServers: [
    {
      urls: Constants.STUN_SERVERS
    }
  ],
  iceCandidatePoolSize: Constants.ICE_CANDIDATE_POOL_SIZE
};
var pc = new RTCPeerConnection(servers);

chrome.runtime.onConnect.addListener(function (port) {
  contentScriptConnection = port;
  port.onMessage.addListener(function (msg) {
    console.log("Content-Script: ", msg);
  });
});

chrome.runtime.onConnectExternal.addListener(function (port) {
  webpageConnection = port;
  port.onMessage.addListener(function (evt) {
    console.log("Webpage Message: ", evt);
    statusDisplay.innerHTML = `Status: ${!evt.playState ? "Paused" : "Playing"}`;
    if (channel)
      channel.send(
        JSON.stringify({
          event: evt.event,
          playState: evt.playState,
          timestamp: evt.timestamp
        })
      )
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  connectionForm = document.getElementById("connection-form");
  const button = document.getElementById("testButton");
  statusDisplay = document.getElementById("status");
  if (button) {
    button.addEventListener("click", () => {
      statusDisplay.innerHTML = statusDisplay.innerHTML == "Status: Paused" ? "Status: Playing" : "Status: Paused";
      console.log("Button Clicked 1", contentScriptConnection, statusDisplay);
      contentScriptConnection.postMessage(
        JSON.stringify({
          event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
          playState: statusDisplay.innerHTML == "Status: Playing",
          timestamp: 10000
        }));
    });
  } else {
    console.error("Button with ID 'testButton' not found.");
  }

  document
    .getElementById("create-offer-button")
    .addEventListener("click", createOffer);
  document
    .getElementById("respond-offer-button")
    .addEventListener("click", respondToOffer);
});

async function createOffer() {
  if (!pc) {
    pc = new RTCPeerConnection(servers);
  }
  makeDataChannel();
  const offerDescription = await pc.createOffer();
  await pc.setLocalDescription(offerDescription);
  console.log(pc);
  console.log("Your offer is:", JSON.stringify(pc.localDescription));
  pc.onicecandidate = function (candidate) {
    if (candidate.candidate == null) {
      document.getElementById("local-description").value = JSON.stringify(
        pc.localDescription
      );
    }
  };
}

async function respondToOffer() {
  if (!pc) {
    pc = new RTCPeerConnection(servers);
  }
  data = JSON.parse(document.getElementById("remote-description").value);
  sessionDescription = new RTCSessionDescription(data);
  handleDataChannel();
  pc.setRemoteDescription(sessionDescription);
  if (pc.localDescription) {
    return;
  }
  const answerDescription = await pc.createAnswer();
  await pc.setLocalDescription(answerDescription);
  pc.onicecandidate = function (candidate) {
    if (candidate.candidate == null) {
      console.log("answer: ", JSON.stringify(pc.localDescription));
      document.getElementById("local-description").value = JSON.stringify(
        pc.localDescription
      );
    }
  };
}

function makeDataChannel() {
  // If you don't make a datachannel *before* making your offer (such
  // that it's included in the offer), then when you try to make one
  // afterwards it just stays in "connecting" state forever.  This is
  // my least favorite thing about the datachannel API.
  channel = pc.createDataChannel("test", { reliable: true });
  channel.onopen = function () {
    console.log("Channel Created!");
    connectionForm.style.display = "none";
  };
  channel.onmessage = function (evt) {
    eventData = JSON.parse(evt.data);
    console.log("Message recieved: ", eventData);
    if (data.message == "Changed Status")
      contentScriptConnection.postMessage(
        JSON.stringify({
          event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
          playState: eventData.playState,
          timestamp: eventData.timestamp
        })
      );
  };
  channel.onerror = error => console.log(error);
}

function handleDataChannel() {
  pc.ondatachannel = function (evt) {
    channel = evt.channel;
    console.log("Channel found: ", channel, connectionForm);
    connectionForm.style.display = "none";
    channel.onopen = function () {
      console.log("Channel found: ", channel);
    };
    channel.onmessage = function (evt) {
      eventData = JSON.parse(evt.data);
      console.log("Message recieved: ", eventData, contentScriptConnection);
      if (data.message == "Status Changed")
        contentScriptConnection.postMessage(
          JSON.stringify({
            event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
            playState: eventData.playState,
            timestamp: eventData.timestamp
          }));
    };
    channel.onerror = error => console.log(error);
  };
}
