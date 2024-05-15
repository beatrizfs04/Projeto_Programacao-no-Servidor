/* Requirements */
const express = require('express');
const routes = express.Router();
const SQL = require('../Controllers/sql');
const Users = require('../Controllers/users');

routes.get('/', async (req, res) => {
    const gotData = await SQL.find({});
    console.log(gotData);
});

routes.get('/users', async (req, res) => {
    const gotUsers = Users.checkUsers();
    res.json(gotUsers);
})

module.exports = routes;