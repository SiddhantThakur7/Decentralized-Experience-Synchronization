const express = require('express');
const CreateController = require('../Controllers/SessionCreation');

const router = express.Router();
const declareRoutes = (router, createController) => {
    router.post('/', createController.createSession);
}

new CreateController()
    .instantiate()
    .then((createController => declareRoutes(router, createController)))
    .catch((err) => console.log(err));


module.exports = router;