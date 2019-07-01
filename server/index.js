const keys = require('./keys.js');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const {Pool} = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('error', () => console.log('lost pg connection'));

pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch(e => console.log('error', e));

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();


app.get('/', (req,res) => {
    res.send('hi');
})

app.get('/values/all', async (req,res) => {
    const values = await pgClient.query('SELECT * FROM values');
    res.send(values.rows);
})

app.get('/values/current', async (req,res) => {
    const values = await redisClient.hgetall('values', (err, vals) => {
        res.send(vals);
    });
})

app.post('/values', async (req,res) => {
    const {index} = req.body;
    console.log('------------------------------------------');
    console.log('index ',index);
    console.log('------------------------------------------');
    if (parseInt(index) > 40) return res.status(422).send('index too high to calculate today')
    // set up a placeholder for the new index value
    redisClient.hset('values', index, 'nothing yet');
    // send 'insert' event message to the worker
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({working: true});
})

app.listen(5000, err => console.log('listening'))