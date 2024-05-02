/* Requirements */
const express = require('express');
const SQLExport = express.Router();

/* SQL Connection */
const mongoose = require('mongoose');
const url = "mongodb+srv://rodrigo:paiva001@node-ubi.wadwlsk.mongodb.net/projetops";
const dbName = "progservidor";
const { Schema } = mongoose;

/* Do Connection */
mongoose.connect(url)
var db = mongoose.connection;
db.on('error', console.error.bind(console, '> Can\'t Connected Because of an Error.'));
db.once('open', function callback() { console.log('> Connected Sucessfully to MongoDB.'); });

/* Schema & Data */
var schemaDB = new Schema({
    /* variable: value */
}, { collection: dbName });

const SQL = mongoose.model(dbName, schemaDB); 

/*
    SQL Available Commands:
    > await SQL.find({}) - Procurar Por Toda a Informação Sem Variáveis Específicas
    > await SQL.findOne({ variables }) - Procurar 1 Objeto Pela Variável Específica
    > await SQL.findOne({ variables }, { variables }) - Procurar 1 Objeto Pela Variável Específica e Só Retorna X Objetos
    > const newData = new SQL({ variables }) - Criar 1 Novo Objeto Para Colocar na SQL
    > newData.save(); - Inserir 1 Novo Objeto na SQL Depois de Criado
    » try { newData.save(); res.status(200).send(`Data Inserted Successfully.`); } catch (err) { console.log(err); res.status(500).send({ error: err }) }
    > await SQL.findOneAndUpdate(oldValue, newValue) - Atualizar 1 Linha da Base de Dados Enviando a Antiga e a Nova
    > await SQL.findOneAndDelete(value) - Apagar da Base o Objeto Enviado
    > await SQL.deleteMany({}); - Apagar Todos os Objetos da Base de Dados
*/

SQLExport.get('/', async (req, res) => {
    const gotData = await SQL.find({});
    console.log(gotData);
});

module.exports = SQLExport;