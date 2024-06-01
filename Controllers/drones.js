const express = require('express');
const drones = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Drones
drones.DronesSchema = SQL.createSchema({
    droneModelo: { 
        type: String, 
        required: true, 
        unique: true,
        maxlength: [25, 'Tamanho máximo é 25.']
    },
    pecasDrone: [{
        nomePeca: { 
            type: String, 
            required: true,
            maxlength: [25, 'Tamanho máximo é 25.']
        },
        quantidade: { 
            type: Number, 
            required: true 
        }
    }]
}, "drones")

const DronesDB = SQL.useSchema(drones.DronesSchema, "drones");

// Procura todos os drones na BD
drones.getAllDrones = async function(){
    const gotDrones = await DronesDB.find({});
    return gotDrones;
}

drones.getDronebyId = async function(droneId){
    const gotDrone = await DronesDB.findOne({_id: droneId});
    return gotDrone;
}

drones.updateDrone = async function(droneId, newDroneData){
    const updatedDrone = await DronesDB.findOneAndUpdate({_id: droneId}, newDroneData, {new: true});
    return updatedDrone;
}

drones.createDrone = async function(newDroneData){
    const newDrone = DronesDB(newDroneData);
    const createdDrone = await newDrone.save();
    return createdDrone;
}

drones.deleteDroneById = async function(droneId){
    const deleteDrone = await DronesDB.findOneAndDelete({_id: droneId});
    return deleteDrone;
}


drones.deleteAllDrones = async function(){
    const deletedDrones = await DronesDB.deleteMany({});
    return deletedDrones;
}

module.exports = drones;