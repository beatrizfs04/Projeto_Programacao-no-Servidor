const express = require('express');
const montagens = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

const Pecas = require('../Controllers/pecas');
const Drones = require('../Controllers/drones');

const PecasDB = SQL.useSchema(Pecas.PecasSchema, "pecas");
const DronesDB = SQL.useSchema(Drones.DronesSchema, "drones");
//Schema_Montagens

// Define the Montagens Schema
montagens.MontagensSchema = SQL.createSchema({
    droneModel: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                return DronesDB.findOne({ droneModelo: v }).then(drone => Boolean(drone)); // Verifica ao criar uma montagem se o droneModel existe na dos drones, se sim permite fazer uma montagem
            },
            message: props => `Modelo de drone ${props.value} não existe!`
        }
    },
    workerName: { 
        type: String, 
        required: true,
        maxlength: [50, 'Tamanho máximo é 50.']
    },
    creatorId: { 
        type: String, 
        required: true,
    },
    startDate: { 
        type: Date, 
        required: true
    },
    endDate: { 
        type: Date 
    },
    pecasUsadas: [{
        nomePeca: { 
            type: String, 
            required: true,
            validate: {
                validator: function(v) {
                    return PecasDB.findOne({ nomePeca: v }).then(peca => Boolean(peca));
                },
                message: props => `Peça ${props.value} não existe!`
            }
        },
        quantidade: { 
            type: Number, 
            required: true 
        }
    }]
}, "montagens");


const MontagensDB = SQL.useSchema(montagens.MontagensSchema, "montagens");

// Procura todos as peças na BD
montagens.getAllMontagens = async function() {
    try {
        const gotMontagens = await MontagensDB.find({});
        return gotMontagens;
    } catch (err) {
        throw new Error(`Erro ao procurar todas as montagens: ${err.message}`);
    }
};

// Verificar montagem individual
montagens.getMontagemById = async function(montagemId) {
    try {
        const montagem = await MontagensDB.findOne({ _id: montagemId });
        if(montagem) return montagem;
        return false;
    } catch (err) {
        throw new Error(`Erro ao procurar a montagem: ${err.message}`);
    }
};

// Update montagem
montagens.updateMontagemById = async function(montagemId, newMontagem, user) {

    // newMontagem.startDate = Date.now(); // Atualizar a start date ? Por ventura não

    const session = await MontagensDB.startSession();
    session.startTransaction();
    
    try {
        // Obter dados da montagem antiga
        const existingMontagem = await MontagensDB.findOne({_id: montagemId}).session(session);
        if (!existingMontagem) {
            throw new Error("Montagem não encontrada");
        }

        if (existingMontagem['creatorId'] != user.id) {
            const err = new Error('You can\' edit other builds!');
            err.status = 401;
            throw err;
        }
        



        // Calcular a diferença nas partes usadas
        const oldPartsUsage = existingMontagem.pecasUsadas.reduce((acc, peca) => {
            acc[peca.nomePeca] = peca.quantidade;
            return acc;
        }, {});

        const newPartsUsage = newMontagem.pecasUsadas.reduce((acc, peca) => {
            acc[peca.nomePeca] = peca.quantidade;
            return acc;
        }, {});

        const partsToCheck = new Set([...Object.keys(oldPartsUsage), ...Object.keys(newPartsUsage)]); // Criar um set com as keys das peças para depois averiguarmos cada para fazer calculos com o stock

        // Verificar o estoque de cada peça a ser usada na montagem
        for (let nomePeca of partsToCheck) {
            const oldQuantity = oldPartsUsage[nomePeca] || 0;
            const newQuantity = newPartsUsage[nomePeca] || 0;
            const difference = newQuantity - oldQuantity;

            if (difference > 0) {
                // Remover peças adicionais do stock
                const peca = await PecasDB.findOne({ nomePeca }).session(session);
                if (!peca) {
                    throw new Error(`Peça ${nomePeca} não existe no stock.`);
                }

                if (peca.quantidade < difference) {
                    throw new Error(`Peça ${nomePeca} não tem stock suficiente. Necessário: ${difference}, Disponível: ${peca.quantidade}.`);
                }

                
                await PecasDB.updateOne(
                    { nomePeca },
                    { $inc: { quantidade: -difference } },
                    { session }
                );
            } else if (difference < 0) {
                // Devolver stock das peças removidas
                await PecasDB.updateOne(
                    { nomePeca },
                    { $inc: { quantidade: -difference } }, // Incrementar negativamente
                    { session }
                );
            }
        }

        if (newMontagem.finished) {
            const finishDate = Date.now();
            newMontagem = {
                droneModel: newMontagem.droneModel, 
                workerName: newMontagem.workerName,
                endDate: finishDate,
                pecasUsadas: newMontagem.pecasUsadas
            }
        } else {
            newMontagem = {
                droneModel: newMontagem.droneModel, 
                workerName: newMontagem.workerName, 
                pecasUsadas: newMontagem.pecasUsadas
            }
        }

        // Atualizar a montagem
        const updatedMontagem = await MontagensDB.findOneAndUpdate({_id: montagemId}, newMontagem, { new: true, session });

        await session.commitTransaction();
        session.endSession();

        return updatedMontagem;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

// Criar montagem
montagens.createMontagem = async function(newMontagemData, user) {
    newMontagemData.startDate = Date.now(); // Data da montagem inicial de agora
    newMontagemData.creatorId = user.id;
    // Verificar o estoque de cada peça a ser usada na montagem
    for (let i = 0; i < newMontagemData.pecasUsadas.length; i++) {
        const pecaUsada = newMontagemData.pecasUsadas[i];
        const peca = await PecasDB.findOne({ nomePeca: pecaUsada.nomePeca });

        if (!peca) {
            throw new Error(`Peça ${pecaUsada.nomePeca} não existe no stock.`);
        }

        if (peca.quantidade < pecaUsada.quantidade) {
            throw new Error(`Peça ${pecaUsada.nomePeca} não tem stock suficiente. Necessário: ${pecaUsada.quantidade}, Disponível: ${peca.quantidade}.`);
        }
    }

    // Se o stock for suficiente
    const session = await MontagensDB.startSession();
    session.startTransaction();
    try {
        for (let i = 0; i < newMontagemData.pecasUsadas.length; i++) {
            const pecaUsada = newMontagemData.pecasUsadas[i];
            await PecasDB.updateOne(
                { nomePeca: pecaUsada.nomePeca },
                { $inc: { quantidade: -pecaUsada.quantidade } }, // Incrementa negativamente as peças para reduzir a quantidade
                { session }
            );
        }

        const newMontagem = new MontagensDB(newMontagemData);
        const createdMontagem = await newMontagem.save({ session });

        await session.commitTransaction();
        session.endSession();
        return createdMontagem;
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

// Apagar montagem
montagens.deleteMontagemById = async function(montagemId) {
    try {
        const deletedMontagem = await MontagensDB.findOneAndDelete({_id: montagemId});
        if (!deletedMontagem) {
            throw new Error("Montagem não encontrada");
        }
        return deletedMontagem;
    } catch (err) {
        throw new Error(`Erro ao apagar a montagem: ${err.message}`);
    }
};

//Apagar todas montagens
montagens.deleteAllMontagens = async function(){
    const deletedMontagens = await MontagensDB.deleteMany({});
    return deletedMontagens;
};

montagens.getTempoMontagem = async function(montagemId) {
    const gotMontagem = await MontagensDB.findOne({_id: montagemId});
    if (!gotMontagem.endDate) { throw new Error(`A Montagem Com o ID ${montagemId} Não Foi Concluída.`)}
    const TimeInDays = Math.round((gotMontagem.endDate.getTime() - gotMontagem.startDate.getTime())/(1000 * 3600 * 24));
    if (TimeInDays > 1) {
        return (`O Tempo de Montagem Foi de: ${TimeInDays} Dias<br/>Com o ID: ${montagemId}<br/>Para o Modelo: ${gotMontagem.droneModel}`);
    } else {
        const TimeInHours = Math.round((gotMontagem.endDate.getTime() - gotMontagem.startDate.getTime())/(1000 * 3600));
        return (`O Tempo de Montagem Foi de: ${TimeInHours} Horas<br/>Com o ID: ${montagemId}<br/>Para o Modelo: ${gotMontagem.droneModel}`);
    }
}


montagens.getPecasUtilizacao = async function() {
    try {
        const gotMontagens = await MontagensDB.find({});
        const listaPecas = {};
        gotMontagens.forEach(montagem => {
            montagem.pecasUsadas.forEach(pecaUsada => {
                if (listaPecas[pecaUsada.nomePeca]) {
                    listaPecas[pecaUsada.nomePeca] += pecaUsada.quantidade;
                } else {
                    listaPecas[pecaUsada.nomePeca] = pecaUsada.quantidade;
                }
            });
        });

        return listaPecas;
    } catch (err) {
        throw new Error(`Erro ao procurar peças usadas: ${err.message}`);
    }
};

montagens.getPecaMaisUtilizada = async function() {
    try {
        const gotMontagens = await MontagensDB.find({});
        var pecaMaisUtilizada = {};
        const listaPecas = {};
        gotMontagens.forEach(montagem => {
            montagem.pecasUsadas.forEach(pecaUsada => {
                if (listaPecas[pecaUsada.nomePeca]) {
                    listaPecas[pecaUsada.nomePeca] += pecaUsada.quantidade;
                } else {
                    listaPecas[pecaUsada.nomePeca] = pecaUsada.quantidade;
                }
            });
        });

        for (const peca in listaPecas) {
            if (pecaMaisUtilizada.quantidade < listaPecas[peca]) {
                pecaMaisUtilizada = { nome: peca, quantidade: listaPecas[peca] };
            } else if (Object.keys(pecaMaisUtilizada).length === 0) {
                pecaMaisUtilizada = { nome: peca, quantidade: listaPecas[peca] };
            }
        }
        
        
        return pecaMaisUtilizada;
    } catch (err) {
        throw new Error(`${err.message}`);
    }
};


montagens.getPecaMenosUtilizada = async function() {
    try {
        const gotMontagens = await MontagensDB.find({});
        var pecaMenosUtilizada = {};
        const listaPecas = {};
        gotMontagens.forEach(montagem => {
            montagem.pecasUsadas.forEach(pecaUsada => {
                if (listaPecas[pecaUsada.nomePeca]) {
                    listaPecas[pecaUsada.nomePeca] += pecaUsada.quantidade;
                } else {
                    listaPecas[pecaUsada.nomePeca] = pecaUsada.quantidade;
                }
            });
        });

        for (const peca in listaPecas) {
            if (pecaMenosUtilizada.quantidade > listaPecas[peca]) {
                pecaMenosUtilizada = { nome: peca, quantidade: listaPecas[peca] };
            } else if (Object.keys(pecaMenosUtilizada).length === 0) {
                pecaMenosUtilizada = { nome: peca, quantidade: listaPecas[peca] };
            }
        }
        
        
        return pecaMenosUtilizada;
    } catch (err) {
        throw new Error(`${err.message}`);
    }
};

//---------------------Drones---------------
//----ver o user que mais montou drones 
montagens.getUserMaisProduziu = async function(){
    try{
        const userProducao = [
            {$group: {_id: "$creatorId", totalDrones: { $sum: 1 }}},
            {$sort: { totalDrones: -1 }}
    ];
    const topUsers = await MontagensDB.aggregate(userProducao);
    return topUsers; 
    }catch (err){
        throw new Error(`Erro ao procurar user que mais produziram drones: ${err.message}`);
    }
}

montagens.getUserMenosProduziu = async function(limit = 10) {
    try {
        const userProducao = [
            {$group: {_id: "$creatorId", totalDrones: { $sum: 1 }}},
            {$sort: { totalDrones: 1 }}
        ];
        const bottomUsers = await MontagensDB.aggregate(userProducao);
        return bottomUsers;
    } catch (err) {
        throw new Error(`Erro ao procurar users que menos produziram drones: ${err.message}`);
    }
};

montagens.getMontagensTrabalhador = async function(workerName){
    try{
        const workerMontagens = await MontagensDB.find({workerName: workerName});
        return (`O Trabalhador ${workerName} Fez ao Todo ${workerMontagens.length} Montagens!`); 
    }catch (err){
        throw new Error(`Erro ao procurar montagens feitas pelo trabalhador: ${err.message}`);
    }
}

montagens.getMontagensTrabalhadores = async function(){
    try{
        const workersMontagens = await MontagensDB.find({});
        var montagensCount = {};

        for (let i = 0; i < workersMontagens.length; i++) {
            const workerName = workersMontagens[i].workerName;

            if (!montagensCount[workerName]) {
                montagensCount[workerName] = 1;
            } else {
                montagensCount[workerName]++;
            }
        }
        var montagensText = "";
        for (let workerName in montagensCount) {
            if (montagensCount.hasOwnProperty(workerName)) {
                montagensText += `O Trabalhador ${workerName} Fez ao Todo ${montagensCount[workerName]} Montagens<br />`;
            }
        }
        return montagensText;
    }catch (err){
        throw new Error(`Erro ao procurar montagens feitas pelo trabalhador: ${err.message}`);
    }
}

module.exports = montagens;