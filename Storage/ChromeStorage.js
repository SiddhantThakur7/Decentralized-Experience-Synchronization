import Constants from '../Constants/Constants.js';
class ChromeStorage {
    storagePort = null;

    constructor() {
        this.setupStorageChannel();
    }

    setupStorageChannel = () => {
        this.storagePort = chrome.runtime.connect({ name: Constants.MAIN_STORAGE_PORT });
        this.storagePort.postMessage("Connection Established!");
        return this.extensionPort;
    }

    Set = (key, value) => {
        this.storagePort.postMessage({
            event: Constants.STORAGE_SET,
            key: key,
            value: value,
        });
    }

    Get = async (key) => {
        const promise = new Promise((resolve, reject) => {
            const dataResolver = (data) => {
                this.storagePort.onMessage.removeListener(dataResolver);
                resolve(data);
            }
            this.storagePort.onMessage.addListener(dataResolver);
        });
        this.storagePort.postMessage({
            event: Constants.STORAGE_GET,
            key: key
        });
        console.log(this.storagePort);
        return promise;
    }
}

export default ChromeStorage;