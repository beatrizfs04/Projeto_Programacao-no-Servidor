const express = require('express');
const users = express.Router();
const SQL = require('../Controllers/sql');

//Schema_Users
const UsersSchema = SQL.createSchema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: [8, 'Tamanho minimo é 8.'],
        maxlength: [64, 'Tamanho máximo é 64.'],
    },
    email: {
        type: String,
        required: true,
        maxlength: [255, 'Tamanho máximo é 255.'],
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} não é um endereço de e-mail válido!'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: [8, 'Tamanho minimo é 8.'],
        maxlength: [20, 'Tamanho máximo é 20.'],
    },
    phone: {
        type: Number,
        required: true,
        minlength: [9, 'Tamanho minimo é 9.'],
        maxlength: [9, 'Tamanho máximo é 9.'],
    },
})

const UsersDB = SQL.useSchema(UsersSchema);


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