const express = require('express');
const AccessController = require('../Controllers/SessionAccess');

const router = express.Router();
const accessController = new AccessController();

router.get('/:sessionId', accessController.getConnectionRequest);

router.post('/:sessionId', accessController.joinSession);

module.exports = router;