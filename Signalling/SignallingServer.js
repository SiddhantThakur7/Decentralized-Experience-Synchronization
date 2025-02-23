import * as io from '../Socket/Socket.js';

class SignallingServer {
    apiEndpoint = null;
    sessionId = null;
    socket = null;

    constructor(sessionId = "") {
        this.apiEndpoint = "https://decentralized-experience-synchronization.onrender.com"
        this.sessionId = sessionId;
        if (sessionId) this.establishConnection();
    }

    establishConnection = () => {
        this.socket = io(`${this.apiEndpoint}/${this.sessionId}`);
    }

    registerAnswerHandler(eventHandler) {
        this.socket.on('answer', async (data) => eventHandler(JSON.parse(data)));
    }

    push = (data) => {
        this.socket.emit('offer', JSON.stringify(data));
    }
}

export default SignallingServer;