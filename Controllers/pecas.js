const express = require('express');
const pecas = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Pecas

const PecasSchema = SQL.createSchema({
    nomePeca: {
        type: String,
        required: true,
        maxlength: [25, 'Tamanho máximo é 25.']
    },
    quantidade: {
        type: Number,
        required: true
    }
}, "pecas")

const PecasDB = SQL.useSchema(PecasSchema, "pecas");

// Procura todos as peças na BD
pecas.checkPecas = async function () {
    try {
        const gotPecas = await PecasDB.find({});
        return gotPecas;
    } catch (err) {
        throw err;
    }
}

pecas.checkPeca = async function (nomePeca) {
    try {
        const gotPeca = await PecasDB.findOne({ nomePeca: nomePeca });
        return gotPeca;
    } catch (err) {
        throw err;
    }
}

pecas.updatePeca = async function (oldPeca, newPeca) {
    try {
        const updatedPeca = await PecasDB.findOneAndUpdate(oldPeca, newPeca, { new: true }); // New: true para retornar a peça atualizada, caso contrário retorna a antiga
        return updatedPeca;
    } catch (err) {
        throw err;
    }
}

pecas.createPeca = async function (newPecaData) {
    try {
        const newPeca = PecasDB(newPecaData);
        const createdPeca = await newPeca.save();
        return createdPeca;
    } catch (err) {
        throw err;
    }
}

pecas.deletePeca = async function (nomePeca) {
    try {
        const deletedPeca = await PecasDB.findOneAndDelete(nomePeca);
        return deletedPeca;
    } catch (err) {
        throw err;
    }
}

pecas.deletePecas = async function () {
    try {
        const deletedPecas = await PecasDB.deleteMany({});
        return deletedPecas;
    } catch (err) {
        throw err;
    }
}

module.exports = pecas;