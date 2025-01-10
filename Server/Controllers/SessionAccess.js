const Constants = require('../Constants');
const ConnectionEntityManagementService = require('../Services/ConnectionEntiyManagementService');

class SessionCreationController {
    connectionEntityManagementService = null;
    constructor() {
        this.connectionEntityManagementService = new ConnectionEntityManagementService();
    }

    getConnectionRequest = (req, res, next) => {
        const sessionId = req.param.sessionId;
        this.connectionEntityManagementService.getUniqueOffer()
            .then((offer, error) => {
                if (error)
                    res.status(500).send(error);
                res.render(
                    "loading",
                    {
                        offer: offer
                    }
                );
            });
    }

    joinSession = (req, res, next) => {
        const sessionId = req.param.sessionId;
        const answer = req.body.answer;
        const signallingService = req.app.get(Constants.SIGNALLING_SERVICE_INSTANCE);
        this.connectionEntityManagementService.manageConnectionResponse(sessionId, answer)
            .then((result, error) => {
                if (error)
                    res.status(500).send(error);
                signallingService.pushToClient(sessionId, answer);
                res.status(200);
            });
    }
}

module.exports = SessionCreationController;

