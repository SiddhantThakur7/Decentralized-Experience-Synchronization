import Constants from "../Constants/Constants.js";

class Extension {
  mainPort = null;
  constructor() {
    this.setupCommunicationChannels();
    this.setupEventListners();
  }

  setupCommunicationChannels = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    this.mainPort = chrome.tabs.connect(tab.id, { name: Constants.EXTENSION_MAIN_PORT });
    this.mainPort.postMessage({ event: Constants.EXTENSION_MAIN_CONNECTION_ESTABLISHED });
    this.mainPort.onMessage.addListener(this.eventHandler);
  }

  setupEventListners() {
    document
      .getElementById("create-session-button")
      .addEventListener("click", () => {
        this.mainPort.postMessage(
          {
            event: Constants.CREATE_SESSION,
          }
        );
      });
    
    document.getElementById("openChat").addEventListener("click", () => {
      console.log('Opening Chat in extension.js');
      this.mainPort.postMessage({ event: 'Inject', type: 'chat' });
    });

    document.getElementById("closeChat").addEventListener("click", () => {
      this.mainPort.postMessage({ event: 'CloseChat', type: 'chat' });
    });

    document.getElementById("openVideo").addEventListener("click", async () => {
      this.mainPort.postMessage({ event: 'InjectVideo', type: 'video' });
    });
    
    document.getElementById("closeVideo").addEventListener("click", () => {
      this.mainPort.postMessage({ event: 'CloseVideo', type: 'video' });
    });
  }

  eventHandler = (event) => {
    console.log(event);
    switch (event.event) {
      case Constants.CREATE_SESSION:
      case Constants.SESSION_CREATED:
        document.getElementById('local-description').value = `https://decentralized-experience-synchronization.onrender.com/session/access/${event.sessionId}`;
        document.getElementById('create-session-button').display = 'none';
        break;
      default:
        break;
    }
  }
}

window.addEventListener("load", async () => {
  const extension = new Extension();
});
//   connectionForm = document.getElementById("connection-form");
//   const button = document.getElementById("testButton");
//   statusDisplay = document.getElementById("status");

//   document
//     .getElementById("create-offer-button")
//     .addEventListener("click", createOffer);
//   document
//     .getElementById("respond-offer-button")
//     .addEventListener("click", respondToOffer);
// });

// async function createOffer() {
//   if (!pc) {
//     pc = new RTCPeerConnection(servers);
//   }
//   makeDataChannel();
//   const offerDescription = await pc.createOffer();
//   await pc.setLocalDescription(offerDescription);
//   console.log(pc);
//   console.log("Your offer is:", JSON.stringify(pc.localDescription));
//   pc.onicecandidate = function (candidate) {
//     if (candidate.candidate == null) {
//       document.getElementById("local-description").value = JSON.stringify(
//         pc.localDescription
//       );
//     }
//   };
// }

// async function respondToOffer() {
//   if (!pc) {
//     pc = new RTCPeerConnection(servers);
//   }
//   data = JSON.parse(document.getElementById("remote-description").value);
//   sessionDescription = new RTCSessionDescription(data);
//   handleDataChannel();
//   pc.setRemoteDescription(sessionDescription);
//   if (pc.localDescription) {
//     return;
//   }
//   const answerDescription = await pc.createAnswer();
//   await pc.setLocalDescription(answerDescription);
//   pc.onicecandidate = function (candidate) {
//     if (candidate.candidate == null) {
//       console.log("answer: ", JSON.stringify(pc.localDescription));
//       document.getElementById("local-description").value = JSON.stringify(
//         pc.localDescription
//       );
//     }
//   };
// }

// function makeDataChannel() {
//   // If you don't make a datachannel *before* making your offer (such
//   // that it's included in the offer), then when you try to make one
//   // afterwards it just stays in "connecting" state forever.  This is
//   // my least favorite thing about the datachannel API.
//   channel = pc.createDataChannel("test", { reliable: true });
//   channel.onopen = function () {
//     console.log("Channel Created!");
//     connectionForm.style.display = "none";
//   };
//   channel.onmessage = function (evt) {
//     eventData = JSON.parse(evt.data);
//     console.log("Message recieved: ", eventData);
//     if (data.message == "Changed Status")
//       contentScriptConnection.postMessage(
//         JSON.stringify({
//           event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
//           playState: eventData.playState,
//           timestamp: eventData.timestamp
//         })
//       );
//   };
//   channel.onerror = error => console.log(error);
// }

// function handleDataChannel() {
//   pc.ondatachannel = function (evt) {
//     channel = evt.channel;
//     console.log("Channel found: ", channel, connectionForm);
//     connectionForm.style.display = "none";
//     channel.onopen = function () {
//       console.log("Channel found: ", channel);
//     };
//     channel.onmessage = function (evt) {
//       eventData = JSON.parse(evt.data);
//       console.log("Message recieved: ", eventData, contentScriptConnection);
//       if (data.message == "Status Changed")
//         contentScriptConnection.postMessage(
//           JSON.stringify({
//             event: Constants.REMOTE_STREAM_MANIPULATED_EVENT,
//             playState: eventData.playState,
//             timestamp: eventData.timestamp
//           }));
//     };
//     channel.onerror = error => console.log(error);
//   };
// }
