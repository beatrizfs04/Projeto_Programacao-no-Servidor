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
drones.checkDrones = async function(){
    const gotDrones = await DronesDB.find({});
    return gotDrones;
}

drones.checkDrone = async function(droneModel){
    const gotDrone = await DronesDB.findOne({droneModelo: droneModel});
    return gotDrone;
}

drones.updateDrone = async function(oldDrone, newDrone){
    const updatedDrone = await DronesDB.findOneAndUpdate(oldDrone, newDrone, {new: true});
    return updatedDrone;
}

drones.createDrone = async function(newDroneData){
    const newDrone = DronesDB(newDroneData);
    const createdDrone = await newDrone.save();
    return createdDrone;
}

drones.deleteDrone = async function(droneData){
    const deleteDrone = await DronesDB.findOneAndDelete({droneModelo: droneData});
    return deleteDrone;
}

drones.deleteDrones = async function(){
    const deletedDrones = await DronesDB.deleteMany({});
    return deletedDrones;
}

module.exports = drones;