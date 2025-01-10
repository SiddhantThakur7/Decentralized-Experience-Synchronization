class Connection {
    offer = null
    answer = null
    constructor(offer = null, answer = null) {
        this.offer = offer;
        this.answer = answer;
    }
}

module.exports = Connection;