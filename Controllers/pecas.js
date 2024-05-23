const express = require('express');
const pecas = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Pecas
const PecasSchema = SQL.createSchema({
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
}, "pecas")

const PecasDB = SQL.useSchema(PecasSchema, "pecas");

// Procura todos as peças na BD
pecas.checkPecas = async function(){
    const gotPecas = await PecasDB.find({});
    return gotPecas;
}

module.exports = pecas;