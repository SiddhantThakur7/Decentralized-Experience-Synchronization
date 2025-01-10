const { v4: uuidv4 } = require('uuid');
const Constants = require('../Constants');
const ConnectionEntityManagementService = require('../Services/ConnectionEntiyManagementService');

class SessionCreationController {
    constructor() { }

    createSession = (req, res, next) => {
        var sessionId = uuidv4();
        const signallingService = req.app.get(Constants.SIGNALLING_SERVICE_INSTANCE);
        var connectionEntityManagementService = new ConnectionEntityManagementService();
        signallingService.createChannel(sessionId, connectionEntityManagementService.manageConnectionRequest);
        res.status(200).send(sessionId);
    }
}

module.exports = SessionCreationController;

