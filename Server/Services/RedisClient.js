require("dotenv").config();
const { createClient } = require('redis');
const lock = require("redis-lock");
const CacheRecord = require("../Models/CacheRecord");

class Redisclient {
    client = null;
    lockClient = null;
    sessionLockMap = null;
    constructor() {
        this.sessionLockMap = new Map();
    }

    instantiate = async () => {
        let client = createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOSTNAME,
                port: process.env.REDIS_PORT
            }
        });
        client.on('error', err => console.log('Redis Client Error', err));
        this.lockClient = lock(client);
        await client.connect();
        this.client = client;
        return this;
    }

    get = async (cacheKey) => {
        const result = await this.client.get(cacheKey.toString());
        return result ? JSON.parse(result).data : null;
    }

    set = async (cacheKey, value, expiry = 20000) => {
        const cacheValue = JSON.stringify(new CacheRecord(value));
        await this.client.set(cacheKey, cacheValue, { EX: expiry });
    }

    lock = async (cacheKey) => {
        this.sessionLockMap.set(cacheKey, await this.lockClient(cacheKey));
    }

    unlock = async (cacheKey) => {
        const unlock = this.sessionLockMap.get(cacheKey);
        this.sessionLockMap.delete(cacheKey);
        if (unlock) unlock();
    }
}

module.exports = Redisclient;