const express = require('express');
const montagens = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Montagens

// Define the Montagens Schema
const MontagensSchema = SQL.createSchema({
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
                    return PecasDB.findOne({ nomePeca: v }).then(peca => Boolean(peca)); // verifica ao criar uma montagem se a peca realmente existe, se sim permite fazer uma montagem
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


const MontagensDB = SQL.useSchema(MontagensSchema, "montagens");

// Procura todos as peças na BD
montagens.checkMontagens = async function() {
    try {
        const gotMontagens = await MontagensDB.find({});
        return gotMontagens;
    } catch (err) {
        throw new Error(`Erro ao procurar todas as montagens: ${err.message}`);
    }
};

// Verificar montagem individual
montagens.checkMontagem = async function(droneModel, workerName, startDate) {
    try {
        const gotMontagem = await MontagensDB.findOne({ droneModel, workerName, startDate });
        return gotMontagem;
    } catch (err) {
        throw new Error(`Erro ao procurar a montagem: ${err.message}`);
    }
};

// Update montagem
montagens.updateMontagem = async function(oldMontagem, newMontagem) {
    const session = await MontagensDB.startSession();
    session.startTransaction();
    
    try {
        // Fetch the old montagem data
        const existingMontagem = await MontagensDB.findOne(oldMontagem).session(session);
        if (!existingMontagem) {
            throw new Error("Montagem não encontrada");
        }

        // Calculate the difference in parts usage
        const oldPartsUsage = existingMontagem.pecasUsadas.reduce((acc, peca) => {
            acc[peca.nomePeca] = peca.quantidade;
            return acc;
        }, {});

        const newPartsUsage = newMontagem.pecasUsadas.reduce((acc, peca) => {
            acc[peca.nomePeca] = peca.quantidade;
            return acc;
        }, {});

        const partsToCheck = new Set([...Object.keys(oldPartsUsage), ...Object.keys(newPartsUsage)]);

        // Verificar o estoque de cada peça a ser usada na montagem
        for (let nomePeca of partsToCheck) {
            const oldQuantity = oldPartsUsage[nomePeca] || 0;
            const newQuantity = newPartsUsage[nomePeca] || 0;
            const difference = newQuantity - oldQuantity;

            if (difference > 0) {
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
                // Return stock for removed parts
                await PecasDB.updateOne(
                    { nomePeca },
                    { $inc: { quantidade: -difference } }, // Incrementar negativamente
                    { session }
                );
            }
        }

        // Update the montagem
        const updatedMontagem = await MontagensDB.findOneAndUpdate(oldMontagem, newMontagem, { new: true, session });

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
montagens.createMontagem = async function(newMontagemData) {
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
montagens.deleteMontagem = async function(montagemData) {
    try {
        const deletedMontagem = await MontagensDB.findOneAndDelete(montagemData);
        if (!deletedMontagem) {
            throw new Error("Montagem não encontrada");
        }
        return deletedMontagem;
    } catch (err) {
        throw new Error(`Erro ao apagar a montagem: ${err.message}`);
    }
};

//Apagar todas montagens
montagens.deleteMontagens = async function(){
    const deletedMontagens = await MontagensDB.deleteMany({});
    return deletedMontagens;
};

module.exports = montagens;