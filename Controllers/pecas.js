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
pecas.checkPecas = async function(){
    const gotPecas = await PecasDB.find({});
    return gotPecas;
}

pecas.checkPeca = async function(nomePeca){
    const gotPeca = await PecasDB.find({peca: nomePeca});
    return gotPeca;
}

pecas.updatePeca = async function(oldPeca, newPeca){
    const updatedPeca = await PecasDB.findOneAndUpdate(oldPeca, newPeca);
    return updatedPeca;
}

pecas.createPeca = async function(newPecaData){
    const newPeca = PecasDB(newPecaData);
    const createdPeca = await newPeca.save();
    return createdPeca;
}

pecas.deletePeca = async function(nomePeca){
    const deletedPeca = await PecasDB.findOneAndDelete(nomePeca);
    return deletedPeca;
}

pecas.deletePecas = async function(){
    const deletedPecas = await PecasDB.deleteMany({});
    return deletedPecas;
}

module.exports = pecas;