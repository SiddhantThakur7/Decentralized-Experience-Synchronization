const { v4: uuidv4 } = require('uuid');
const Constants = require('../Constants');
const ConnectionEntityManagementService = require('../Services/ConnectionEntiyManagementService');

class SessionCreationController {
    constructor() { }

    instantiate = async () => {
        this.connectionEntityManagementService = await (new ConnectionEntityManagementService()).instantiate();
        return this;
    }

    createSession = (req, res, next) => {
        var sessionId = uuidv4();
        const signallingService = req.app.get(Constants.SIGNALLING_SERVICE_INSTANCE);
        signallingService.createChannel(sessionId, this.connectionEntityManagementService.manageConnectionRequest);
        res.status(200).json({
            sessionId: sessionId
        });
    }
}

module.exports = SessionCreationController;

