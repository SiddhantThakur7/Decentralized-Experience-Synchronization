let chatWindow = null;
let videoWindow = null;

const windowFeatures = {
  width: 400,
  height: window.screen.availHeight,
  top: 0,
  left: window.screen.availWidth - 420,
};

document.getElementById("openChat").addEventListener("click", () => {
  if (!chatWindow) {
    chatWindow = window.open(
      "chat.html", // Replace with the correct path to your chat page
      "ChatWindow",
      `width=${windowFeatures.width},height=${windowFeatures.height},top=${windowFeatures.top},left=${windowFeatures.left}`
    );
  }
});

document.getElementById("closeChat").addEventListener("click", () => {
  if (chatWindow) {
    chatWindow.close();
    chatWindow = null;
  }
});

document.getElementById('openVideo').addEventListener('click', () => {
  window.open('video.html', 'Video Feed', 'width=600,height=400');
});


document.getElementById("closeVideo").addEventListener("click", () => {
  if (videoWindow) {
    videoWindow.close();
    videoWindow = null;
  }
});

document.getElementById("create-offer-button").addEventListener("click", () => {
  const localDescription = document.getElementById("local-description").value;
  console.log("Local Description Submitted:", localDescription);
  alert("Local description submitted!");
});
