const Session = require('../Models/Session');
const Connection = require('../Models/Connection');
const Offer = require('../Models/Offer');
const RedisClient = require('./RedisClient');


class ConnectionEntityManagementService {
    dataLayer = null;
    constructor() { }

    instantiate = async () => {
        this.dataLayer = await (new RedisClient()).instantiate();
        return this;
    }

    manageConnectionRequest = async (sessionData) => {
        let session = new Session(
            sessionData.sessionId,
            sessionData.url,
            sessionData.connections
        );
        await this.dataLayer.set(session.sessionId, session);
    }

    getUniqueOffer = async (sessionId) => {
        let offer = null;
        // await this.dataLayer.lock(sessionId);
        const session = await this.dataLayer.get(sessionId);
        const offerIndex = session.consumed % 5;
        offer = new Offer(JSON.parse(session.connections[offerIndex].offer), offerIndex);
        session.consumed += 1;
        await this.dataLayer.set(sessionId, session);
        return {
            offer: offer,
            url: session.url
        };
    }

    manageConnectionResponse = async (sessionId, answer) => {
        const session = await this.dataLayer.get(sessionId);
        session.connections[answer.offerIndex].answer = answer.answer;
        await this.dataLayer.set(sessionId, session);
    }
}

module.exports = ConnectionEntityManagementService;