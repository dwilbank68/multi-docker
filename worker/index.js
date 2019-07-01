const keys = require('./keys.js');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
})

const sub = redisClient.duplicate();

function fib(idx) {
    if (idx < 2) return 1;
    return fib(idx -1) + fib(idx-2);
}

sub.on('message', (chan, msg) => {
    console.log('------------------------------------------');
    console.log('message ', msg);
    console.log('------------------------------------------');
    redisClient.hset('values', msg, fib(parseInt(msg)))
})
sub.subscribe('insert');