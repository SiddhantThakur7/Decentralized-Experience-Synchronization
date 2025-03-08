let chatWindow = null;
let videoWindow = null;

const windowFeatures = {
  width: 400,
  height: window.screen.availHeight,
  top: 0,
  left: window.screen.availWidth - 420,
};

// document.getElementById("openChat").addEventListener("click", async () => {
//   const sessionId = 'your-session-id'; // Replace with actual session ID
//   const peerId = 'your-peer-id'; // Replace with actual peer ID

//   const Chat = (await import('./Chat/chat.js')).default;
//   const chat = new Chat(sessionId, peerId);
//   await chat.inject();
// });

// document.getElementById("closeChat").addEventListener("click", () => {
//   const chatContainer = document.querySelector('.chat-container');
//   if (chatContainer) {
//     chatContainer.remove();
//   }
// });

document.getElementById('openVideo').addEventListener('click', () => {
  videoWindow = window.open('video.html', 'Video Feed', 'width=600,height=400');
});

document.getElementById("closeVideo").addEventListener("click", () => {
  if (videoWindow) {
    videoWindow.close();
    videoWindow = null;
  }
});