const Session = require('../Models/Session');
const Connection = require('../Models/Connection');
const Offer = require('../Models/Offer');
const RedisClient = require('./RedisClient');


class ConnectionEntityManagementService {
    dataLayer = null;
    constructor() {
        this.dataLayer = new RedisClient();
    }

    manageConnectionRequest = async (session) => {
        await this.dataLayer.set(sessionId, session);
    }

    getUniqueOffer = async (sessionId) => {
        let offer = null;
        // await this.dataLayer.lock(sessionId);
        const session = await this.dataLayer.get(sessionId);
        const offerIndex = session.consumed;
        offer = new Offer(session.connections[offerIndex].offer, offerIndex);
        session.consumed += 1;
        await this.dataLayer.set(sessionId, session);
        return offer;
    }

    manageConnectionResponse = async (sessionId, answer) => {
        const session = await this.dataLayer.get(sessionId);
        session.connections[answer.offerIndex].answer = answer.offer;
        await this.dataLayer.set(sessionId, session);
    }
}

module.exports = ConnectionEntityManagementService;