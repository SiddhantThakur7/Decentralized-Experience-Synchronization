import ChromeStorage from "../Storage/ChromeStorage.js";
class Initial {
  storageClient = null;
  constructor() {
    this.storageClient = new ChromeStorage();
    this.setupEventListeners();
  }

  setupEventListeners = () => {
    document.getElementById("saveNameButton").addEventListener("click", this.saveName);
  }

  instantiate = async () => {
    const userName = await this.storageClient.Get("userName");
    if (userName) {
      window.location.href = "index.html";
    }
  }

  saveName = () => {
    const userName = document.getElementById("userName").value?.trim();
    if (userName) {
      this.storageClient.Set('userName', userName);
      window.location.href = "index.html";
    } else {
      alert("Please enter your name.");
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const initial = new Initial();
  await initial.instantiate();
});