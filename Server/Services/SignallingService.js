class SignallingService {
    sessionChannelMap = null;
    io = null;

    constructor(io) {
        this.sessionChannelMap = new Map();
        this.io = io;
    }

    createChannel = (sessionId, eventHandler) => {
        const channel = this.io.of(`/${sessionId}`);
        channel.on("connection", (socket) => {
            this.sessionChannelMap.set(sessionId, socket);
            socket.on('offer', eventHandler);
            socket.on("disconnect", () => {
                console.log("user disconnected");
            });
            console.log(sessionId, ":Connection established");
        });
    }

    pushToClient = (sessionId, message) => {
        const socket = this.sessionChannelMap.get(sessionId);
        socket.emit("answer", message);
    }

}

module.exports = SignallingService;