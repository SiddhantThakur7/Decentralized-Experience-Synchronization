const express = require('express');
const AccessController = require('../Controllers/SessionAccess');

const router = express.Router()
const declareRoutes = (router, accessController) => {
    router.get('/:sessionId', accessController.getConnectionRequest);
    router.post('/:sessionId', accessController.joinSession);
}

(new AccessController())
    .instantiate()
    .then((accessController => declareRoutes(router, accessController)))
    .catch((err) => console.log(err));

module.exports = router;