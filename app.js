const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const app = express();
const jsonParser = express.json();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// separate
const usersPath = 'D:\\BTC\\Users123.csv';
const csvWriter = createCsvWriter({
    path: usersPath,
    header: [
        { id: 'id', title: 'Id' },
        { id: 'name', title: 'Name' },
        { id: 'password', title: 'Password' },
        { id: 'created', title: 'Created' },
    ],
    append: true
});
const tokenKey = '1a2b-3c4d-5e6f-7g8h'
//--------

//move to routers ?
app.get('/api/users', (req, res) => {

    let users = []; //add User module // separate method
    fs.createReadStream(usersPath)
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

        let users = []; //add User module // separate method
        fs.createReadStream(usersPath)
        .pipe(csv())
        .on('data', (row) => {
            users.push(row);
        })
        .on('end', async () => {
            if (users.some(e => e.Name === name)) {
                
                res.status(400).send("User with such name exists");
            }
            else {
                // User obj
                const user = {
                    id: uuid.v4(),
                    name: name,
                    password: pass,
                    created: Date.now()
                };

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

        let users = []; //add User module // separate method
        fs.createReadStream(usersPath)
        .pipe(csv())
        .on('data', (row) => {
            users.push(row);
        })
        .on('end', async () => {
            const user = users.find(e => e.Name === name && e.Password === pass);

            if (user) {
                const response = {
                    id: user.Id,
                    name: user.Name,
                    token: jwt.sign({ id: user.id }, tokenKey)
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

app.listen(3000);