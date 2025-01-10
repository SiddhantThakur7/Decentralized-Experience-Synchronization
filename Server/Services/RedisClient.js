require("dotenv").config();
const { createClient } = require('redis');
const CacheRecord = require("../Models/CacheRecord");

class Redisclient {
    client = null;
    constructor() {
        this.instantiate()
            .then(client => {
                this.client = client;
            })
            .catch(error => console.log(error));
    }

    instantiate = async () => {
        const client = createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOSTNAME,
                port: process.env.REDIS_PORT
            }
        });

        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
        return client;
    }

    get = async (cacheKey) => {
        const result = await this.client.get(cacheKey);
        return result ? JSON.parse(result).data : null;
    }

    set = async (cacheKey, value) => {
        const cacheValue = new CacheRecord(value);
        await this.client.set(cacheKey, cacheValue);
    }
}

module.exports = Redisclient;