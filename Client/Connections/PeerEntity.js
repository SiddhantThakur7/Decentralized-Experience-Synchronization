class PeerEntity {
    PEER_LIMIT = 5;
    peerId = null;
    connections = [];
    offers = [];
    answers = [];
    session = null;
    server = null;
    signallingServer = null;
    chromeStorage = null;

    constructor() {
        this.peerId = Date.now();
        this.server = new Server();
        this.chromeStorage = new ChromeStorage();
    }

    instantiate = async () => {
        if (window.location.origin.includes('localhost:8080')) { //Todo: Change 'app' to domain name of the hosted app
            await this.SaveConnectionAssetsAndProceed();
        } else {
            const connectionAssets = await this.ConnectionAssetsExist();
            if (connectionAssets) {
                this.isPrimary = false;
                await this.AnswerSessionRequest(connectionAssets);
            } else {
                this.isPrimary = true;
            }
        }
        return this;
    }

    InstantiateSession = async () => {
        let sessionId = await this.server.createNewSession();
        this.session = new ExperienceSession(sessionId, window.location.href);
        this.signallingServer = new SignallingServer(sessionId);
        this.signallingServer.registerAnswerHandler(this.CompleteHandshake);
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
    }

    CreateConnectionRequest = async (isPrimary = false, suffix) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.offers.push(await connectionEntity.Offer(this.peerId, suffix));
        this.answers.push(null);
        connectionEntity.SetChannelOnOpenAction(() => console.log("Channel Opened!"));
        this.connections.push(connectionEntity)
    }

    SaveConnectionAssetsAndProceed = () => {
        const sessionId = window.location.pathname
            .split('/')
            .filter(item => item)
            .slice(-1)[0];
        const url = document.getElementById('session-url').value;
        const offer = document.getElementById('offer-sdp').value;
        const offerIndex = document.getElementById('offer-index').value;
        this.chromeStorage.Set(url, {
            sessionId,
            url,
            offer,
            offerIndex,
        });
        window.location.replace(url);
    }

    ConnectionAssetsExist = async () => {
        return await this
            .chromeStorage
            .Get(window.location.href);
    }

    AnswerSessionRequest = async (connectionAssets) => {
        const { sessionId, url, offer, offerIndex } = connectionAssets;
        this.session = new ExperienceSession(sessionId, url);
        await this.CreateConnectionResponse(offer, true);
        await this.server.answerConnectionRequest(
            sessionId,
            {
                answer: JSON.stringify(this.answers[0]),
                offerIndex: Number(offerIndex)
            }
        );
        this.dispatchSessionCreationEvent();
    }

    dispatchSessionCreationEvent = () => {
        window.dispatchEvent(new CustomEvent(
            "MESSAGE:MAIN",
            {
                detail: {
                    event: Constants.SESSION_CREATED
                }
            }));
    }

    CompleteHandshake = async (response) => {
        const { answer, offerIndex } = response;
        const connectionEntity = this.connections[offerIndex];
        this.answers[offerIndex] = await connectionEntity.Answer(JSON.parse(answer));
    }

    CreateConnectionResponse = async (remoteSdp, isPrimary = false) => {
        let connectionEntity = new PeerConnectionEntity(isPrimary);
        this.answers.push(await connectionEntity.Answer(JSON.parse(remoteSdp)));
        connectionEntity.SetChannelOnOpenAction(() => console.log("Channel Opened!"));
        this.connections.push(connectionEntity);
        this.session.SetPrimaryPeerConnection(connectionEntity);
    }

    //Event Handler Registration
    registerChannelOnMessageEventHandler = async (action) => {
        this.connections.forEach(
            connection =>
                connection
                    ? connection.SetChannelOnMessageAction(action) :
                    null
        );
    }

    //Transmission Methods
    SendToPrimary = (message) => {
        if (!this.session || !this.session.primaryPeerConnection) {
            return null;
        }
        this.session.primaryPeerConnection.Send(message);
    }

    Broadcast = (message) => {
        this.connections.forEach(
            connection =>
                connection.connected
                    ? connection.Send(message) :
                    null
        );
    }
}