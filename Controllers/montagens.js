const express = require('express');
const montagens = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Montagens
const MontagensSchema = SQL.createSchema({
}, "montagens")

const MontagensDB = SQL.useSchema(MontagensSchema, "montagens");

// Procura todos as peças na BD
montagens.checkMontagens = async function(){
    const gotMontagens = await MontagensDB.find({});
    return gotMontagens;
}

montagens.checkMontagem = async function(/* Conteudo a Procurar na Montagem */){
    const gotMontagem = await MontagensDB.find({/* Conteudo a Procurar na Montagem */});
    return gotMontagem;
}

montagens.updateMontagem = async function(oldMontagem, newMontagem){
    const updatedMontagem = await MontagensDB.findOneAndUpdate(oldMontagem, newMontagem);
    return updatedMontagem;
}

montagens.createMontagem = async function(newMontagemData){
    const newMontagem = MontagensDB(newMontagemData);
    const createdMontagem = await newMontagem.save();
    return createdMontagem;
}

montagens.deleteMontagem = async function(montagemData){
    const deletedMontagem = await MontagensDB.findOneAndDelete(montagemData);
    return deletedMontagem;
}

montagens.deleteMontagens = async function(){
    const deletedMontagens = await MontagensDB.deleteMany({});
    return deletedMontagens;
}

module.exports = montagens;