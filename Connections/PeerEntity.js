import Constants from '../Constants/Constants.js';
import PeerConnectionEntity from './PeerConnectionEntity.js';
import ChromeStorage from '../Storage/ChromeStorage.js';
import ExperienceSession from './ExperienceSession.js';
import Server from '../Signalling/Server.js'
import SignallingServer from '../Signalling/SignallingServer.js'
import Utils from '../Utils.js';

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
    connectedCount = null;

    constructor() {
        this.peerId = Date.now();
        this.server = new Server();
        this.chromeStorage = new ChromeStorage();
    }

    instantiate = async () => {
        if (window.location.origin.includes('decentralized-experience-synchronization.onrender.com')
            || window.location.origin.includes('decentralized-experience-synchronization.onrender.com')
        ) { //Todo: Change 'app' to domain name of the hosted app
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
        const connectionEntity = new PeerConnectionEntity(isPrimary);
        const current = this.connections.length;
        connectionEntity
            .SetChannelOnOpenAction(async () => await this.channelOnOpenHandler(connectionEntity, current))
            .SetChannelOnMessageAction(this.channelOnMessageHandler)
            .SetChannelOnCloseAction(this.channelOnCloseHandler);
        const offer = await connectionEntity.Offer(this.peerId, suffix)
        this.offers.push(offer);
        this.answers.push(null);
        this.connections.push(connectionEntity);

        // NEW: Setup track listener on the connection
        this.setupTrackListener(connectionEntity.peerConnection);
        return offer;
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
        const answer = await this.CreateConnectionResponse(offer, true);
        await this.server.answerConnectionRequest(
            sessionId,
            {
                answer: JSON.stringify(answer),
                offerIndex: Number(offerIndex)
            }
        );
    }

    CompleteHandshake = async (response) => {
        const { answer, offerIndex } = response;
        const connectionEntity = this.connections[offerIndex];
        this.answers[offerIndex] = await connectionEntity.Answer(JSON.parse(answer));
    }

    CreateConnectionResponse = async (remoteSdp, isPrimary = false) => {
        const connectionEntity = new PeerConnectionEntity(isPrimary);
        const current = this.connections.length;
        connectionEntity
            .SetChannelOnOpenAction(async () => await this.channelOnOpenHandler(connectionEntity, current))
            .SetChannelOnMessageAction(this.channelOnMessageHandler)
            .SetChannelOnCloseAction(this.channelOnCloseHandler);
        const answer = await connectionEntity.Answer(JSON.parse(remoteSdp));
        this.answers.push(answer);
        this.connections.push(connectionEntity);
        if (isPrimary) {
            this.session.SetPrimaryPeerConnection(connectionEntity);
        }
        // NEW: Setup track listener on the connection
        this.setupTrackListener(connectionEntity.peerConnection);
        return answer;
    }

    //Event Handlers
    channelOnOpenHandler = async (connectionEntity, index) => {
        console.log(connectionEntity, index);
        this.connectedCount += 1;
        console.log("Channel Opened!");
        if (this.isPrimary) {
            await Utils.sleep(5000);
            window.dispatchEvent(new CustomEvent("MESSAGE:CLIENT", { detail: { event: Constants.PEER_CONNECTED, getStatus: this.isPrimary } }));
            if (this.isPrimary) this.sendSelfOrganizingOfferRequests(connectionEntity, index);
        } else {
            window.dispatchEvent(new CustomEvent("MESSAGE:CLIENT", { detail: { event: Constants.PEER_CONNECTED, getStatus: this.isPrimary } }));
        }
    }

    channelOnCloseHandler = async () => {
        this.connectedCount -= 1;
        console.log("Channel Closed!");
    }

    channelOnMessageHandler = async (event) => {
        console.log("Message Received:", event);
        switch (event.event) {
            case Constants.REMOTE_STREAM_MANIPULATED_EVENT:
                window.dispatchEvent(new CustomEvent("MESSAGE:CLIENT", { detail: event }));
                break;
            case Constants.SELF_ORGANIZING_OFFER_RESPONSE:
                this.sendSelfOrganizingAnswerRequests(event.offers, event.connectionIndex);
                break;
            case Constants.SELF_ORGANIZING_ANSWER_RESPONSE:
                this.sendSelfOrganizingHandshakeCompletionRequest(event.answer, event.connectionIndex, event.offerIndex);
                break;
            case Constants.SELF_ORGANIZING_OFFER_REQUEST:
                await this.answerSelfOrganizingOfferRequest(event.connectionIndex);
                break;
            case Constants.SELF_ORGANIZING_ANSWER_REQUEST:
                await this.answerSelfOrganizingAnswerRequest(event.offer, event.connectionIndex, event.offerIndex);
                break;
            case Constants.SELF_ORGANIZING_CONNECTION_REQUEST:
                await this.CompleteHandshake(event);
                break;
            case Constants.CHAT_MESSAGE:
                window.dispatchEvent(new CustomEvent("MESSAGE:CHAT", { detail: event }));
                break;
            case Constants.VIDEO_MESSAGE:
                //console.log("Dispatching MESSAGE:VIDEO event");
                this.connections.forEach(connection => {
                    if (connection.connected) {
                        console.log("At Receiver End the Track:", connection.peerConnection.getSenders().find(s => s.track.kind === 'video').track);
                    }
                });
                window.dispatchEvent(new CustomEvent("MESSAGE:VIDEO", { detail: event }));
                break;
            default:
                console.log("No listener found:", event);
                break;
        }
    }

    //Transmission Methods
    SendToPrimary = (message) => {
        if (!this.session || !this.session.primaryPeerConnection) {
            return null;
        }
        this.session.primaryPeerConnection.Send(message);
    }

    Broadcast = (message) => {
        console.log("Broadcasting method message:", message);
        console.log("Current connections:", this.connections); // Log all connections
        this.connections.forEach(
            connection =>
                connection.connected
                    ? connection.Send(message) :
                    null
        );
    }

    broadcastStream = (stream) => {
        if (!stream) {
            console.log("No stream to broadcast.");
            return;
        }

        console.log("Broadcasting stream to peers:", stream.getVideoTracks()[0]);
        this.connections.forEach(connection => {
            if (connection.connected) {
                console.log("Connection video track before replacing:", connection.peerConnection.getSenders().find(s => s.track.kind === 'video').track);
                connection.replaceTrack(stream.getVideoTracks()[0]);
            }
        });
    };

    setupTrackListener = (peerConnection) => {
        if (!peerConnection) return;
        console.log("Setting up track listener on peerConnection:", peerConnection.getSenders());

        // Ensure trackedReceivers is initialized
        this.trackedReceivers = this.trackedReceivers || [];

        peerConnection.ontrack = (event) => {
            console.log("Received remote track:", event.track);
            //console.log("Received remote stream:", event.streams[0]);

            window.dispatchEvent(new CustomEvent("MESSAGE:VIDEO", {
                detail: { stream: event.streams[0] }
            }));
        };

        // Periodically check for new tracks
        setInterval(() => {
            peerConnection.getReceivers().forEach(receiver => {
                if (this.trackedReceivers && !this.trackedReceivers.includes(receiver.track)) {
                    this.trackedReceivers.push(receiver.track);
                    console.log("New track added:", receiver.track);
                }
            });
        }, 1000);
    };

    stopBroadcastStream = () => {
        this.connections.forEach(connection => {
            connection.getSenders().forEach(sender => {
                if (sender.track.kind === 'video') {
                    connection.removeTrack(sender);
                }
            });
        });
    }

    //Self-Organization Methods
    sendSelfOrganizingOfferRequests = (connectionEntity, index) => {
        if (!connectionEntity.connected) return;
        connectionEntity.Send({
            event: Constants.SELF_ORGANIZING_OFFER_REQUEST,
            connectionIndex: index
        });
    }

    sendSelfOrganizingAnswerRequests = (offers, connectionIndex) => {
        for (let i = 0; i < connectionIndex; i++) {
            if (!this.connections[i].connected) continue;
            this.connections[i].Send({
                event: Constants.SELF_ORGANIZING_ANSWER_REQUEST,
                offer: offers[i],
                offerIndex: i + 1,
                connectionIndex: connectionIndex
            });
        }
    }

    sendSelfOrganizingHandshakeCompletionRequest = (answer, connectionIndex, offerIndex) => {
        if (!this.connections[connectionIndex].connected)
            return;
        this.connections[connectionIndex].Send({
            event: Constants.SELF_ORGANIZING_CONNECTION_REQUEST,
            answer: answer,
            offerIndex: offerIndex,
        });
    }

    answerSelfOrganizingOfferRequest = async (connectionIndex) => {
        for (let i = 0; i < connectionIndex; i++) {
            await this.CreateConnectionRequest(false, i);
        }

        this.SendToPrimary({
            event: Constants.SELF_ORGANIZING_OFFER_RESPONSE,
            offers: this.offers.map(offer => JSON.stringify(offer)),
            connectionIndex: connectionIndex
        });
    }

    answerSelfOrganizingAnswerRequest = async (offer, connectionIndex, offerIndex) => {
        const answer = await this.CreateConnectionResponse(offer, false);
        this.SendToPrimary({
            event: Constants.SELF_ORGANIZING_ANSWER_RESPONSE,
            answer: JSON.stringify(answer),
            offerIndex: offerIndex,
            connectionIndex: connectionIndex
        });
    }
}

export default PeerEntity;