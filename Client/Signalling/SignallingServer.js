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

        this.socket.on("connect", () => {
            console.log(`Connected to session ${this.sessionId} with ID: ${this.socket.id}`);
        });
    }

    registerAnswerHandler(eventHandler) {
        this.socket.on('answer', (data) => eventHandler(JSON.parse(data)));
    }

    push = (data) => {
        this.socket.emit('offer', JSON.stringify(data));
    }
}