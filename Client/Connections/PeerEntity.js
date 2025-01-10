class PeerEntity {
    PEER_LIMIT = 4;
    #peerId = null;
    connections = [];
    offers = [];
    answers = [];
    session = null;
    constructor(isPrimary = false, primaryPeer = null) { }

    instantiate = async () => {
        this.#peerId = Date.now(); //Todo: Change to random hash code
        if (window.location.origin.includes('app')) { //Todo: Change 'app' to domain name of the hosted app
            await this.AnswerSessionRequest(window.location.pathname.slice(1))
        } else {
            await this.CreateSessionRequest();
        }
    }

    InstantiateSession = async () => {
        this.session = new ExperienceSession();
        // await SignallingServer.EstablishSocketConnection();
    }

    CreateSessionRequest = async () => {
        await this.InstantiateSession();
        for (let i = 0; i < PEER_LIMIT; i++) {
            await this.CreateConnectionRequest(true);
        }
        // await SignallingServer.Send({
        //     session: this.session,
        //     offers: this.offers,
        //     answers: this.answers,
        //     connections: this.connections
        // })
    }


    AnswerSessionRequest = async () => {
        // let connectionAssets = await SignallingServer.Get(sessionId);
        this.session = new ExperienceSession(connectionAssets.SessionId);
        await this.CreateConnectionResponse(connectionAssets.Offer, true);
    }

    CreateConnectionRequest = async (isPrimary = false) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.offers.push(await connectionEntity.Offer(this.#peerId, this.offers.length));
        this.connections.push(connectionEntity)
    }

    CreateConnectionResponse = async (remoteSdp, isPrimary = false) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.answers.push(await connectionEntity.Answer(remoteSdp));
        this.connections.push(connectionEntity);
        this.session.SetPrimaryPeer(connectionEntity);
    }
}