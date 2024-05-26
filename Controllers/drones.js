const express = require('express');
const drones = express.Router();
const SQL = require('../Controllers/sql');
const validator = require('validator');

//Schema_Drones
const DronesSchema = SQL.createSchema({
    droneModelo: { 
        type: String, 
        required: true, 
        unique: true 
    },
    pecasDrone: [{
        nomePeca: { 
            type: String, 
            required: true 
        },
        quantidade: { 
            type: Number, 
            required: true 
        }
    }]
}, "drones")

const DronesDB = SQL.useSchema(DronesSchema, "drones");

// Procura todos os drones na BD
drones.checkDrones = async function(){
    const gotDrones = await DronesDB.find({});
    return gotDrones;
}

drones.checkDrone = async function(/* Conteudo a Procurar na Drone */){
    const gotDrone = await DronesDB.find({/* Conteudo a Procurar na Drone */});
    return gotDrone;
}

drones.updateDrone = async function(oldDrone, newDrone){
    const updatedDrone = await DronesDB.findOneAndUpdate(oldDrone, newDrone);
    return updatedDrone;
}

drones.createDrone = async function(newDroneData){
    const newDrone = DronesDB(newDroneData);
    const createdDrone = await newDrone.save();
    return createdDrone;
}

drones.deleteDrone = async function(droneData){
    const deleteDrone = await DronesDB.findOneAndDelete(droneData);
    return deleteDrone;
}

drones.deleteDrones = async function(){
    const deletedDrones = await DronesDB.deleteMany({});
    return deletedDrones;
}

module.exports = drones;