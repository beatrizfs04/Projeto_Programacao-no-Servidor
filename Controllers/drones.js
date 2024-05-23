const express = require('express');
const drones = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Drones
const DronesSchema = SQL.createSchema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [4, 'Tamanho minimo é 4.'],
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: props => '${props.value} não é um endereço de e-mail válido!'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Tamanho minimo é 8.'],
        maxlength: [24, 'Tamanho máximo é 24.'],
    },
    phone: {
        type: Number,
        required: true,
        minlength: [9, 'Tamanho minimo é 9.'],
        maxlength: [12, 'Tamanho máximo é 9.'],
    },
}, "drones")

const DronesDB = SQL.useSchema(DronesSchema, "drones");

// Procura todos os drones na BD
drones.checkDrones = async function(){
    const gotDrones = await DronesDB.find({});
    return gotDrones;
}

module.exports = drones;