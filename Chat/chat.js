const { default: Constants } = require("../Constants/Constants");
const { default: ChromeStorage } = require("../Storage/ChromeStorage");


class Chat {
    storageClient = null;
    constructor(sessionId, peerId) {
        this.peerId = peerId;
        this.sessionId = sessionId;
        this.storageClient = new ChromeStorage();
        window.addEventListener('MESSAGE:CHAT', this.eventHandler);
    }

    inject = async () => {
        // if (window.trustedTypes && window.trustedTypes.createPolicy) {
        //     if (!window.trustedTypes.getPolicy('default')) {
        //         window.trustedTypes.createPolicy('default', {
        //             createHTML: (string, sink) => string
        //         });
        //     }
        // }
        
        try {
            const chatHtmlUrl = chrome.runtime.getURL('Chat/chat.html');
            const messageTemplateUrl = chrome.runtime.getURL('Chat/message.html');

            const response = await fetch(chatHtmlUrl);
            const messageTemplate = await fetch(messageTemplateUrl);

            if (!response.ok || !messageTemplate.ok) {
                throw new Error('Network response was not ok');
            }

            const htmlString = await response.text();
            const messageTemplateString = await messageTemplate.text();

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString.trim();
            const messageHistory = await this.storageClient.Get(`messageHistory-${this.sessionId}`) || [];    
            messageHistory.forEach(message => {
                const messageDiv = document.createElement('div');
                messageDiv.innerHTML = messageTemplateString;
                messageDiv.querySelector('#message-body').innerText = message.text;
                messageDiv.querySelector('#sender-name').innerText = message.originator;
                tempDiv.querySelector('.messages').appendChild(messageDiv);
            });

            document.body.appendChild(tempDiv);
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to fetch HTML:', error);
        }
    }

    setupEventListeners = async () => {
        const sendMessageButton = document.getElementById('send-message');
        if (sendMessageButton) {
            sendMessageButton.addEventListener('click', async () => {
                const messageInput = document.getElementById('message-input');
                const messageContent = messageInput.value.trim();
                if (messageContent) {
                    await this.sendMessage(messageContent);
                    messageInput.value = '';
                }
            });
        } else {
            console.error('Send message button not found');
        }
    }

    saveMessageHistory = async (messageBody) => {
        const message = {
            text: messageBody,
            timestamp: new Date().toISOString(),
            originator: this.peerId,
        };
        const messageHistoryKey = `messageHistory-${this.sessionId}`;
        const messageHistory = await this.storageClient.Get(messageHistoryKey) || [];
        messageHistory.push(message);
        await this.storageClient.Set(messageHistoryKey, messageHistory);
    }

    sendMessage = async (message) => {
        // Display the message in the chat window as the sender
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
            <div class="message right">
                <div class="sender-name">${this.peerId}</div>
                <div class="message-content">${message}</div>
            </div>
        `;
        document.querySelector('.messages').appendChild(messageDiv);
        document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
        
        await this.saveMessageHistory(message);
        window.dispatchEvent(new CustomEvent('MESSAGE:MAIN', {
            detail: {
                event: Constants.CHAT_MESSAGE,
                message: {
                    text: message,
                    originator: this.peerId,
                    timestamp: new Date().toISOString()
                }
            }
        }));
    }

    eventHandler = async (event) => {
        console.log('Received event at chat.js:', event.detail.event);
        switch (event.detail.event) {
            case Constants.CHAT_MESSAGE:
                await this.receiveMessage(event.detail.message);
                break;
            default:
                break;
        }
    }

    receiveMessage = async (message) => {
        console.log('Received message:', message);
        await this.saveMessageHistory(message.text);
        const messageDiv = document.createElement('div');
        messageDiv.innerHTML = `
            <div class="message ${message.originator === this.peerId ? 'right' : 'left'}">
                <div class="sender-name">${message.originator}</div>
                <div class="message-content">${message.text}</div>
            </div>
        `;
        document.querySelector('.messages').appendChild(messageDiv);
        document.querySelector('.messages').scrollTop = document.querySelector('.messages').scrollHeight;
    }

    remove() {
        console.log('Removing chat window');
        document.body.querySelector('.chat-container').remove();
        
    }
}

module.exports = Chat;