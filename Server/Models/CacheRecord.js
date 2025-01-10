class CacheRecord {
    lock = false
    data = null
    constructor(data = null, lock = false) {
        this.data = data;
        this.lock = lock;
    }
}

module.exports = CacheRecord;