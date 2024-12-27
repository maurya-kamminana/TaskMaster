const redis = require('redis');

const client = redis.createClient({
    url: 'redis://127.0.0.1:6379',
});

client.on('connect', () => console.log('Redis connected successfully'));
client.on('error', (err) => console.error('Redis error:', err));

(async () => {
    try {
        await client.connect(); // Connect returns a promise
    } catch (error) {
        console.error('Error connecting to Redis:', error);
    }
})();

module.exports = client;
