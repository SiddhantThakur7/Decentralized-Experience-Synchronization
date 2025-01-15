const Constants = require('../Constants');
const ConnectionEntityManagementService = require('../Services/ConnectionEntiyManagementService');

class SessionAccessController {
    connectionEntityManagementService = null;
    constructor() { }

    instantiate = async () => {
        this.connectionEntityManagementService = await (new ConnectionEntityManagementService()).instantiate();
        return this;
    }

    getConnectionRequest = (req, res, next) => {
        const sessionId = req.params.sessionId;
        this.connectionEntityManagementService.getUniqueOffer(sessionId)
            .then((result) => {
                res.render(
                    "loading",
                    {
                        offer: result.offer,
                        url: result.url
                    }
                );
            })
            .catch(error => res.status(500).send(error));
    }

    joinSession = (req, res, next) => {
        const sessionId = req.params.sessionId;
        const answer = req.body;
        const signallingService = req.app.get(Constants.SIGNALLING_SERVICE_INSTANCE);
        this.connectionEntityManagementService.manageConnectionResponse(sessionId, answer)
            .then((result) => {
                signallingService.pushToClient(sessionId, answer);
                res.status(200).send('success');
            })
            .catch(error => res.status(500).send(error));
    }
}

module.exports = SessionAccessController;

