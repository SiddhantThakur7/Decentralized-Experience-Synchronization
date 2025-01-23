document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("userName", (data) => {
      if (!data.userName) {
        window.location.href = "name.html";
      } else {
        console.log("Stored user name:", data.userName);
      }
    });
  });