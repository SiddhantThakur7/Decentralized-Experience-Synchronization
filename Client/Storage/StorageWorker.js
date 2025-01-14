import Constants2 from '../Constants/Constants2.js';

var storage = null;
var currentUrl = null;
var INTERESTED_URLS = [
    "https://www.netflix.com/",
    "https://www.youtube.com/",
    "http://localhost:8080/"
]

class StorageWorker {
    clientPort = null;

    constructor() {
        this.setupCommunicationChannels();
    }

    setupCommunicationChannels = () => {
        chrome.runtime.onConnect.addListener((port) => {
            if (port.name == Constants2.MAIN_STORAGE_PORT) {
                this.clientPort = port;
                this.clientPort.onMessage.addListener(this.eventHandler);
            }
        });
    }

    eventHandler = async (event) => {
        switch (event.event) {
            case Constants2.STORAGE_SET:
                await this.set(event.key, event.value);
                break;
            case Constants2.STORAGE_GET:
                await this.get(event.key);
                break;
            default:
                break;
        }
    }

    get = async (key) => {
        const data = await chrome.storage.local.get(key);
        this.clientPort.postMessage(data[key] ?? null);
    }

    set = async (key, value) => {
        return await chrome.storage.local.set({ [key]: value });
    }
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    currentUrl = (await chrome.tabs.get(activeInfo.tabId))?.url ?? null;
    console.log('Current URL after tab switch:', currentUrl);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const sourceUrl = currentUrl;  // Previous URL before update
    const targetUrl = tab.url;
    if (!storage && INTERESTED_URLS.some(pattern => targetUrl.includes(pattern))) {
        storage = new StorageWorker();

        // Update previousUrl to the current one for the next tab update
        currentUrl = targetUrl;
    }
});