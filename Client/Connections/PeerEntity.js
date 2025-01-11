class PeerEntity {
    PEER_LIMIT = 5;
    peerId = null;
    connections = [];
    offers = [];
    answers = [];
    session = null;
    server = null;
    signallingServer = null;

    constructor() {
        this.server = new Server();
    }

    instantiate = async () => {
        this.peerId = Date.now();
        if (window.location.origin.includes('localhost:8080')) { //Todo: Change 'app' to domain name of the hosted app
            await this.AnswerSessionRequest(window.location.pathname.slice(1))
        } else {
            await this.CreateSessionRequest();
        }
        return this;
    }

    InstantiateSession = async () => {
        var sessionId = await this.server.createNewSession();
        this.session = new ExperienceSession(sessionId, window.location.href);
        this.signallingServer = new SignallingServer(sessionId);
    }

    CreateSessionRequest = async () => {
        await this.InstantiateSession();
        for (let i = 0; i < this.PEER_LIMIT; i++) {
            await this.CreateConnectionRequest(true, i);
        }
        await this.signallingServer.push({
            sessionId: this.session.sessionId,
            url: this.session.url ?? window.location.href,
            connections: this.connections.map(connection => {
                return {
                    offer: connection.offer,
                    answer: connection.answer,
                }
            })
        })
    }

    AnswerSessionRequest = async () => {
        // let connectionAssets = await SignallingServer.Get(sessionId);
        this.session = new ExperienceSession(connectionAssets.SessionId);
        await this.CreateConnectionResponse(connectionAssets.Offer, true);
    }

    CreateConnectionRequest = async (isPrimary = false, suffix) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.offers.push(await connectionEntity.Offer(this.peerId, suffix));
        this.connections.push(connectionEntity)
    }

    CreateConnectionResponse = async (remoteSdp, isPrimary = false) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.answers.push(await connectionEntity.Answer(remoteSdp));
        this.connections.push(connectionEntity);
        this.session.SetPrimaryPeer(connectionEntity);
    }
}