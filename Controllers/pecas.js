const express = require('express');
const pecas = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Pecas
pecas.PecasSchema = SQL.createSchema({
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

const PecasDB = SQL.useSchema(pecas.PecasSchema, "pecas");

// Procura todos as peças na BD
pecas.getAllPecas = async function () {
    try {
        const gotPecas = await PecasDB.find({});
        return gotPecas;
    } catch (err) {
        throw err;
    }
}

pecas.getPecaById = async function (pecaId) {
    try {
        const gotPeca = await PecasDB.findOne({ _id: pecaId });
        return gotPeca;
    } catch (err) {
        throw err;
    }
}

pecas.updatePecaById = async function (pecaId, newPeca) {
    try {
        const updatedPeca = await PecasDB.findOneAndUpdate({_id: pecaId}, newPeca, { new: true }); // New: true para retornar a peça atualizada, caso contrário retorna a antiga
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

pecas.deletePecaById = async function (pecaId) {
    try {
        const deletedPeca = await PecasDB.findOneAndDelete({_id: pecaId});
        return deletedPeca;
    } catch (err) {
        throw err;
    }
}

pecas.deleteAllPecas = async function () {
    try {
        const deletedPecas = await PecasDB.deleteMany({});
        return deletedPecas;
    } catch (err) {
        throw err;
    }
}

module.exports = pecas;