class Session {
    sessionId = null;
    url = null;
    connections = [];
    consumed = 0;
    constructor(sessionId, url = "", connections = null, consumed = 0) {
        this.sessionId = sessionId;
        this.url = url;
        this.connections = connections;
        this.consumed = consumed;
    }
}

module.exports = Session;

