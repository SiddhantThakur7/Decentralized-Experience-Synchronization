const { default: Constants } = require("../Constants/Constants");
const { default: ChromeStorage } = require("../Storage/ChromeStorage");

// Event listners for Chat.html;
class Chat {
    storageClient = null;
    constructor(sessionId, peerId) {
        this.peerId = peerId;
        this.sessionId = sessionId;
        this.storageClient = new ChromeStorage();
        window.addEventListener('MESSAGE:CHAT', this.eventHandler);
    }

    inject = async () => {
        if (window.trustedTypes && window.trustedTypes.createPolicy) {
            window.trustedTypes.createPolicy('default', {
                createHTML: (string, sink) => string
            });
        }

        try {
            const response = await fetch('Chat.html');
            const messageTemplate = await fetch('Message.html');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const htmlString = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString.trim();
            const messageHistory = this.storageClient.get(`messageHistory-${this.sessionId}`);
            messageHistory.map(message => {
                const messageDiv = document.createElement('div');
                messageDiv.innerHTML = messageTemplate;
                messageDiv.getElementById('message-messagebody').innerText = message.text;
                messageDiv.getElementById('sender-name').innerText = message.originator;
                tempDiv.appendChild(messageDiv);
            })

            document.body.appendChild(tempDiv);
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to fetch HTML:', error);
        }
    }

    setupEventListeners = async () => {
        document.getElementById('send-message').addEventListener('click', async (event) => await this.sendMessage(event.value));
    }

    saveMessageHistory = async (messageBody) => {
        const message = {
            text: messageBody,
            timestamp: new Date().toISOString(),
            originator: this.peerId,
        }
        const messageHistoryKey = `messageHistory-${this.sessionId}`;
        const messageHistory = await this.storageClient.get(messageHistoryKey);
        messageHistory.push(message);
        this.storageClient.set(messageHistoryKey, messageHistory);
    }

    sendMessage = async (message) => {
        await saveMessageHistory(message);
        window.dispatchEvent(new CustomEvent('MESSAGE:MAIN', {
            detail: {
                text: message,
            }
        }));
    }

    eventHandler = async (event) => {
        switch (event.detail.event) {
            case Constants.CHAT_MESSAGE:
                await this.receiveMessage(event.detail.message);
                break;
            default:
                break;
        }
    }

    receiveMessage = async (message) => {
        await saveMessageHistory(message);
        // Add the message to the chat window
    }
}

module.exports = Chat;