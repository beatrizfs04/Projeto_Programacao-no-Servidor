const express = require('express');
const drones = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Drones
const DronesSchema = SQL.createSchema({
}, "drones")

const DronesDB = SQL.useSchema(DronesSchema, "drones");

// Procura todos os drones na BD
drones.checkDrones = async function(){
    const gotDrones = await DronesDB.find({});
    return gotDrones;
}

module.exports = drones;