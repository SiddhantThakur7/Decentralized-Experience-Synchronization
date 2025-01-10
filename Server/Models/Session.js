class Session {
    sessionId = null;
    connections = [];
    consumed = 0;
    constructor(sessionId, connections = null, consumed = 0) {
        this.sessionId = sessionId;
        this.connections = connections;
        this.consumed = consumed;
    }
}

module.exports = Session;

