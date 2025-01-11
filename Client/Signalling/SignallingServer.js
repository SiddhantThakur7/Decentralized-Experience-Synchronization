class SignallingServer {
    apiEndpoint = null;
    sessionId = null;
    socket = null;

    constructor(sessionId = "") {
        this.apiEndpoint = "http://localhost:8080"
        this.sessionId = sessionId;
        if (sessionId) this.establishConnection();
    }

    establishConnection = () => {
        this.socket = io(`${this.apiEndpoint}/${this.sessionId}`);
    }

    registerAnswerHandler(eventHandler) {
        this.socket('answer', (data) => eventHandler(JSON.parse(data)));
    }

    push = (data) => {
        this.socket.emit('offer', JSON.stringify(data));
    }
}