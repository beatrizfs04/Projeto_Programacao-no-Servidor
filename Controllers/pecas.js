const express = require('express');
const pecas = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Pecas
const PecasSchema = SQL.createSchema({
}, "pecas")

const PecasDB = SQL.useSchema(PecasSchema, "pecas");

// Procura todos as peças na BD
pecas.checkPecas = async function(){
    const gotPecas = await PecasDB.find({});
    return gotPecas;
}

module.exports = pecas;