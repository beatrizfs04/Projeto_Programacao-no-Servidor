const express = require('express');
const users = express.Router();
const SQL = require('../Controllers/sql');

/* const UsersSchema = SQL.createSchema({
    username: String,
})

const UsersDB = SQL.useSchema(UsersSchema);*/


// Procura todos os utilizadores na BD
users.checkUsers = async function(){
    const gotUsers = await UsersDB.find({});
    return gotUsers;
}

// Procura um utilizador na BD pelo seu username
users.checkUser = async function(username){
    const gotUser = await UsersDB.find({username});
    return gotUser;
}

// Atualiza um utilizador na BD pelos valores no body
users.updateUser = async function(oldUser, newUser){
    const updatedUser = await UsersDB.findOneAndUpdate(oldUser, newUser);
    return updatedUser;
}

// Cria um utilizador na BD pelos valores no body
users.createUser = async function(newUserData){
    const newUser = UsersDB({username: newUserData.username, email: newUserData.email, password: newUserData.password, phone: newUserData.phone});
    const createdUser = await newUser.save();
    return createdUser;
}

// Apaga um utilizador da BD pelo seu username
users.deleteUser = async function(username){
    const deletedUser = await UsersDB.findOneAndDelete(username);
    return deletedUser;
}

// Apaga todos os utilizadores da BD
users.deleteUsers = async function(){
    const deletedUsers = await UsersDB.deleteMany({});
    return deletedUsers;
}

module.exports = users;