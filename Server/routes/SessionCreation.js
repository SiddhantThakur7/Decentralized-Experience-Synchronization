const express = require('express');
const CreateController = require('../Controllers/SessionCreation');

const router = express.Router();
const createController = new CreateController();


router.post('/', createController.createSession);

module.exports = router;