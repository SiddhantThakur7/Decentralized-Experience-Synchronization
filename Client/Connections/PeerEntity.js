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
            await this.AnswerSessionRequest();
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

    answerHandler = (data) => {
        console.log(data)
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
                    offer: connection.offer ? JSON.stringify(connection.offer) : null,
                    answer: connection.answer ? JSON.stringify(connection.answer) : null,
                }
            })
        })
        this.signallingServer.registerAnswerHandler(this.answerHandler);
    }

    AnswerSessionRequest = async () => {
        const sessionId = window.location.pathname
            .split('/')
            .filter(item => item)
            .slice(-1)[0];
        const url = document.getElementById('session-url').value;
        const offer = document.getElementById('offer-sdp').value;
        const offerIndex = document.getElementById('offer-index').value;
        this.session = new ExperienceSession(sessionId, url);
        await this.CreateConnectionResponse(offer, true);
        await this.server.answerConnectionRequest(
            sessionId,
            {
                answer: JSON.stringify(this.answers[0]),
                offerIndex: Number(offerIndex)
            }
        );
    }

    CreateConnectionRequest = async (isPrimary = false, suffix) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.offers.push(await connectionEntity.Offer(this.peerId, suffix));
        this.connections.push(connectionEntity)
    }

    CreateConnectionResponse = async (remoteSdp, isPrimary = false) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.answers.push(await connectionEntity.Answer(JSON.parse(remoteSdp)));
        this.connections.push(connectionEntity);
        this.session.SetPrimaryPeerConnection(connectionEntity);
    }
}