const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const https = require('https');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const config = require('./config');
const User = require('./user');

const app = express();
const jsonParser = express.json();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
    path: config.tables.users.usersPath,
    header: config.tables.users.headers,
    append: true
});

app.get('/api/users', (req, res) => {

    let users = [];
    fs.createReadStream(config.tables.users.usersPath)
    .pipe(csv())
    .on('data', (row) => {
        users.push(row);
    })
    .on('end', () => {
        res.send(users);
    });
});

app.post('/api/create', jsonParser, (req, res) => {

    if(!req.body)
        return res.sendStatus(400);

    const name = req.body.name;
    const pass = req.body.password;

    if (name && pass) {

        let users = [];
        fs.createReadStream(config.tables.users.usersPath)
        .pipe(csv())
        .on('data', (row) => {          
            users.push(row);
        })
        .on('end', async () => {

            if (users.some(e => e.Name === name)) {                
                res.status(400).send("User with such name exists");
            }
            else {
                const user = new User(uuid.v4(), name, pass, Date.now());
                await csvWriter.writeRecords([user]);
                res.send(user.id);
            }
        })
    }
    else
        res.status(400).send("Wrong data");
});

app.post('/api/login', jsonParser, (req, res) => {

    if(!req.body)
        return res.sendStatus(400);

    const name = req.body.name;
    const pass = req.body.password;

    if (name && pass) {

        let users = [];
        fs.createReadStream(config.tables.users.usersPath)
        .pipe(csv())
        .on('data', (row) => {                      
            users.push(row);
        })
        .on('end', () => {

            const user = users.find(e => e.Name === name && e.Password === pass);

            if (user) {
                const response = {
                    id: user.Id,
                    name: user.Name,
                    token: jwt.sign({ id: user.id }, config.tokenKey)
                };
                res.status(200).send(response);
            }
            else
                res.status(404).send("User with such name doesn't exist");
        })
    }
    else
        res.status(400).send("Wrong data");
});

app.get('/api/btcRate', (req, res) => {

    const authHeader = req.headers.authorization;

    if (authHeader) {
        jwt.verify(
            authHeader.split(' ')[1],
            config.tokenKey,
            (error, decoded) => {

                if (error)
                    res.status(400).send('Invalid token');

                if (decoded) {

                    const options = {
                        method: 'GET',
                        hostname: 'rest.coinapi.io',
                        path: '/v1/exchangerate/BTC/UAH',
                        headers: {'X-CoinAPI-Key': '36841ECC-2E4A-41ED-92BE-68372717978D'}
                    };
                    
                    const coinReq = https.request(options, (coinRes) => {
                        
                        let chunks = [];

                        coinRes.on('data', (d) => {
                            chunks.push(d);
                        });

                        coinRes.on('end', () => {
                            if (coinRes.statusCode != 200) {
                                res.status(500).send('There might be an issue with coinapi.io');
                              } else {
                                  const info = JSON.parse(chunks.toString());
                                  res.send(`BTC rate: ${info['rate']}`);
                              }
                        });
                    });

                    coinReq.on('error', (e) => {
                        console.error(e);
                    });
                    coinReq.end();
                }
            }
        )
    }
    else
        res.status(401).send();
})

app.listen(config.port, config.host, () =>
console.log(`Server listens to http://${config.host}:${config.port}`));