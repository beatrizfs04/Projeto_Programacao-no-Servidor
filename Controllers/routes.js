/* Requirements */
const express = require('express');
const routes = express.Router();
const SQL = require('sql');

routes.get('/', async (req, res) => {
    const gotData = await SQL.find({});
    console.log(gotData);
});

module.exports = routes;