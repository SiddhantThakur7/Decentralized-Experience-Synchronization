document.addEventListener("DOMContentLoaded", () => {
    const saveNameButton = document.getElementById("saveNameButton");
    const userNameInput = document.getElementById("userName");
  
    saveNameButton.addEventListener("click", () => {
      const userName = userNameInput.value.trim();
      if (userName) {
        chrome.storage.sync.set({ userName: userName }, () => {
          window.location.href = "index.html";
        });
      } else {
        alert("Please enter your name.");
      }
    });
  });