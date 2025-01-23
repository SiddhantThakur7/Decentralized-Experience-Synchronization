import Constants from '../Constants/Constants.js';
import ChromeStorage from '../Storage/ChromeStorage.js';

class Chat {
  myUsername = "My Name"; // Default value
  otherUsername = "Other Person"; // Replace with retrieved username
  storage = null;
  url = null;

  constructor() {
      this.retrieveUsername();
      this.setupEventListeners();
      this.storage = new ChromeStorage();
      this.url = window.location.href + "messages";
      window.addEventListener("MESSAGE:CHAT", this.receiveMessage);
  }

  retrieveUsername = async () => {
    const userName = await this.storage.Get("userName");
    if (userName) {
      this.myUsername = userName;
      document.getElementById("userNameDisplay").textContent = `You: ${this.myUsername}`;
    } else {
      console.error("User name not found in storage.");
    }
  }

  setUserData = async (userName) => {
    await this.storage.Set("userName", userName);
    this.myUsername = userName;
    document.getElementById("userNameDisplay").textContent = `You: ${this.myUsername}`;
  }
  
  // message = { sender: "sender", text: "text" }
  syncStorage = async (message) => {
    const messages = await this.storage.Get(this.url) ?? [];
    messages.push(message);
    await this.storage.Set(this.url, messages);
  }

  setupEventListeners = () => {
      document.getElementById("send-message").addEventListener("click", this.sendMessage);
  }

  sendMessage = () => {
      const messageInput = document.getElementById("message-input");
      const messageContent = messageInput.value.trim();

      if (messageContent) {
          const message = { sender: this.myUsername, text: messageContent };
          this.syncStorage(message);
          this.addMessage(messageContent, "right", this.myUsername);
          messageInput.value = ""; // Clear the input after sending

          // Dispatch MESSAGE:MAIN event
          window.dispatchEvent(new CustomEvent("MESSAGE:MAIN", {
              detail: {
                  event: Constants.CHAT_ENTRY,
                  sender: this.myUsername,
                  text: messageContent
              }
          }));
      }
  }

  receiveMessage = (event) => {
      const { sender, text } = event.detail;
      this.syncStorage({ sender, text });
      this.addMessage(text, "left", sender);
  }

  addMessage = (content, alignment, senderName) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message", alignment);

      // Create the sender name element
      const senderNameDiv = document.createElement("div");
      senderNameDiv.classList.add("sender-name");
      senderNameDiv.textContent = senderName;

      // Create the message content element
      const contentDiv = document.createElement("div");
      contentDiv.classList.add("message-content");
      contentDiv.textContent = content;

      // Append sender name and message content to the message div
      messageDiv.appendChild(senderNameDiv);
      messageDiv.appendChild(contentDiv);

      // Append the message to the chat
      document.querySelector(".messages").appendChild(messageDiv);
      document.querySelector(".messages").scrollTop = document.querySelector(".messages").scrollHeight; // Scroll to bottom
  }
}

// Instantiate the Chat class when the script loads
window.addEventListener("load", () => {
  new Chat();
});